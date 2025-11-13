from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flasgger import Swagger
from database import SessionLocal, engine
from services.user_service import UserService
from services.recipe_service import RecipeService
from services.comment_service import CommentService
from utils.jwt_utils import generate_token, token_required
from sqlalchemy.exc import ProgrammingError
from swagger_config import swagger_config, swagger_template
from prometheus_flask_exporter import PrometheusMetrics
import logging
import json
import uuid
from datetime import datetime

app = Flask(__name__)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
    
    def log(self, level, message, **kwargs):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': level,
            'message': message,
            'service': 'recipe-api',
            **kwargs
        }
        self.logger.log(getattr(logging, level), json.dumps(log_entry))

logger = StructuredLogger(__name__)

# Initialize Prometheus metrics
metrics = PrometheusMetrics(app)

# Custom metrics
recipe_operations = metrics.counter(
    'recipe_operations_total',
    'Total recipe operations',
    labels={'operation': lambda: getattr(g, 'operation_type', 'unknown')}
)

comment_operations = metrics.counter(
    'comment_operations_total',
    'Total comment operations',
    labels={'operation': lambda: getattr(g, 'operation_type', 'unknown')}
)

user_operations = metrics.counter(
    'user_operations_total',
    'Total user operations',
    labels={'operation': lambda: getattr(g, 'operation_type', 'unknown')}
)

# Request/Response logging middleware
@app.before_request
def log_request():
    g.correlation_id = str(uuid.uuid4())
    logger.log('INFO', 'Incoming request',
               correlation_id=g.correlation_id,
               method=request.method,
               path=request.path,
               remote_addr=request.remote_addr)

@app.after_request
def log_response(response):
    logger.log('INFO', 'Response sent',
               correlation_id=getattr(g, 'correlation_id', 'unknown'),
               status_code=response.status_code,
               content_length=response.content_length)
    return response

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Swagger UI
swagger = Swagger(app, config=swagger_config, template=swagger_template)

@app.route('/')
def home():
    """
    Home endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: Welcome message
        schema:
          type: object
          properties:
            message:
              type: string
              example: ¡Welcome!
            status:
              type: string
              example: running
    """
    return jsonify({"message": "¡Welcome!", "status": "running"})

@app.route('/health')
def health():
    """
    Basic health check endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: System health status with timestamp
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            timestamp:
              type: string
              example: 2025-11-12T10:30:00.000000
    """
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route('/healthz/live')
def liveness():
    """
    Liveness probe - is the app running?
    ---
    tags:
      - Health
    responses:
      200:
        description: Application is alive
        schema:
          type: object
          properties:
            status:
              type: string
              example: alive
    """
    return jsonify({"status": "alive"}), 200

@app.route('/healthz/ready')
def readiness():
    """
    Readiness probe - is the app ready to serve traffic?
    ---
    tags:
      - Health
    responses:
      200:
        description: Application is ready
        schema:
          type: object
          properties:
            status:
              type: string
              example: ready
            checks:
              type: object
              properties:
                database:
                  type: string
                  example: ok
      503:
        description: Application is not ready
        schema:
          type: object
          properties:
            status:
              type: string
              example: not_ready
            checks:
              type: object
            error:
              type: string
    """
    try:
        # Check database connectivity
        db = SessionLocal()
        db.execute('SELECT 1')
        db.close()
        return jsonify({
            "status": "ready",
            "checks": {
                "database": "ok"
            }
        }), 200
    except Exception as e:
        logger.log('ERROR', 'Readiness check failed',
                   error=str(e),
                   correlation_id=getattr(g, 'correlation_id', 'unknown'))
        return jsonify({
            "status": "not_ready",
            "checks": {
                "database": "failed"
            },
            "error": str(e)
        }), 503

@app.route('/protected')
@token_required
def protected_route(current_user):
    """
    Protected route example - requires JWT authentication
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Successfully authenticated
        schema:
          type: object
          properties:
            message:
              type: string
              example: Hello John Doe!
            user_id:
              type: integer
              example: 1
            email:
              type: string
              example: john@example.com
      401:
        description: Unauthorized - missing or invalid token
        schema:
          $ref: '#/definitions/Error'
    """
    return jsonify({
        "message": f"Hello {current_user['username']}!",
        "user_id": current_user['user_id'],
        "email": current_user['email']
    }), 200

@app.route('/users', methods=['GET'])
def get_users():
    """
    Get all users
    ---
    tags:
      - Users
    responses:
      200:
        description: List of all users
        schema:
          type: array
          items:
            $ref: '#/definitions/User'
      500:
        description: Server error
        schema:
          $ref: '#/definitions/Error'
    """
    db = SessionLocal()
    try:
        users = UserService.get_all_users(db)
        return jsonify([user.model_dump() for user in users])
    except ProgrammingError as e:
        return jsonify({
            "error": "Las tablas no existen en la base de datos",
            "solution": "Ejecuta: python create_tables.py",
            "details": "Tabla 'users' no encontrada"
        }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/users', methods=['POST'])
def create_user():
    """
    Create a new user (Register)
    ---
    tags:
      - Users
    parameters:
      - name: body
        in: body
        required: true
        schema:
          $ref: '#/definitions/UserCreate'
    responses:
      201:
        description: User successfully created
        schema:
          $ref: '#/definitions/User'
      400:
        description: Validation error or user already exists
        schema:
          $ref: '#/definitions/Error'
    """
    db = SessionLocal()
    try:
        user_data = request.json
        from schemas.user_schemas import UserCreate
        user_create = UserCreate(**user_data)
        user = UserService.create_user(db, user_create)
        return jsonify(user.model_dump()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@app.route('/users/login', methods=['POST'])
def login():
    """
    User login - returns JWT token
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          $ref: '#/definitions/LoginRequest'
    responses:
      200:
        description: Login successful, JWT token returned
        schema:
          $ref: '#/definitions/LoginResponse'
      401:
        description: Invalid credentials
        schema:
          $ref: '#/definitions/Error'
      400:
        description: Missing required fields
        schema:
          $ref: '#/definitions/Error'
    """
    db = SessionLocal()
    try:
        login_data = request.json
        
        # Validate required fields
        if not login_data or 'email' not in login_data or 'password' not in login_data:
            return jsonify({"error": "Email and password are required"}), 400
        
        email = login_data['email']
        password = login_data['password']
        
        # Authenticate user
        user = UserService.authenticate_user(db, email, password)
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate JWT token
        token = generate_token(user.id, user.name, user.email)
        
        return jsonify({
            "token": token,
            "user_id": user.id,
            "username": user.name
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/recipes', methods=['POST'])
@token_required
def create_recipe(current_user):
    """
    Create a new recipe (authentication required)
    ---
    tags:
      - Recipes
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          $ref: '#/definitions/RecipeCreate'
    responses:
      201:
        description: Recipe successfully created
        schema:
          $ref: '#/definitions/Recipe'
      400:
        description: Validation error or invalid data
        schema:
          $ref: '#/definitions/Error'
      401:
        description: Unauthorized - missing or invalid token
        schema:
          $ref: '#/definitions/Error'
      404:
        description: User not found
        schema:
          $ref: '#/definitions/Error'
    """
    db = SessionLocal()
    try:
        # Track operation for metrics
        g.operation_type = 'create'
        
        # Verify user still exists in database
        user = UserService.get_user_by_id(db, current_user['user_id'])
        if not user:
            return jsonify({
                "error": "User not found. Your account may have been deleted.",
                "solution": "Please log in again or contact support."
            }), 404
        
        recipe_data = request.json
        from schemas.recipe_schemas import RecipeCreate
        
        # Automatically set the user_id from the JWT token
        recipe_data['user_id'] = current_user['user_id']
        
        recipe_create = RecipeCreate(**recipe_data)
        recipe = RecipeService.create_recipe(db, recipe_create)
        
        logger.log('INFO', 'Recipe created',
                   correlation_id=g.correlation_id,
                   recipe_id=recipe.id,
                   user_id=current_user['user_id'])
        
        return jsonify(recipe.model_dump()), 201
    except Exception as e:
        error_msg = str(e)
        logger.log('ERROR', 'Recipe creation failed',
                   correlation_id=g.correlation_id,
                   error=error_msg,
                   user_id=current_user['user_id'])
        # Handle foreign key constraint errors
        if "foreign key constraint fails" in error_msg.lower():
            return jsonify({
                "error": "Invalid user account. Please log in again.",
                "details": "Your user account may not exist in the database."
            }), 400
        return jsonify({"error": error_msg}), 400
    finally:
        db.close()

@app.route('/recipes', methods=['GET'])
def get_recipes():
    """
    Get all recipes
    ---
    tags:
      - Recipes
    responses:
      200:
        description: List of all recipes
        schema:
          type: array
          items:
            $ref: '#/definitions/Recipe'
      500:
        description: Server error
        schema:
          $ref: '#/definitions/Error'
    """
    db = SessionLocal()
    try:
        recipes = RecipeService.get_all_recipes(db)
        return jsonify([recipe.model_dump() for recipe in recipes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    """
    Get a specific recipe by ID
    ---
    tags:
      - Recipes
    parameters:
      - name: recipe_id
        in: path
        type: integer
        required: true
        description: The recipe ID
        example: 1
    responses:
      200:
        description: Recipe details
        schema:
          $ref: '#/definitions/Recipe'
      404:
        description: Recipe not found
        schema:
          $ref: '#/definitions/Error'
      500:
        description: Server error
        schema:
          $ref: '#/definitions/Error'
    """
    db = SessionLocal()
    try:
        recipe = RecipeService.get_recipe_by_id(db, recipe_id)
        if recipe:
            return jsonify(recipe.model_dump())
        return jsonify({"error": "Recipe not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/recipes/<int:recipe_id>', methods=['PUT'])
@token_required
def update_recipe(current_user, recipe_id):
    """Update a recipe - only the owner can update"""
    db = SessionLocal()
    try:
        # Check if recipe exists
        recipe = RecipeService.get_recipe_by_id(db, recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404
        
        # Check if user owns the recipe
        if recipe.user_id != current_user['user_id']:
            return jsonify({"error": "Forbidden: You can only edit your own recipes"}), 403
        
        # Update the recipe
        recipe_data = request.json
        from schemas.recipe_schemas import RecipeUpdate
        recipe_update = RecipeUpdate(**recipe_data)
        updated_recipe = RecipeService.update_recipe(db, recipe_id, recipe_update)
        
        if updated_recipe:
            return jsonify(updated_recipe.model_dump())
        return jsonify({"error": "Failed to update recipe"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@app.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@token_required
def delete_recipe(current_user, recipe_id):
    """Delete a recipe - only the owner can delete"""
    db = SessionLocal()
    try:
        # Check if recipe exists
        recipe = RecipeService.get_recipe_by_id(db, recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404
        
        # Check if user owns the recipe
        if recipe.user_id != current_user['user_id']:
            return jsonify({"error": "Forbidden: You can only delete your own recipes"}), 403
        
        # Delete the recipe
        success = RecipeService.delete_recipe(db, recipe_id)
        if success:
            return '', 204
        return jsonify({"error": "Failed to delete recipe"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/users/recipes', methods=['GET'])
@token_required
def get_current_user_recipes(current_user):
    """Get all recipes for the authenticated user"""
    db = SessionLocal()
    try:
        recipes = RecipeService.get_recipes_by_user(db, current_user['user_id'])
        return jsonify([recipe.model_dump() for recipe in recipes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/users/recipes/search', methods=['GET'])
@token_required
def search_current_user_recipes(current_user):
    """Search within the authenticated user's recipes"""
    db = SessionLocal()
    try:
        search_query = request.args.get('q', '').strip()
        
        if not search_query:
            return jsonify([])
        
        # Get all user recipes first, then filter by search
        all_user_recipes = RecipeService.get_recipes_by_user(db, current_user['user_id'])
        
        # Filter recipes by title (case-insensitive)
        filtered_recipes = [
            recipe for recipe in all_user_recipes
            if search_query.lower() in recipe.title.lower()
        ]
        
        return jsonify([recipe.model_dump() for recipe in filtered_recipes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/users/<int:user_id>/recipes', methods=['GET'])
def get_user_recipes(user_id):
    db = SessionLocal()
    try:
        recipes = RecipeService.get_recipes_by_user(db, user_id)
        return jsonify([recipe.model_dump() for recipe in recipes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/recipes/search', methods=['GET'])
def search_recipes():
    db = SessionLocal()
    try:
        # Get search query from query parameters
        search_query = request.args.get('q', '').strip()
        
        if not search_query:
            # If no query provided, return empty list
            return jsonify([])
        
        # Search recipes by title (case-insensitive)
        recipes = RecipeService.search_recipes(db, search_query)
        return jsonify([recipe.model_dump() for recipe in recipes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/comments', methods=['POST'])
@token_required
def create_comment(current_user):
    """Create a comment - requires authentication"""
    db = SessionLocal()
    try:
        comment_data = request.json
        from schemas.comment_schemas import CommentCreate
        # Override user_id with the authenticated user's ID
        comment_data['user_id'] = current_user['user_id']
        comment_create = CommentCreate(**comment_data)
        comment = CommentService.create_comment(db, comment_create)
        return jsonify(comment.model_dump()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@app.route('/comments', methods=['GET'])
def get_comments():
    db = SessionLocal()
    try:
        comments = CommentService.get_all_comments(db)
        return jsonify([comment.model_dump() for comment in comments])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/comments/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    db = SessionLocal()
    try:
        comment = CommentService.get_comment_by_id(db, comment_id)
        if comment:
            return jsonify(comment.model_dump())
        return jsonify({"error": "Comment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/recipes/<int:recipe_id>/comments', methods=['GET'])
def get_recipe_comments(recipe_id):
    """Get all comments for a recipe with user information"""
    db = SessionLocal()
    try:
        comments = CommentService.get_recipe_comments_with_users(db, recipe_id)
        return jsonify([comment.model_dump() for comment in comments])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/users/<int:user_id>/comments', methods=['GET'])
def get_user_comments(user_id):
    db = SessionLocal()
    try:
        comments = CommentService.get_comments_by_user(db, user_id)
        return jsonify([comment.model_dump() for comment in comments])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/comments/<int:comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, comment_id):
    """Update a comment - only the owner can update"""
    db = SessionLocal()
    try:
        # Check if comment exists
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404
        
        # Check if user owns the comment
        if comment.user_id != current_user['user_id']:
            return jsonify({"error": "Forbidden: You can only edit your own comments"}), 403
        
        # Update the comment
        comment_data = request.json
        from schemas.comment_schemas import CommentUpdate
        comment_update = CommentUpdate(**comment_data)
        updated_comment = CommentService.update_comment(db, comment_id, comment_update)
        
        if updated_comment:
            return jsonify(updated_comment.model_dump())
        return jsonify({"error": "Failed to update comment"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    """Delete a comment - only the owner can delete"""
    db = SessionLocal()
    try:
        # Check if comment exists
        comment = CommentService.get_comment_by_id(db, comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404
        
        # Check if user owns the comment
        if comment.user_id != current_user['user_id']:
            return jsonify({"error": "Forbidden: You can only delete your own comments"}), 403
        
        # Delete the comment
        success = CommentService.delete_comment(db, comment_id)
        if success:
            return '', 204
        return jsonify({"error": "Failed to delete comment"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    print("📊 Available endpoints:")
    print("   GET  /")
    print("   GET  /health")
    print("   GET  /users")
    print("   POST /users")
    print("   GET  /recipes")
    print("   POST /recipes")
    print("   GET  /recipes/<id>")
    print("   GET  /users/<id>/recipes")
    print("   GET  /comments")
    print("   POST /comments")
    print("   GET  /comments/<id>")
    print("   GET  /recipes/<id>/comments")
    print("   GET  /users/<id>/comments")
    app.run(debug=True, host='0.0.0.0', port=5000)
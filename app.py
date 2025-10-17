from flask import Flask, jsonify, request
from flask_cors import CORS
from database import SessionLocal
from services.user_service import UserService
from services.recipe_service import RecipeService
from services.comment_service import CommentService
from utils.jwt_utils import generate_token, token_required
from sqlalchemy.exc import ProgrammingError

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/')
def home():
    return jsonify({"message": "¡Welcome!", "status": "running"})

@app.route('/health')
def health():
    return jsonify({"status": "OK", "database": "connected"})

@app.route('/protected')
@token_required
def protected_route(current_user):
    """Example protected route to test JWT authentication"""
    return jsonify({
        "message": f"Hello {current_user['username']}!",
        "user_id": current_user['user_id'],
        "email": current_user['email']
    }), 200

@app.route('/users', methods=['GET'])
def get_users():
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
    """Create a new recipe for the authenticated user"""
    db = SessionLocal()
    try:
        recipe_data = request.json
        from schemas.recipe_schemas import RecipeCreate
        
        # Automatically set the user_id from the JWT token
        recipe_data['user_id'] = current_user['user_id']
        
        recipe_create = RecipeCreate(**recipe_data)
        recipe = RecipeService.create_recipe(db, recipe_create)
        return jsonify(recipe.model_dump()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@app.route('/recipes', methods=['GET'])
def get_recipes():
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
def create_comment():
    db = SessionLocal()
    try:
        comment_data = request.json
        from schemas.comment_schemas import CommentCreate
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
    db = SessionLocal()
    try:
        comments = CommentService.get_comments_by_recipe(db, recipe_id)
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
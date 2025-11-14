import pytest
from app import app
# Note: client fixture is provided by conftest.py with database initialization


def test_home(client):
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert "message" in data
    assert data["status"] == "running"


def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_get_users(client, monkeypatch):
    # Mock user_service
    from services import user_service

    class DummyUser:
        def model_dump(self):
            return {"id": 1, "name": "John Doe"}

    monkeypatch.setattr(user_service.UserService, "get_all_users", lambda db: [DummyUser()])

    response = client.get('/users')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert data[0]["name"] == "John Doe"


def test_create_user(client, monkeypatch):
    from services import user_service

    class DummyUser:
        def model_dump(self):
            return {"id": 1, "name": "John", "email": "john@example.com"}

    monkeypatch.setattr(user_service.UserService, "create_user", lambda db, user: DummyUser())

    response = client.post('/users', json={"name": "John", "email": "john@example.com", "password": "password123"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "John"


def test_create_recipe(client, monkeypatch):
    """Test recipe creation requires authentication"""
    from services import recipe_service, user_service
    from database import SessionLocal
    from repositories.user_repository import UserRepository

    # Create a test user in the database
    db = SessionLocal()
    try:
        user_data = {
            'name': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        }
        test_user = UserRepository.create_user(db, user_data)
        db.commit()
        db.refresh(test_user)
        user_id = test_user.id
    finally:
        db.close()

    class DummyRecipe:
        def __init__(self):
            self.id = 1
            self.user_id = user_id
            self.title = "Pizza"
        
        def model_dump(self):
            return {
                "id": 1, 
                "title": "Pizza", 
                "dish_type": "Main Course",
                "ingredients": "dough, cheese, tomato",
                "instructions": "Bake it",
                "user_id": user_id,
                "user_name": "testuser"
            }

    monkeypatch.setattr(recipe_service.RecipeService, "create_recipe", lambda db, recipe: DummyRecipe())

    # Test without authentication - should fail
    response = client.post('/recipes', json={
        "title": "Pizza",
        "dish_type": "Main Course",
        "ingredients": "dough, cheese, tomato",
        "instructions": "Bake it"
    })
    assert response.status_code == 401
    
    # Mock token validation for authenticated test
    from utils import jwt_utils
    def mock_decode(token):
        return {"user_id": user_id, "username": "testuser"}
    
    monkeypatch.setattr(jwt_utils, "decode_token", mock_decode)
    
    # Test with authentication
    response = client.post('/recipes', 
                          json={
                              "title": "Pizza",
                              "dish_type": "Main Course",
                              "ingredients": "dough, cheese, tomato",
                              "instructions": "Bake it"
                          },
                          headers={"Authorization": "Bearer fake_token"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == "Pizza"


def test_get_recipe_by_id_success(client, monkeypatch):
    """Test successful recipe retrieval by ID"""
    from services import recipe_service

    class DummyRecipe:
        def model_dump(self):
            return {
                "id": 1,
                "title": "Chocolate Chip Cookies",
                "dish_type": "Dessert",
                "ingredients": "flour, sugar, chocolate chips",
                "instructions": "Mix and bake",
                "preparation_time": "30 minutes",
                "origin": "USA",
                "servings": 24,
                "user_id": 1
            }

    monkeypatch.setattr(recipe_service.RecipeService, "get_recipe_by_id", lambda db, rid: DummyRecipe())

    response = client.get('/recipes/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1
    assert data["title"] == "Chocolate Chip Cookies"
    assert data["dish_type"] == "Dessert"
    assert "ingredients" in data
    assert "instructions" in data


def test_get_recipe_not_found(client, monkeypatch):
    """Test 404 response for non-existent recipe ID"""
    from services import recipe_service
    monkeypatch.setattr(recipe_service.RecipeService, "get_recipe_by_id", lambda db, rid: None)

    response = client.get('/recipes/999')
    assert response.status_code == 404
    data = response.get_json()
    assert "Recipe not found" in data["error"]


def test_get_recipe_invalid_id_format(client):
    """Test invalid ID format returns 404"""
    response = client.get('/recipes/invalid')
    assert response.status_code == 404


def test_get_recipe_database_error(client, monkeypatch):
    """Test database error handling returns 500"""
    from services import recipe_service
    
    def mock_error(db, rid):
        raise Exception("Database connection failed")
    
    monkeypatch.setattr(recipe_service.RecipeService, "get_recipe_by_id", mock_error)

    response = client.get('/recipes/1')
    assert response.status_code == 500
    data = response.get_json()
    assert "error" in data


def test_get_comments(client, monkeypatch):
    from services import comment_service

    class DummyComment:
        def model_dump(self):
            return {"id": 1, "content": "Yummy!"}

    monkeypatch.setattr(comment_service.CommentService, "get_all_comments", lambda db: [DummyComment()])

    response = client.get('/comments')
    assert response.status_code == 200
    data = response.get_json()
    assert data[0]["content"] == "Yummy!"

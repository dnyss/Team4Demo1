import pytest
import json
from app import app
from utils.jwt_utils import generate_token


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def auth_token():
    """Generate a valid JWT token for testing"""
    return generate_token(user_id=1, username="testuser", email="test@example.com")


@pytest.fixture
def auth_headers(auth_token):
    """Create authorization headers with JWT token"""
    return {'Authorization': f'Bearer {auth_token}'}


class TestUserRecipesCRUD:
    """Test suite for user recipes CRUD operations"""
    
    def test_get_current_user_recipes_success(self, client, auth_headers, monkeypatch):
        """Test getting recipes for authenticated user"""
        from services import recipe_service
        
        class DummyRecipe:
            user_id = 1
            def model_dump(self):
                return {"id": 1, "title": "User's Recipe", "user_id": 1}
        
        monkeypatch.setattr(
            recipe_service.RecipeService, 
            "get_recipes_by_user", 
            lambda db, user_id: [DummyRecipe()]
        )
        
        response = client.get('/users/recipes', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]['title'] == "User's Recipe"
    
    def test_get_current_user_recipes_unauthorized(self, client):
        """Test getting user recipes without authentication"""
        response = client.get('/users/recipes')
        assert response.status_code == 401
        data = json.loads(response.data)
        assert "error" in data
    
    def test_search_current_user_recipes_success(self, client, auth_headers, monkeypatch):
        """Test searching within user's recipes"""
        from services import recipe_service
        
        class DummyRecipe:
            title = "Chocolate Cake"
            user_id = 1
            def model_dump(self):
                return {"id": 1, "title": self.title, "user_id": 1}
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipes_by_user",
            lambda db, user_id: [DummyRecipe()]
        )
        
        response = client.get('/users/recipes/search?q=chocolate', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['title'] == "Chocolate Cake"
    
    def test_search_current_user_recipes_no_match(self, client, auth_headers, monkeypatch):
        """Test searching with no matching results"""
        from services import recipe_service
        
        class DummyRecipe:
            title = "Chocolate Cake"
            def model_dump(self):
                return {"id": 1, "title": self.title}
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipes_by_user",
            lambda db, user_id: [DummyRecipe()]
        )
        
        response = client.get('/users/recipes/search?q=pizza', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 0
    
    def test_search_current_user_recipes_empty_query(self, client, auth_headers):
        """Test search with empty query returns empty array"""
        response = client.get('/users/recipes/search?q=', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == []
    
    def test_create_recipe_success(self, client, auth_headers, monkeypatch):
        """Test creating a new recipe as authenticated user"""
        from services import recipe_service
        
        class DummyRecipe:
            def model_dump(self):
                return {
                    "id": 1,
                    "title": "New Recipe",
                    "user_id": 1,
                    "ingredients": "flour, sugar",
                    "instructions": "Mix and bake"
                }
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "create_recipe",
            lambda db, recipe: DummyRecipe()
        )
        
        recipe_data = {
            "title": "New Recipe",
            "dish_type": "Dessert",
            "ingredients": "flour, sugar",
            "instructions": "Mix and bake"
        }
        
        response = client.post('/recipes', 
                             data=json.dumps(recipe_data),
                             headers={**auth_headers, 'Content-Type': 'application/json'})
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['title'] == "New Recipe"
        assert data['user_id'] == 1
    
    def test_create_recipe_unauthorized(self, client):
        """Test creating recipe without authentication"""
        recipe_data = {"title": "Test Recipe"}
        
        response = client.post('/recipes',
                             data=json.dumps(recipe_data),
                             headers={'Content-Type': 'application/json'})
        
        assert response.status_code == 401
    
    def test_create_recipe_validation_error(self, client, auth_headers):
        """Test creating recipe with invalid data"""
        invalid_data = {"invalid_field": "value"}
        
        response = client.post('/recipes',
                             data=json.dumps(invalid_data),
                             headers={**auth_headers, 'Content-Type': 'application/json'})
        
        assert response.status_code == 400
    
    def test_update_recipe_success(self, client, auth_headers, monkeypatch):
        """Test updating own recipe"""
        from services import recipe_service
        
        class DummyRecipe:
            user_id = 1
            def model_dump(self):
                return {"id": 1, "title": "Updated Recipe", "user_id": 1}
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipe_by_id",
            lambda db, recipe_id: DummyRecipe()
        )
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "update_recipe",
            lambda db, recipe_id, data: DummyRecipe()
        )
        
        update_data = {"title": "Updated Recipe"}
        
        response = client.put('/recipes/1',
                            data=json.dumps(update_data),
                            headers={**auth_headers, 'Content-Type': 'application/json'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == "Updated Recipe"
    
    def test_update_recipe_unauthorized(self, client):
        """Test updating recipe without authentication"""
        update_data = {"title": "Updated Recipe"}
        
        response = client.put('/recipes/1',
                            data=json.dumps(update_data),
                            headers={'Content-Type': 'application/json'})
        
        assert response.status_code == 401
    
    def test_update_recipe_not_owner(self, client, auth_headers, monkeypatch):
        """Test updating recipe owned by another user"""
        from services import recipe_service
        
        class DummyRecipe:
            user_id = 999  # Different user
            def model_dump(self):
                return {"id": 1, "title": "Recipe", "user_id": 999}
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipe_by_id",
            lambda db, recipe_id: DummyRecipe()
        )
        
        update_data = {"title": "Updated Recipe"}
        
        response = client.put('/recipes/1',
                            data=json.dumps(update_data),
                            headers={**auth_headers, 'Content-Type': 'application/json'})
        
        assert response.status_code == 403
        data = json.loads(response.data)
        assert "Forbidden" in data['error']
    
    def test_update_recipe_not_found(self, client, auth_headers, monkeypatch):
        """Test updating non-existent recipe"""
        from services import recipe_service
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipe_by_id",
            lambda db, recipe_id: None
        )
        
        update_data = {"title": "Updated Recipe"}
        
        response = client.put('/recipes/999',
                            data=json.dumps(update_data),
                            headers={**auth_headers, 'Content-Type': 'application/json'})
        
        assert response.status_code == 404
    
    def test_delete_recipe_success(self, client, auth_headers, monkeypatch):
        """Test deleting own recipe"""
        from services import recipe_service
        
        class DummyRecipe:
            user_id = 1
            def model_dump(self):
                return {"id": 1, "title": "Recipe", "user_id": 1}
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipe_by_id",
            lambda db, recipe_id: DummyRecipe()
        )
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "delete_recipe",
            lambda db, recipe_id: True
        )
        
        response = client.delete('/recipes/1', headers=auth_headers)
        
        assert response.status_code == 204
        assert response.data == b''
    
    def test_delete_recipe_unauthorized(self, client):
        """Test deleting recipe without authentication"""
        response = client.delete('/recipes/1')
        assert response.status_code == 401
    
    def test_delete_recipe_not_owner(self, client, auth_headers, monkeypatch):
        """Test deleting recipe owned by another user"""
        from services import recipe_service
        
        class DummyRecipe:
            user_id = 999  # Different user
            def model_dump(self):
                return {"id": 1, "title": "Recipe", "user_id": 999}
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipe_by_id",
            lambda db, recipe_id: DummyRecipe()
        )
        
        response = client.delete('/recipes/1', headers=auth_headers)
        
        assert response.status_code == 403
        data = json.loads(response.data)
        assert "Forbidden" in data['error']
    
    def test_delete_recipe_not_found(self, client, auth_headers, monkeypatch):
        """Test deleting non-existent recipe"""
        from services import recipe_service
        
        monkeypatch.setattr(
            recipe_service.RecipeService,
            "get_recipe_by_id",
            lambda db, recipe_id: None
        )
        
        response = client.delete('/recipes/999', headers=auth_headers)
        
        assert response.status_code == 404

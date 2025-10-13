import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


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
    assert data["status"] == "OK"


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
            return {"id": 1, "name": "John"}

    monkeypatch.setattr(user_service.UserService, "create_user", lambda db, user: DummyUser())

    response = client.post('/users', json={"name": "John", "email": "john@example.com"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "John"


def test_create_recipe(client, monkeypatch):
    from services import recipe_service

    class DummyRecipe:
        def model_dump(self):
            return {"id": 1, "title": "Pizza"}

    monkeypatch.setattr(recipe_service.RecipeService, "create_recipe", lambda db, recipe: DummyRecipe())

    response = client.post('/recipes', json={"title": "Pizza"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == "Pizza"


def test_get_recipe_not_found(client, monkeypatch):
    from services import recipe_service
    monkeypatch.setattr(recipe_service.RecipeService, "get_recipe_by_id", lambda db, rid: None)

    response = client.get('/recipes/999')
    assert response.status_code == 404
    data = response.get_json()
    assert "Recipe not found" in data["error"]


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

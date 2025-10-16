import pytest
import json


def test_get_all_recipes_empty(client):
    """Test GET /recipes returns empty array when no recipes exist"""
    response = client.get('/recipes')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_all_recipes_with_data(client):
    """Test GET /recipes returns all recipes"""
    # First, create a user
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    # Create a recipe
    recipe_data = {
        "title": "Test Recipe",
        "dish_type": "Main Course",
        "ingredients": "ingredient1, ingredient2",
        "instructions": "Step 1, Step 2",
        "preparation_time": "30 minutes",
        "origin": "Test Origin",
        "servings": 4,
        "user_id": 1
    }
    client.post('/recipes', data=json.dumps(recipe_data), content_type='application/json')
    
    # Get all recipes
    response = client.get('/recipes')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['title'] == 'Test Recipe'
    assert data[0]['dish_type'] == 'Main Course'
    assert 'id' in data[0]
    assert 'creation_date' in data[0]


def test_get_all_recipes_multiple(client):
    """Test GET /recipes returns multiple recipes"""
    # Create user
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    # Create multiple recipes
    recipes = [
        {"title": "Recipe One", "dish_type": "Appetizer", "ingredients": "ing1", "instructions": "inst1", "user_id": 1},
        {"title": "Recipe Two", "dish_type": "Main", "ingredients": "ing2", "instructions": "inst2", "user_id": 1},
        {"title": "Recipe Three", "dish_type": "Dessert", "ingredients": "ing3", "instructions": "inst3", "user_id": 1}
    ]
    
    for recipe in recipes:
        client.post('/recipes', data=json.dumps(recipe), content_type='application/json')
    
    # Get all recipes
    response = client.get('/recipes')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 3
    titles = [r['title'] for r in data]
    assert 'Recipe One' in titles
    assert 'Recipe Two' in titles
    assert 'Recipe Three' in titles


def test_search_recipes_no_query(client):
    """Test GET /recipes/search with no query parameter returns empty array"""
    response = client.get('/recipes/search')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0


def test_search_recipes_empty_query(client):
    """Test GET /recipes/search with empty query parameter returns empty array"""
    response = client.get('/recipes/search?q=')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0


def test_search_recipes_no_results(client):
    """Test GET /recipes/search returns empty array when no matches found"""
    # Create user and recipe
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    recipe_data = {
        "title": "Chocolate Cake",
        "dish_type": "Dessert",
        "ingredients": "chocolate, flour",
        "instructions": "Mix and bake",
        "user_id": 1
    }
    client.post('/recipes', data=json.dumps(recipe_data), content_type='application/json')
    
    # Search for something that doesn't exist
    response = client.get('/recipes/search?q=pizza')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0


def test_search_recipes_exact_match(client):
    """Test GET /recipes/search finds exact title match"""
    # Create user and recipe
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    recipe_data = {
        "title": "Chocolate Chip Cookies",
        "dish_type": "Dessert",
        "ingredients": "chocolate, flour",
        "instructions": "Mix and bake",
        "user_id": 1
    }
    client.post('/recipes', data=json.dumps(recipe_data), content_type='application/json')
    
    # Search for exact title
    response = client.get('/recipes/search?q=Chocolate Chip Cookies')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['title'] == 'Chocolate Chip Cookies'


def test_search_recipes_partial_match(client):
    """Test GET /recipes/search finds partial matches"""
    # Create user and recipes
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    recipes = [
        {"title": "Chocolate Cake", "dish_type": "Dessert", "ingredients": "ing", "instructions": "inst", "user_id": 1},
        {"title": "Chocolate Cookies", "dish_type": "Dessert", "ingredients": "ing", "instructions": "inst", "user_id": 1},
        {"title": "Vanilla Cake", "dish_type": "Dessert", "ingredients": "ing", "instructions": "inst", "user_id": 1}
    ]
    
    for recipe in recipes:
        client.post('/recipes', data=json.dumps(recipe), content_type='application/json')
    
    # Search for "Chocolate" - should find 2 recipes
    response = client.get('/recipes/search?q=Chocolate')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 2
    titles = [r['title'] for r in data]
    assert 'Chocolate Cake' in titles
    assert 'Chocolate Cookies' in titles
    assert 'Vanilla Cake' not in titles


def test_search_recipes_case_insensitive(client):
    """Test GET /recipes/search is case-insensitive"""
    # Create user and recipe
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    recipe_data = {
        "title": "Spaghetti Carbonara",
        "dish_type": "Main Course",
        "ingredients": "pasta, eggs",
        "instructions": "Cook and mix",
        "user_id": 1
    }
    client.post('/recipes', data=json.dumps(recipe_data), content_type='application/json')
    
    # Search with different cases
    test_queries = ['spaghetti', 'SPAGHETTI', 'SpAgHeTTi', 'carbonara', 'CARBONARA']
    
    for query in test_queries:
        response = client.get(f'/recipes/search?q={query}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['title'] == 'Spaghetti Carbonara'


def test_search_recipes_with_spaces(client):
    """Test GET /recipes/search handles queries with spaces"""
    # Create user and recipe
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    recipe_data = {
        "title": "Chicken Stir Fry",
        "dish_type": "Main Course",
        "ingredients": "chicken, vegetables",
        "instructions": "Cook and stir",
        "user_id": 1
    }
    client.post('/recipes', data=json.dumps(recipe_data), content_type='application/json')
    
    # Search with spaces in query
    response = client.get('/recipes/search?q=Chicken Stir')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['title'] == 'Chicken Stir Fry'


def test_search_recipes_multiple_results(client):
    """Test GET /recipes/search returns all matching results"""
    # Create user and multiple recipes
    user_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    recipes = [
        {"title": "Thai Soup", "dish_type": "Soup", "ingredients": "ing", "instructions": "inst", "user_id": 1},
        {"title": "Tomato Soup", "dish_type": "Soup", "ingredients": "ing", "instructions": "inst", "user_id": 1},
        {"title": "Chicken Soup", "dish_type": "Soup", "ingredients": "ing", "instructions": "inst", "user_id": 1},
        {"title": "Thai Curry", "dish_type": "Main", "ingredients": "ing", "instructions": "inst", "user_id": 1}
    ]
    
    for recipe in recipes:
        client.post('/recipes', data=json.dumps(recipe), content_type='application/json')
    
    # Search for "Soup" - should find 3 recipes
    response = client.get('/recipes/search?q=Soup')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 3
    
    # Search for "Thai" - should find 2 recipes
    response = client.get('/recipes/search?q=Thai')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 2

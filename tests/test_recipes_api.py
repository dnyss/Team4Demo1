import pytest
import json


def create_user_and_get_token(client, email="test@example.com", name="testuser", password="testpassword123"):
    """Helper function to create a user and get authentication token"""
    user_data = {
        "name": name,
        "email": email,
        "password": password
    }
    client.post('/users', data=json.dumps(user_data), content_type='application/json')
    
    # Login to get token
    login_response = client.post('/users/login',
                                 data=json.dumps({
                                     "email": email,
                                     "password": password
                                 }),
                                 content_type='application/json')
    login_data = json.loads(login_response.data)
    return login_data['token']


def test_get_all_recipes_empty(client):
    """Test GET /recipes returns empty array when no recipes exist"""
    response = client.get('/recipes')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_all_recipes_with_data(client):
    """Test GET /recipes returns all recipes"""
    # Create user and get token
    token = create_user_and_get_token(client)
    
    # Create a recipe
    recipe_data = {
        "title": "Test Recipe",
        "dish_type": "Main Course",
        "ingredients": "ingredient1, ingredient2",
        "instructions": "Step 1, Step 2",
        "preparation_time": "30 minutes",
        "origin": "Test Origin",
        "servings": 4
    }
    client.post('/recipes', 
               data=json.dumps(recipe_data), 
               content_type='application/json',
               headers={'Authorization': f'Bearer {token}'})
    
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
    assert 'user_name' in data[0]
    assert data[0]['user_name'] == 'testuser'


def test_get_all_recipes_multiple(client):
    """Test GET /recipes returns multiple recipes"""
    # Create user and get token
    token = create_user_and_get_token(client)
    
    # Create multiple recipes
    recipes = [
        {"title": "Recipe One", "dish_type": "Appetizer", "ingredients": "ing1", "instructions": "inst1"},
        {"title": "Recipe Two", "dish_type": "Main", "ingredients": "ing2", "instructions": "inst2"},
        {"title": "Recipe Three", "dish_type": "Dessert", "ingredients": "ing3", "instructions": "inst3"}
    ]
    
    for recipe in recipes:
        client.post('/recipes', 
                   data=json.dumps(recipe), 
                   content_type='application/json',
                   headers={'Authorization': f'Bearer {token}'})
    
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
    # Create user and get token
    token = create_user_and_get_token(client)
    
    recipe_data = {
        "title": "Chocolate Cake",
        "dish_type": "Dessert",
        "ingredients": "chocolate, flour",
        "instructions": "Mix and bake"
    }
    client.post('/recipes', 
               data=json.dumps(recipe_data), 
               content_type='application/json',
               headers={'Authorization': f'Bearer {token}'})
    
    # Search for something that doesn't exist
    response = client.get('/recipes/search?q=pizza')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0


def test_search_recipes_exact_match(client):
    """Test GET /recipes/search finds exact title match"""
    # Create user and get token
    token = create_user_and_get_token(client)
    
    recipe_data = {
        "title": "Chocolate Chip Cookies",
        "dish_type": "Dessert",
        "ingredients": "chocolate, flour",
        "instructions": "Mix and bake"
    }
    client.post('/recipes', 
               data=json.dumps(recipe_data), 
               content_type='application/json',
               headers={'Authorization': f'Bearer {token}'})
    
    # Search for exact title
    response = client.get('/recipes/search?q=Chocolate Chip Cookies')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['title'] == 'Chocolate Chip Cookies'


def test_search_recipes_partial_match(client):
    """Test GET /recipes/search finds partial matches"""
    # Create user and get token
    token = create_user_and_get_token(client)
    
    recipes = [
        {"title": "Chocolate Cake", "dish_type": "Dessert", "ingredients": "ing", "instructions": "inst"},
        {"title": "Chocolate Cookies", "dish_type": "Dessert", "ingredients": "ing", "instructions": "inst"},
        {"title": "Vanilla Cake", "dish_type": "Dessert", "ingredients": "ing", "instructions": "inst"}
    ]
    
    for recipe in recipes:
        client.post('/recipes', 
                   data=json.dumps(recipe), 
                   content_type='application/json',
                   headers={'Authorization': f'Bearer {token}'})
    
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
    # Create user and get token
    token = create_user_and_get_token(client)
    
    recipe_data = {
        "title": "Spaghetti Carbonara",
        "dish_type": "Main Course",
        "ingredients": "pasta, eggs",
        "instructions": "Cook and mix"
    }
    client.post('/recipes', 
               data=json.dumps(recipe_data), 
               content_type='application/json',
               headers={'Authorization': f'Bearer {token}'})
    
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
    # Create user and get token
    token = create_user_and_get_token(client)
    
    recipe_data = {
        "title": "Chicken Stir Fry",
        "dish_type": "Main Course",
        "ingredients": "chicken, vegetables",
        "instructions": "Cook and stir"
    }
    client.post('/recipes', 
               data=json.dumps(recipe_data), 
               content_type='application/json',
               headers={'Authorization': f'Bearer {token}'})
    
    # Search with spaces in query
    response = client.get('/recipes/search?q=Chicken Stir')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) == 1
    assert data[0]['title'] == 'Chicken Stir Fry'


def test_search_recipes_multiple_results(client):
    """Test GET /recipes/search returns all matching results"""
    # Create user and get token
    token = create_user_and_get_token(client)
    
    recipes = [
        {"title": "Thai Soup", "dish_type": "Soup", "ingredients": "ing", "instructions": "inst"},
        {"title": "Tomato Soup", "dish_type": "Soup", "ingredients": "ing", "instructions": "inst"},
        {"title": "Chicken Soup", "dish_type": "Soup", "ingredients": "ing", "instructions": "inst"},
        {"title": "Thai Curry", "dish_type": "Main", "ingredients": "ing", "instructions": "inst"}
    ]
    
    for recipe in recipes:
        client.post('/recipes', 
                   data=json.dumps(recipe), 
                   content_type='application/json',
                   headers={'Authorization': f'Bearer {token}'})
    
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

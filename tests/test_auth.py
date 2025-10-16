import pytest
import json
from utils.jwt_utils import generate_token, decode_token


def test_successful_login(client):
    """Test successful login with valid credentials"""
    # First create a user
    register_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(register_data), content_type='application/json')
    
    # Now try to login
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post('/users/login', data=json.dumps(login_data), content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'token' in data
    assert 'user_id' in data
    assert 'username' in data
    assert data['username'] == 'testuser'
    
    # Verify token is valid
    decoded = decode_token(data['token'])
    assert decoded is not None
    assert decoded['username'] == 'testuser'
    assert decoded['email'] == 'test@example.com'


def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    # First create a user
    register_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(register_data), content_type='application/json')
    
    # Try to login with wrong password
    login_data = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }
    response = client.post('/users/login', data=json.dumps(login_data), content_type='application/json')
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Invalid email or password' in data['error']


def test_login_nonexistent_user(client):
    """Test login with email that doesn't exist"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "somepassword"
    }
    response = client.post('/users/login', data=json.dumps(login_data), content_type='application/json')
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data


def test_login_missing_email(client):
    """Test login with missing email field"""
    login_data = {
        "password": "testpassword123"
    }
    response = client.post('/users/login', data=json.dumps(login_data), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Email and password are required' in data['error']


def test_login_missing_password(client):
    """Test login with missing password field"""
    login_data = {
        "email": "test@example.com"
    }
    response = client.post('/users/login', data=json.dumps(login_data), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Email and password are required' in data['error']


def test_login_empty_body(client):
    """Test login with empty request body"""
    response = client.post('/users/login', data=json.dumps({}), content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data


def test_protected_route_with_valid_token(client):
    """Test accessing protected route with valid JWT token"""
    # Create and login user
    register_data = {
        "name": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post('/users', data=json.dumps(register_data), content_type='application/json')
    
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    login_response = client.post('/users/login', data=json.dumps(login_data), content_type='application/json')
    token = json.loads(login_response.data)['token']
    
    # Access protected route
    headers = {'Authorization': f'Bearer {token}'}
    response = client.get('/protected', headers=headers)
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'message' in data
    assert 'testuser' in data['message']
    assert data['user_id'] is not None
    assert data['email'] == 'test@example.com'


def test_protected_route_without_token(client):
    """Test accessing protected route without token"""
    response = client.get('/protected')
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data
    assert 'missing' in data['error'].lower()


def test_protected_route_with_invalid_token(client):
    """Test accessing protected route with invalid token"""
    headers = {'Authorization': 'Bearer invalid.token.here'}
    response = client.get('/protected', headers=headers)
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Invalid or expired token' in data['error']


def test_protected_route_with_malformed_header(client):
    """Test accessing protected route with malformed Authorization header"""
    # Missing 'Bearer' prefix
    headers = {'Authorization': 'sometoken123'}
    response = client.get('/protected', headers=headers)
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'error' in data


def test_token_generation_and_decoding():
    """Test JWT token generation and decoding"""
    user_id = 1
    username = "testuser"
    email = "test@example.com"
    
    # Generate token
    token = generate_token(user_id, username, email)
    assert token is not None
    assert isinstance(token, str)
    
    # Decode token
    decoded = decode_token(token)
    assert decoded is not None
    assert decoded['user_id'] == user_id
    assert decoded['username'] == username
    assert decoded['email'] == email
    assert 'exp' in decoded
    assert 'iat' in decoded


def test_decode_invalid_token():
    """Test decoding invalid token"""
    invalid_token = "invalid.token.string"
    decoded = decode_token(invalid_token)
    assert decoded is None

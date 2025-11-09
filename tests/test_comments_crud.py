import pytest
import json
from utils.jwt_utils import generate_token


class TestCommentsCRUD:
    """Tests for comment CRUD operations with authentication"""

    def setup_method(self):
        """Setup method runs before each test"""
        self.user_data = {
            "name": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }
        self.recipe_data = {
            "title": "Test Recipe for Comments",
            "dish_type": "Main Course",
            "ingredients": "ingredient1, ingredient2",
            "instructions": "Step 1, Step 2",
            "preparation_time": "30 minutes",
            "servings": 4
        }

    def test_create_comment_success(self, client):
        """Test creating a comment with authentication"""
        # Create user
        response = client.post('/users', 
                             data=json.dumps(self.user_data),
                             content_type='application/json')
        assert response.status_code == 201
        user = json.loads(response.data)
        
        # Login to get token
        login_response = client.post('/users/login',
                                     data=json.dumps({
                                         "email": self.user_data["email"],
                                         "password": self.user_data["password"]
                                     }),
                                     content_type='application/json')
        assert login_response.status_code == 200
        login_data = json.loads(login_response.data)
        token = login_data['token']
        
        # Create a recipe
        recipe_response = client.post('/recipes',
                                     data=json.dumps(self.recipe_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token}'})
        assert recipe_response.status_code == 201
        recipe = json.loads(recipe_response.data)
        
        # Create a comment
        comment_data = {
            "content": "This recipe is amazing!",
            "recipe_id": recipe['id']
        }
        comment_response = client.post('/comments',
                                      data=json.dumps(comment_data),
                                      content_type='application/json',
                                      headers={'Authorization': f'Bearer {token}'})
        
        assert comment_response.status_code == 201
        comment = json.loads(comment_response.data)
        assert comment['content'] == "This recipe is amazing!"
        assert comment['user_id'] == user['id']
        assert comment['recipe_id'] == recipe['id']

    def test_create_comment_unauthorized(self, client):
        """Test creating a comment without authentication"""
        comment_data = {
            "content": "Test comment",
            "recipe_id": 1
        }
        response = client.post('/comments',
                              data=json.dumps(comment_data),
                              content_type='application/json')
        
        assert response.status_code == 401

    def test_get_recipe_comments_with_user_info(self, client):
        """Test getting comments for a recipe with user information"""
        # Create user and get token
        client.post('/users', data=json.dumps(self.user_data), content_type='application/json')
        login_response = client.post('/users/login',
                                     data=json.dumps({
                                         "email": self.user_data["email"],
                                         "password": self.user_data["password"]
                                     }),
                                     content_type='application/json')
        login_data = json.loads(login_response.data)
        token = login_data['token']
        
        # Create recipe
        recipe_response = client.post('/recipes',
                                     data=json.dumps(self.recipe_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token}'})
        recipe = json.loads(recipe_response.data)
        
        # Create comments
        comments_to_create = [
            {"content": "Great recipe!", "recipe_id": recipe['id']},
            {"content": "I loved it!", "recipe_id": recipe['id']}
        ]
        
        for comment_data in comments_to_create:
            client.post('/comments',
                       data=json.dumps(comment_data),
                       content_type='application/json',
                       headers={'Authorization': f'Bearer {token}'})
        
        # Get recipe comments
        response = client.get(f'/recipes/{recipe["id"]}/comments')
        
        assert response.status_code == 200
        comments = json.loads(response.data)
        assert len(comments) == 2
        # Verify user_name is included
        assert 'user_name' in comments[0]
        assert comments[0]['user_name'] == self.user_data['name']

    def test_update_comment_success(self, client):
        """Test updating own comment"""
        # Create user and get token
        client.post('/users', data=json.dumps(self.user_data), content_type='application/json')
        login_response = client.post('/users/login',
                                     data=json.dumps({
                                         "email": self.user_data["email"],
                                         "password": self.user_data["password"]
                                     }),
                                     content_type='application/json')
        login_data = json.loads(login_response.data)
        token = login_data['token']
        
        # Create recipe
        recipe_response = client.post('/recipes',
                                     data=json.dumps(self.recipe_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token}'})
        recipe = json.loads(recipe_response.data)
        
        # Create comment
        comment_data = {"content": "Original comment", "recipe_id": recipe['id']}
        comment_response = client.post('/comments',
                                      data=json.dumps(comment_data),
                                      content_type='application/json',
                                      headers={'Authorization': f'Bearer {token}'})
        comment = json.loads(comment_response.data)
        
        # Update comment
        update_data = {"content": "Updated comment"}
        update_response = client.put(f'/comments/{comment["id"]}',
                                     data=json.dumps(update_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token}'})
        
        assert update_response.status_code == 200
        updated_comment = json.loads(update_response.data)
        assert updated_comment['content'] == "Updated comment"

    def test_update_comment_unauthorized(self, client):
        """Test updating a comment without authentication"""
        update_data = {"content": "Updated comment"}
        response = client.put('/comments/1',
                            data=json.dumps(update_data),
                            content_type='application/json')
        
        assert response.status_code == 401

    def test_update_comment_not_owner(self, client):
        """Test updating another user's comment"""
        # Create first user and recipe with comment
        user1_data = {
            "name": "user1",
            "email": "user1@example.com",
            "password": "password123"
        }
        client.post('/users', data=json.dumps(user1_data), content_type='application/json')
        login1 = client.post('/users/login',
                           data=json.dumps({
                               "email": user1_data["email"],
                               "password": user1_data["password"]
                           }),
                           content_type='application/json')
        token1 = json.loads(login1.data)['token']
        
        # Create recipe and comment
        recipe_response = client.post('/recipes',
                                     data=json.dumps(self.recipe_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token1}'})
        recipe = json.loads(recipe_response.data)
        
        comment_data = {"content": "User1's comment", "recipe_id": recipe['id']}
        comment_response = client.post('/comments',
                                      data=json.dumps(comment_data),
                                      content_type='application/json',
                                      headers={'Authorization': f'Bearer {token1}'})
        comment = json.loads(comment_response.data)
        
        # Create second user
        user2_data = {
            "name": "user2",
            "email": "user2@example.com",
            "password": "password123"
        }
        client.post('/users', data=json.dumps(user2_data), content_type='application/json')
        login2 = client.post('/users/login',
                           data=json.dumps({
                               "email": user2_data["email"],
                               "password": user2_data["password"]
                           }),
                           content_type='application/json')
        token2 = json.loads(login2.data)['token']
        
        # Try to update user1's comment as user2
        update_data = {"content": "Trying to update"}
        response = client.put(f'/comments/{comment["id"]}',
                            data=json.dumps(update_data),
                            content_type='application/json',
                            headers={'Authorization': f'Bearer {token2}'})
        
        assert response.status_code == 403

    def test_delete_comment_success(self, client):
        """Test deleting own comment"""
        # Create user and get token
        client.post('/users', data=json.dumps(self.user_data), content_type='application/json')
        login_response = client.post('/users/login',
                                     data=json.dumps({
                                         "email": self.user_data["email"],
                                         "password": self.user_data["password"]
                                     }),
                                     content_type='application/json')
        login_data = json.loads(login_response.data)
        token = login_data['token']
        
        # Create recipe
        recipe_response = client.post('/recipes',
                                     data=json.dumps(self.recipe_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token}'})
        recipe = json.loads(recipe_response.data)
        
        # Create comment
        comment_data = {"content": "Comment to delete", "recipe_id": recipe['id']}
        comment_response = client.post('/comments',
                                      data=json.dumps(comment_data),
                                      content_type='application/json',
                                      headers={'Authorization': f'Bearer {token}'})
        comment = json.loads(comment_response.data)
        
        # Delete comment
        delete_response = client.delete(f'/comments/{comment["id"]}',
                                       headers={'Authorization': f'Bearer {token}'})
        
        assert delete_response.status_code == 204
        
        # Verify comment is deleted
        get_response = client.get(f'/comments/{comment["id"]}')
        assert get_response.status_code == 404

    def test_delete_comment_unauthorized(self, client):
        """Test deleting a comment without authentication"""
        response = client.delete('/comments/1')
        assert response.status_code == 401

    def test_delete_comment_not_owner(self, client):
        """Test deleting another user's comment"""
        # Create first user and comment
        user1_data = {
            "name": "user1",
            "email": "user1@example.com",
            "password": "password123"
        }
        client.post('/users', data=json.dumps(user1_data), content_type='application/json')
        login1 = client.post('/users/login',
                           data=json.dumps({
                               "email": user1_data["email"],
                               "password": user1_data["password"]
                           }),
                           content_type='application/json')
        token1 = json.loads(login1.data)['token']
        
        # Create recipe and comment
        recipe_response = client.post('/recipes',
                                     data=json.dumps(self.recipe_data),
                                     content_type='application/json',
                                     headers={'Authorization': f'Bearer {token1}'})
        recipe = json.loads(recipe_response.data)
        
        comment_data = {"content": "User1's comment", "recipe_id": recipe['id']}
        comment_response = client.post('/comments',
                                      data=json.dumps(comment_data),
                                      content_type='application/json',
                                      headers={'Authorization': f'Bearer {token1}'})
        comment = json.loads(comment_response.data)
        
        # Create second user
        user2_data = {
            "name": "user2",
            "email": "user2@example.com",
            "password": "password123"
        }
        client.post('/users', data=json.dumps(user2_data), content_type='application/json')
        login2 = client.post('/users/login',
                           data=json.dumps({
                               "email": user2_data["email"],
                               "password": user2_data["password"]
                           }),
                           content_type='application/json')
        token2 = json.loads(login2.data)['token']
        
        # Try to delete user1's comment as user2
        response = client.delete(f'/comments/{comment["id"]}',
                               headers={'Authorization': f'Bearer {token2}'})
        
        assert response.status_code == 403

    def test_comment_not_found(self, client):
        """Test updating/deleting non-existent comment"""
        # Create user and get token
        client.post('/users', data=json.dumps(self.user_data), content_type='application/json')
        login_response = client.post('/users/login',
                                     data=json.dumps({
                                         "email": self.user_data["email"],
                                         "password": self.user_data["password"]
                                     }),
                                     content_type='application/json')
        login_data = json.loads(login_response.data)
        token = login_data['token']
        
        # Try to update non-existent comment
        update_response = client.put('/comments/999',
                                    data=json.dumps({"content": "Updated"}),
                                    content_type='application/json',
                                    headers={'Authorization': f'Bearer {token}'})
        assert update_response.status_code == 404
        
        # Try to delete non-existent comment
        delete_response = client.delete('/comments/999',
                                       headers={'Authorization': f'Bearer {token}'})
        assert delete_response.status_code == 404

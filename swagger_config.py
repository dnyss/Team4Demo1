"""
Swagger/OpenAPI Configuration for Team4Demo1 Recipe Book API
Provides comprehensive API documentation with examples and schemas
"""

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Community Recipe Book API",
        "description": """
# Community Recipe Book API Documentation

A full-stack web application API for sharing, browsing, and commenting on recipes.

## Features
- 🔐 **JWT Authentication** - Secure user authentication with 24-hour tokens
- 👥 **User Management** - Registration and login
- 📝 **Recipe CRUD** - Create, read, update, and delete recipes
- 💬 **Comments System** - Add and manage comments on recipes
- 🔍 **Search Functionality** - Search recipes by title
- 🔒 **Authorization** - Role-based access control for recipe and comment ownership

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get a token by logging in at `/users/login`.

## Architecture
- **Backend**: Flask (Python) with SQLAlchemy ORM
- **Database**: MySQL with clean 3-layer architecture
- **Pattern**: Repository → Service → Controller
- **Validation**: Pydantic schemas

## Base URL
Development: `http://localhost:5000`

## Error Responses
All endpoints return consistent error responses:
```json
{
  "error": "Error message describing what went wrong",
  "details": "Additional technical details (optional)",
  "solution": "Suggested solution (optional)"
}
```

## Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
        """,
        "version": "1.0.0",
        "contact": {
            "name": "Team4Demo1",
            "url": "https://github.com/dnyss/Team4Demo1"
        },
        "license": {
            "name": "MIT"
        }
    },
    "host": "localhost:5000",
    "basePath": "/",
    "schemes": ["http"],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        }
    },
    "tags": [
        {
            "name": "Health",
            "description": "Health check and status endpoints"
        },
        {
            "name": "Authentication",
            "description": "User authentication and authorization"
        },
        {
            "name": "Users",
            "description": "User management operations"
        },
        {
            "name": "Recipes",
            "description": "Recipe CRUD operations"
        },
        {
            "name": "User Recipes",
            "description": "Manage current user's recipes"
        },
        {
            "name": "Comments",
            "description": "Comment operations on recipes"
        },
        {
            "name": "Search",
            "description": "Search functionality"
        }
    ],
    "definitions": {
        "User": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "example": 1
                },
                "name": {
                    "type": "string",
                    "example": "John Doe"
                },
                "email": {
                    "type": "string",
                    "format": "email",
                    "example": "john@example.com"
                }
            }
        },
        "UserCreate": {
            "type": "object",
            "required": ["name", "email", "password"],
            "properties": {
                "name": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 100,
                    "example": "John Doe"
                },
                "email": {
                    "type": "string",
                    "format": "email",
                    "example": "john@example.com"
                },
                "password": {
                    "type": "string",
                    "minLength": 6,
                    "example": "securePassword123"
                }
            }
        },
        "LoginRequest": {
            "type": "object",
            "required": ["email", "password"],
            "properties": {
                "email": {
                    "type": "string",
                    "format": "email",
                    "example": "john@example.com"
                },
                "password": {
                    "type": "string",
                    "example": "securePassword123"
                }
            }
        },
        "LoginResponse": {
            "type": "object",
            "properties": {
                "token": {
                    "type": "string",
                    "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                },
                "user_id": {
                    "type": "integer",
                    "example": 1
                },
                "username": {
                    "type": "string",
                    "example": "John Doe"
                },
                "message": {
                    "type": "string",
                    "example": "Login successful"
                }
            }
        },
        "Recipe": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "example": 1
                },
                "title": {
                    "type": "string",
                    "example": "Chocolate Chip Cookies"
                },
                "dish_type": {
                    "type": "string",
                    "example": "Dessert"
                },
                "ingredients": {
                    "type": "string",
                    "example": "2 cups flour, 1 cup sugar, 1 cup chocolate chips, 2 eggs"
                },
                "instructions": {
                    "type": "string",
                    "example": "1. Mix dry ingredients\n2. Add wet ingredients\n3. Bake at 350°F for 12 minutes"
                },
                "preparation_time": {
                    "type": "integer",
                    "nullable": True,
                    "example": 45,
                    "description": "Time in minutes"
                },
                "servings": {
                    "type": "integer",
                    "nullable": True,
                    "example": 24
                },
                "origin": {
                    "type": "string",
                    "nullable": True,
                    "example": "American"
                },
                "user_id": {
                    "type": "integer",
                    "example": 1
                },
                "user_name": {
                    "type": "string",
                    "example": "John Doe"
                },
                "creation_date": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-10-17T10:30:00"
                }
            }
        },
        "RecipeCreate": {
            "type": "object",
            "required": ["title", "dish_type", "ingredients", "instructions"],
            "properties": {
                "title": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 200,
                    "example": "Chocolate Chip Cookies"
                },
                "dish_type": {
                    "type": "string",
                    "maxLength": 50,
                    "example": "Dessert"
                },
                "ingredients": {
                    "type": "string",
                    "example": "2 cups flour, 1 cup sugar, 1 cup chocolate chips, 2 eggs"
                },
                "instructions": {
                    "type": "string",
                    "example": "1. Mix dry ingredients\n2. Add wet ingredients\n3. Bake at 350°F for 12 minutes"
                },
                "preparation_time": {
                    "type": "integer",
                    "nullable": True,
                    "example": 45,
                    "description": "Time in minutes"
                },
                "servings": {
                    "type": "integer",
                    "nullable": True,
                    "example": 24
                },
                "origin": {
                    "type": "string",
                    "nullable": True,
                    "maxLength": 100,
                    "example": "American"
                }
            }
        },
        "RecipeUpdate": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 200,
                    "example": "Updated Chocolate Chip Cookies"
                },
                "dish_type": {
                    "type": "string",
                    "maxLength": 50,
                    "example": "Dessert"
                },
                "ingredients": {
                    "type": "string",
                    "example": "2 cups flour, 1 cup brown sugar, 1 cup chocolate chips, 2 eggs"
                },
                "instructions": {
                    "type": "string",
                    "example": "1. Mix dry ingredients\n2. Add wet ingredients\n3. Bake at 375°F for 10 minutes"
                },
                "preparation_time": {
                    "type": "integer",
                    "nullable": True,
                    "example": 40
                },
                "servings": {
                    "type": "integer",
                    "nullable": True,
                    "example": 30
                },
                "origin": {
                    "type": "string",
                    "nullable": True,
                    "maxLength": 100,
                    "example": "American"
                }
            }
        },
        "Comment": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "example": 1
                },
                "comment": {
                    "type": "string",
                    "example": "This recipe is amazing! My family loved it."
                },
                "comment_date": {
                    "type": "string",
                    "format": "date-time",
                    "example": "2025-10-17T14:30:00"
                },
                "user_id": {
                    "type": "integer",
                    "example": 2
                },
                "user_name": {
                    "type": "string",
                    "example": "Jane Smith"
                },
                "recipe_id": {
                    "type": "integer",
                    "example": 5
                }
            }
        },
        "CommentCreate": {
            "type": "object",
            "required": ["comment", "recipe_id"],
            "properties": {
                "comment": {
                    "type": "string",
                    "minLength": 1,
                    "example": "This recipe is amazing! My family loved it."
                },
                "recipe_id": {
                    "type": "integer",
                    "example": 5
                }
            }
        },
        "CommentUpdate": {
            "type": "object",
            "required": ["comment"],
            "properties": {
                "comment": {
                    "type": "string",
                    "minLength": 1,
                    "example": "Updated: This recipe is absolutely fantastic!"
                }
            }
        },
        "Error": {
            "type": "object",
            "properties": {
                "error": {
                    "type": "string",
                    "example": "Resource not found"
                },
                "details": {
                    "type": "string",
                    "example": "Recipe with id 999 does not exist"
                },
                "solution": {
                    "type": "string",
                    "example": "Check the recipe ID and try again"
                }
            }
        }
    }
}

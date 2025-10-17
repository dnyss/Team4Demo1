from database import SessionLocal
from services.user_service import UserService
from services.recipe_service import RecipeService
from services.comment_service import CommentService
from schemas.user_schemas import UserCreate
from schemas.recipe_schemas import RecipeCreate
from schemas.comment_schemas import CommentCreate


def create_sample_data():
    db = SessionLocal()

    try:
        print("🎯 Creating sample data...")

        # 1. CREATE USERS
        print("👥 Creating users...")
        users_data = [
            {
                "name": "Ana García",
                "email": "ana@example.com",
                "password": "password123"
            },
            {
                "name": "Carlos López",
                "email": "carlos@example.com",
                "password": "password123"
            },
            {
                "name": "María Rodríguez",
                "email": "maria@example.com",
                "password": "password123"
            },
            {
                "name": "John Smith",
                "email": "john@example.com",
                "password": "password123"
            }
        ]

        created_users = []
        for user_data in users_data:
            try:
                user = UserService.create_user(db, UserCreate(**user_data))
                created_users.append(user)
                print(f"   ✅ User created: {user.name} (ID: {user.id})")
            except Exception as e:
                print(f"   ⚠️  User {user_data['name']} already exists: {e}")

        # 2. CREATE RECIPES
        print("\n🍳 Creating recipes...")
        recipes_data = [
            {
                "title": "Spaghetti Carbonara",
                "dish_type": "Main Course",
                "ingredients": "Spaghetti, eggs, pancetta, parmesan cheese, black pepper",
                "instructions": "Cook pasta, mix with eggs and pancetta, add cheese and pepper",
                "preparation_time": "30 minutes",
                "origin": "Italian",
                "servings": 4,
                "user_id": created_users[0].id
            },
            {
                "title": "Caesar Salad",
                "dish_type": "Appetizer",
                "ingredients": "Lettuce, croutons, parmesan cheese, Caesar dressing, lemon",
                "instructions": "Mix lettuce with croutons and cheese, add dressing and a touch of lemon",
                "preparation_time": "15 minutes",
                "origin": "Mexican",
                "servings": 2,
                "user_id": created_users[1].id
            },
            {
                "title": "Tomato Soup",
                "dish_type": "Soup",
                "ingredients": "Tomatoes, onion, garlic, vegetable broth, cream, basil",
                "instructions": "Sauté onion and garlic, add tomatoes and broth, cook and blend, add cream and basil",
                "preparation_time": "45 minutes",
                "origin": "Spanish",
                "servings": 6,
                "user_id": created_users[2].id
            },
            {
                "title": "Chocolate Brownies",
                "dish_type": "Dessert",
                "ingredients": "Chocolate, butter, eggs, sugar, flour, walnuts",
                "instructions": "Melt chocolate with butter, mix with eggs and sugar, add flour and walnuts, bake for 25 min",
                "preparation_time": "40 minutes",
                "origin": "American",
                "servings": 8,
                "user_id": created_users[0].id
            },
            {
                "title": "Chicken Curry",
                "dish_type": "Main Course",
                "ingredients": "Chicken, curry powder, coconut milk, onions, garlic, ginger",
                "instructions": "Sauté onions, garlic and ginger, add chicken and curry, pour coconut milk and simmer",
                "preparation_time": "50 minutes",
                "origin": "Indian",
                "servings": 4,
                "user_id": created_users[3].id
            }
        ]

        created_recipes = []
        for recipe_data in recipes_data:
            recipe = RecipeService.create_recipe(db, RecipeCreate(**recipe_data))
            created_recipes.append(recipe)
            print(f"   ✅ Recipe created: {recipe.title} (ID: {recipe.id})")

        # 3. CREATE COMMENTS
        print("\n💬 Creating comments...")
        comments_data = [
            {
                "content": "This recipe is amazing! My family loved it. I will definitely make it again.",
                "rating": 5.0,
                "user_id": created_users[1].id,
                "recipe_id": created_recipes[0].id
            },
            {
                "content": "Very good recipe, although I added a bit more cheese. It turned out perfect!",
                "rating": 4.5,
                "user_id": created_users[2].id,
                "recipe_id": created_recipes[0].id
            },
            {
                "content": "Perfect for summer, fresh and easy to prepare. I loved the dressing.",
                "rating": 4.0,
                "user_id": created_users[0].id,
                "recipe_id": created_recipes[1].id
            },
            {
                "content": "The soup turned out very creamy and tasty. Ideal for cold days.",
                "rating": 4.5,
                "user_id": created_users[1].id,
                "recipe_id": created_recipes[2].id
            },
            {
                "content": "The brownies were delicious, very chocolatey. The kids loved them.",
                "rating": 5.0,
                "user_id": created_users[2].id,
                "recipe_id": created_recipes[3].id
            },
            {
                "content": "Good base recipe, I added extra chocolate chips and it turned out spectacular.",
                "rating": 4.0,
                "user_id": created_users[1].id,
                "recipe_id": created_recipes[3].id
            },
            {
                "content": "Authentic flavor! This curry tastes just like what I had in India.",
                "rating": 5.0,
                "user_id": created_users[0].id,
                "recipe_id": created_recipes[4].id
            },
            {
                "content": "A bit spicy for my taste, but overall a great recipe. Next time I'll use less curry powder.",
                "rating": 3.5,
                "user_id": created_users[2].id,
                "recipe_id": created_recipes[4].id
            }
        ]

        for comment_data in comments_data:
            comment = CommentService.create_comment(db, CommentCreate(**comment_data))
            print(f"   ✅ Comment created: {comment.content[:30]}... (ID: {comment.id})")

        print("\n🎉 Sample data created successfully!")
        print("\n📊 Summary:")
        print(f"   👥 Users: {len(created_users)}")
        print(f"   🍳 Recipes: {len(created_recipes)}")
        print(f"   💬 Comments: {len(comments_data)}")
        print(f"   🗄️  Database: recipes.db")

        print("\n🔗 Endpoints to test:")
        print("   GET  http://127.0.0.1:5000/users")
        print("   GET  http://127.0.0.1:5000/recipes")
        print("   GET  http://127.0.0.1:5000/comments")
        print("   GET  http://127.0.0.1:5000/recipes/1/comments")
        print("   GET  http://127.0.0.1:5000/users/1/recipes")
        print("   GET  http://127.0.0.1:5000/users/1/comments")

    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_data()
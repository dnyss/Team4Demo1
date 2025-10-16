from database import SessionLocal
from models.user import User
from models.recipe import Recipe
from models.comment import Comment
from repositories.user_repository import UserRepository
from datetime import datetime

def seed_database():
    """
    Populate the database with initial seed data for testing and development.
    Creates users, recipes, and comments with realistic data.
    """
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Database already has {existing_users} users. Skipping seed.")
            response = input("Do you want to clear and reseed? (yes/no): ")
            if response.lower() != 'yes':
                print("Seed cancelled.")
                return
            else:
                # Clear existing data
                print("🗑️  Clearing existing data...")
                db.query(Comment).delete()
                db.query(Recipe).delete()
                db.query(User).delete()
                db.commit()
        
        # Create seed users
        print("👥 Creating users...")
        
        users_data = [
            {"name": "Chef Maria", "email": "maria@recipes.com", "password": "chef123"},
            {"name": "John Baker", "email": "john@recipes.com", "password": "baker123"},
            {"name": "Sarah Cook", "email": "sarah@recipes.com", "password": "cook123"},
        ]
        
        users = []
        for user_data in users_data:
            hashed_password = UserRepository.hash_password(user_data["password"])
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password=hashed_password
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ Created {len(users)} users")
        
        # Refresh to get IDs
        for user in users:
            db.refresh(user)
        
        # Create seed recipes
        print("🍳 Creating recipes...")
        
        recipes_data = [
            {
                "title": "Classic Chocolate Chip Cookies",
                "dish_type": "Dessert",
                "ingredients": "2 1/4 cups all-purpose flour\n1 tsp baking soda\n1 tsp salt\n1 cup butter, softened\n3/4 cup granulated sugar\n3/4 cup packed brown sugar\n2 large eggs\n2 tsp vanilla extract\n2 cups chocolate chips",
                "instructions": "1. Preheat oven to 375°F (190°C)\n2. Mix flour, baking soda, and salt in a bowl\n3. Beat butter and sugars until creamy\n4. Add eggs and vanilla, beat well\n5. Gradually blend in flour mixture\n6. Stir in chocolate chips\n7. Drop rounded tablespoons onto ungreased cookie sheets\n8. Bake 9-11 minutes until golden brown\n9. Cool on wire racks",
                "preparation_time": "30 minutes",
                "origin": "American",
                "servings": 48,
                "user_id": users[0].id
            },
            {
                "title": "Vegetable Stir Fry",
                "dish_type": "Main Course",
                "ingredients": "2 tbsp vegetable oil\n1 red bell pepper, sliced\n1 yellow bell pepper, sliced\n2 cups broccoli florets\n1 cup snap peas\n2 carrots, sliced\n3 cloves garlic, minced\n1 tbsp ginger, grated\n3 tbsp soy sauce\n1 tbsp sesame oil\n2 tsp cornstarch\n1/4 cup water",
                "instructions": "1. Heat oil in a large wok or skillet over high heat\n2. Add garlic and ginger, stir-fry for 30 seconds\n3. Add all vegetables, stir-fry for 5-7 minutes\n4. Mix soy sauce, sesame oil, cornstarch, and water\n5. Pour sauce over vegetables\n6. Cook for 2-3 minutes until sauce thickens\n7. Serve hot over rice",
                "preparation_time": "20 minutes",
                "origin": "Asian",
                "servings": 4,
                "user_id": users[1].id
            },
            {
                "title": "Creamy Tomato Soup",
                "dish_type": "Soup",
                "ingredients": "2 tbsp olive oil\n1 onion, diced\n4 cloves garlic, minced\n28 oz can crushed tomatoes\n2 cups vegetable broth\n1 cup heavy cream\n2 tsp sugar\n1 tsp dried basil\nSalt and pepper to taste\nFresh basil for garnish",
                "instructions": "1. Heat olive oil in a large pot over medium heat\n2. Sauté onion until soft, about 5 minutes\n3. Add garlic, cook for 1 minute\n4. Add crushed tomatoes, broth, sugar, and basil\n5. Bring to a boil, then simmer for 20 minutes\n6. Use an immersion blender to puree until smooth\n7. Stir in heavy cream\n8. Season with salt and pepper\n9. Garnish with fresh basil and serve hot",
                "preparation_time": "35 minutes",
                "origin": "Italian",
                "servings": 6,
                "user_id": users[0].id
            },
            {
                "title": "Honey Garlic Salmon",
                "dish_type": "Main Course",
                "ingredients": "4 salmon fillets\n1/4 cup honey\n3 tbsp soy sauce\n3 cloves garlic, minced\n1 tbsp olive oil\n1 tsp ginger, grated\n2 tbsp lemon juice\nSalt and pepper to taste\nSesame seeds and green onions for garnish",
                "instructions": "1. Preheat oven to 400°F (200°C)\n2. Mix honey, soy sauce, garlic, ginger, and lemon juice\n3. Season salmon with salt and pepper\n4. Heat oil in an oven-safe skillet\n5. Sear salmon skin-side up for 3 minutes\n6. Flip and pour honey garlic sauce over salmon\n7. Transfer to oven and bake for 8-10 minutes\n8. Garnish with sesame seeds and green onions\n9. Serve with rice and vegetables",
                "preparation_time": "25 minutes",
                "origin": "Asian Fusion",
                "servings": 4,
                "user_id": users[2].id
            },
            {
                "title": "Caprese Salad",
                "dish_type": "Appetizer",
                "ingredients": "4 large tomatoes, sliced\n16 oz fresh mozzarella, sliced\nFresh basil leaves\n1/4 cup extra virgin olive oil\n2 tbsp balsamic vinegar\nSalt and pepper to taste",
                "instructions": "1. Arrange tomato and mozzarella slices alternately on a platter\n2. Tuck basil leaves between slices\n3. Drizzle with olive oil and balsamic vinegar\n4. Season with salt and pepper\n5. Let sit for 10 minutes before serving\n6. Serve at room temperature",
                "preparation_time": "15 minutes",
                "origin": "Italian",
                "servings": 4,
                "user_id": users[1].id
            },
            {
                "title": "Chicken Tacos",
                "dish_type": "Main Course",
                "ingredients": "1 lb chicken breast, diced\n2 tbsp taco seasoning\n1 tbsp oil\n8 small tortillas\n1 cup shredded lettuce\n1 cup diced tomatoes\n1/2 cup shredded cheese\n1/2 cup sour cream\n1 avocado, sliced\nLime wedges",
                "instructions": "1. Season chicken with taco seasoning\n2. Heat oil in a skillet over medium-high heat\n3. Cook chicken until golden and cooked through, about 8 minutes\n4. Warm tortillas in a dry skillet\n5. Fill tortillas with chicken\n6. Top with lettuce, tomatoes, cheese, sour cream, and avocado\n7. Serve with lime wedges\n8. Enjoy immediately",
                "preparation_time": "20 minutes",
                "origin": "Mexican",
                "servings": 4,
                "user_id": users[2].id
            },
            {
                "title": "Banana Bread",
                "dish_type": "Dessert",
                "ingredients": "3 ripe bananas, mashed\n1/3 cup melted butter\n3/4 cup sugar\n1 egg, beaten\n1 tsp vanilla extract\n1 tsp baking soda\n1/4 tsp salt\n1 1/2 cups all-purpose flour\n1/2 cup chopped walnuts (optional)",
                "instructions": "1. Preheat oven to 350°F (175°C)\n2. Grease a 9x5 inch loaf pan\n3. Mix mashed bananas with melted butter\n4. Stir in sugar, egg, and vanilla\n5. Add baking soda and salt\n6. Fold in flour until just combined\n7. Stir in walnuts if using\n8. Pour into prepared pan\n9. Bake for 60 minutes until toothpick comes out clean\n10. Cool in pan for 10 minutes, then turn out onto wire rack",
                "preparation_time": "75 minutes",
                "origin": "American",
                "servings": 8,
                "user_id": users[0].id
            },
            {
                "title": "Greek Salad",
                "dish_type": "Salad",
                "ingredients": "4 tomatoes, cut into wedges\n1 cucumber, sliced\n1 red onion, thinly sliced\n1 green bell pepper, sliced\n1 cup Kalamata olives\n8 oz feta cheese, cubed\n1/4 cup olive oil\n2 tbsp red wine vinegar\n1 tsp dried oregano\nSalt and pepper to taste",
                "instructions": "1. Combine tomatoes, cucumber, onion, and bell pepper in a large bowl\n2. Add olives and feta cheese\n3. Whisk together olive oil, vinegar, and oregano\n4. Pour dressing over salad\n5. Toss gently to combine\n6. Season with salt and pepper\n7. Let sit for 15 minutes before serving\n8. Serve at room temperature",
                "preparation_time": "20 minutes",
                "origin": "Greek",
                "servings": 6,
                "user_id": users[1].id
            }
        ]
        
        recipes = []
        for recipe_data in recipes_data:
            recipe = Recipe(**recipe_data)
            db.add(recipe)
            recipes.append(recipe)
        
        db.commit()
        print(f"✅ Created {len(recipes)} recipes")
        
        # Refresh to get IDs
        for recipe in recipes:
            db.refresh(recipe)
        
        # Create seed comments
        print("💬 Creating comments...")
        
        comments_data = [
            {"content": "Absolutely delicious! My family loved these cookies.", "rating": 5.0, "user_id": users[1].id, "recipe_id": recipes[0].id},
            {"content": "Perfect for a quick weeknight dinner!", "rating": 4.5, "user_id": users[2].id, "recipe_id": recipes[1].id},
            {"content": "So comforting and easy to make. Will make again!", "rating": 5.0, "user_id": users[0].id, "recipe_id": recipes[2].id},
            {"content": "The best cookies I've ever made. Thank you for sharing!", "rating": 5.0, "user_id": users[2].id, "recipe_id": recipes[0].id},
            {"content": "Healthy and delicious. Great recipe!", "rating": 4.0, "user_id": users[0].id, "recipe_id": recipes[1].id},
            {"content": "Restaurant quality! The honey garlic sauce is amazing.", "rating": 5.0, "user_id": users[1].id, "recipe_id": recipes[3].id},
            {"content": "Simple but so fresh and flavorful.", "rating": 4.5, "user_id": users[2].id, "recipe_id": recipes[4].id},
            {"content": "My go-to taco recipe now!", "rating": 5.0, "user_id": users[0].id, "recipe_id": recipes[5].id},
        ]
        
        for comment_data in comments_data:
            comment = Comment(**comment_data)
            db.add(comment)
        
        db.commit()
        print(f"✅ Created {len(comments_data)} comments")
        
        print("\n🎉 Database seeding completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Users: {len(users)}")
        print(f"   - Recipes: {len(recipes)}")
        print(f"   - Comments: {len(comments_data)}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

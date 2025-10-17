from database import engine, Base

# Import all models so they register with Base.metadata
try:
    from models.user import User
    from models.recipe import Recipe
    from models.comment import Comment
    print("✅ Models imported successfully")
except ImportError as e:
    print(f"❌ Error importing models: {e}")
    print("Make sure all model files exist in the models/ directory")
    exit(1)

def create_tables():
    print("Creating tables...")
    print(f"📊 Found {len(Base.metadata.tables)} tables to create")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    print("📊 Tables created: users, recipes, comments")

if __name__ == "__main__":
    create_tables()
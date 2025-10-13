from database import engine, Base

def create_tables():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    print("📊 Tables created: users, recipes, comments")

if __name__ == "__main__":
    create_tables()
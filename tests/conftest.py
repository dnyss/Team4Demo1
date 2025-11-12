import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set testing environment before importing app modules
os.environ['FLASK_ENV'] = 'testing'
os.environ['TESTING'] = 'true'

# Load environment variables before importing app modules
from dotenv import load_dotenv
load_dotenv()

import pytest
from app import app as flask_app
from database import SessionLocal, Base, engine


@pytest.fixture(scope="session")
def test_app():
    """Session-scoped fixture that creates the Flask app for testing."""
    flask_app.config['TESTING'] = True
    yield flask_app


@pytest.fixture(scope="session")
def init_database():
    """Session-scoped fixture that creates all database tables once for all tests."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop all tables after all tests complete
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(init_database):
    """Function-scoped fixture that provides a clean database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)
    
    yield session
    
    # Rollback transaction and close connection after each test
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(test_app, init_database):
    """Function-scoped fixture that provides a test client with clean database state."""
    # Clear all data before each test
    with engine.connect() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
        connection.commit()

    with test_app.test_client() as client:
        yield client
    
    # Clean up after test
    with engine.connect() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
        connection.commit()


# Test Data Fixtures

@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing."""
    from models.user import User
    from werkzeug.security import generate_password_hash
    
    user = User(
        name="Test User",
        email="testuser@example.com",
        password=generate_password_hash("password123")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_user_2(db_session):
    """Create a second sample user for testing."""
    from models.user import User
    from werkzeug.security import generate_password_hash
    
    user = User(
        name="Test User 2",
        email="testuser2@example.com",
        password=generate_password_hash("password456")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_recipe(db_session, sample_user):
    """Create a sample recipe for testing."""
    from models.recipe import Recipe
    
    recipe = Recipe(
        title="Test Recipe",
        dish_type="Main Course",
        ingredients="Test ingredients",
        instructions="Test instructions",
        preparation_time="30 minutes",
        origin="Test Country",
        servings=4,
        user_id=sample_user.id
    )
    db_session.add(recipe)
    db_session.commit()
    db_session.refresh(recipe)
    return recipe


@pytest.fixture
def sample_recipes(db_session, sample_user):
    """Create multiple sample recipes for testing."""
    from models.recipe import Recipe
    
    recipes = [
        Recipe(
            title=f"Test Recipe {i}",
            dish_type="Main Course" if i % 2 == 0 else "Dessert",
            ingredients=f"Ingredients for recipe {i}",
            instructions=f"Instructions for recipe {i}",
            preparation_time=f"{30 + i * 10} minutes",
            origin="Test Country",
            servings=4,
            user_id=sample_user.id
        )
        for i in range(1, 4)
    ]
    
    for recipe in recipes:
        db_session.add(recipe)
    db_session.commit()
    
    for recipe in recipes:
        db_session.refresh(recipe)
    
    return recipes


@pytest.fixture
def sample_comment(db_session, sample_user, sample_recipe):
    """Create a sample comment for testing."""
    from models.comment import Comment
    
    comment = Comment(
        content="This is a test comment",
        rating=4.5,
        user_id=sample_user.id,
        recipe_id=sample_recipe.id
    )
    db_session.add(comment)
    db_session.commit()
    db_session.refresh(comment)
    return comment


@pytest.fixture
def sample_comments(db_session, sample_user, sample_user_2, sample_recipe):
    """Create multiple sample comments for testing."""
    from models.comment import Comment
    
    comments = [
        Comment(
            content=f"Test comment {i}",
            rating=float(i),
            user_id=sample_user.id if i % 2 == 0 else sample_user_2.id,
            recipe_id=sample_recipe.id
        )
        for i in range(1, 4)
    ]
    
    for comment in comments:
        db_session.add(comment)
    db_session.commit()
    
    for comment in comments:
        db_session.refresh(comment)
    
    return comments

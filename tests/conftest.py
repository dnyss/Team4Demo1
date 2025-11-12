import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables before importing app modules
from dotenv import load_dotenv
load_dotenv()

import pytest
from app import app as flask_app
from database import SessionLocal, Base, engine

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    
    # Clear all data before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with flask_app.test_client() as client:
        yield client
    
    # Clean up after test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

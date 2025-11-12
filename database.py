import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

# Get database configuration from environment variables
# Check if we're in testing environment
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
IS_TESTING = FLASK_ENV == 'testing' or os.getenv('TESTING', 'false').lower() == 'true'

# Use test database configuration if in testing mode
if IS_TESTING:
    MYSQL_USER = os.getenv('MYSQL_TEST_USER', os.getenv('MYSQL_USER', 'root'))
    MYSQL_PASSWORD = os.getenv('MYSQL_TEST_ROOT_PASSWORD', 'test_admin')
    MYSQL_HOST = os.getenv('MYSQL_TEST_HOST', os.getenv('MYSQL_HOST', 'db-test'))
    MYSQL_PORT = os.getenv('MYSQL_TEST_PORT', '3306')
    MYSQL_DATABASE = os.getenv('MYSQL_TEST_DATABASE', 'bdd_test')
else:
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_ROOT_PASSWORD', 'admin')
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'db')
    MYSQL_PORT = os.getenv('MYSQL_PORT', '3306')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'bdd')

SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
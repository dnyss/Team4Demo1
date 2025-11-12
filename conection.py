import os
from dotenv import load_dotenv
import mysql.connector

# Load environment variables from .env file
load_dotenv()

# Get database configuration from environment variables
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_ROOT_PASSWORD', 'admin')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'db')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'bdd')
MYSQL_PORT = os.getenv('MYSQL_PORT', '3306')

conexion = mysql.connector.connect(
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    host=MYSQL_HOST,
    database=MYSQL_DATABASE,
    port=MYSQL_PORT
)

print(conexion)
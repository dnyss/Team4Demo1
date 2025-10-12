import mysql.connector

conexion = mysql.connector.connect(
    user='root',
    password='admin',
    host="localhost",
    database="bdd",
    port="3306"
)

print(conexion)
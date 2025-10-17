import mysql.connector

conexion = mysql.connector.connect(
    user='root',
    password='admin',
    host="db",
    database="bdd",
    port="3306"
)

print(conexion)
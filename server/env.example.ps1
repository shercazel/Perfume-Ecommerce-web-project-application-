$env:DB_SERVER = 'localhost'
$env:API_PORT = '3000'
$env:CORS_ORIGIN = 'http://localhost:4200'
# For SQL Express, use either:
# $env:DB_SERVER = 'localhost\SQLEXPRESS'
# or:
# $env:DB_SERVER = 'localhost'
# $env:DB_INSTANCE = 'SQLEXPRESS'
$env:DB_NAME = 'Votre_Scent'
$env:DB_USER = 'sa'
$env:DB_PASSWORD = 'your_sql_server_password'
$env:DB_ENCRYPT = 'false'
$env:DB_TRUST_SERVER_CERTIFICATE = 'true'

npm run api

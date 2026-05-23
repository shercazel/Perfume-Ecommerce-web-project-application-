$env:DB_SERVER = 'localhost'
# For SQL Express, use either:
# $env:DB_SERVER = 'localhost\SQLEXPRESS'
# or:
# $env:DB_SERVER = 'localhost'
# $env:DB_INSTANCE = 'SQLEXPRESS'
$env:DB_NAME = 'VotrescentDb'
$env:DB_USER = 'sa'
$env:DB_PASSWORD = 'your_sql_server_password'
$env:DB_ENCRYPT = 'false'
$env:DB_TRUST_SERVER_CERTIFICATE = 'true'

npm run api

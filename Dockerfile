from postgres:alpine

# Set environment variables for PostgreSQL username and password
#ENV POSTGRES_USER osama
#ENV POSTGRES_PASSWORD 123456
#ENV POSTGRES_HOST_AUTH_METHOD=trust
copy init_table.sql /docker-entrypoint-initdb.d/


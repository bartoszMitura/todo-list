# Script to execute SQL modifications on PostgreSQL through Docker
# Run this from the root of your project directory

# Copy the SQL file into the Docker container
echo "Copying SQL file to Docker container..."
docker cp SQL/task_extension.sql todolist-postgres:/tmp/

# Execute the SQL script
echo "Executing SQL script..."
docker exec -it todolist-postgres psql -U postgres -d todolistdb -f /tmp/task_extension.sql

echo "Done."

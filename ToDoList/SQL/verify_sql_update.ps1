# Script to verify SQL modifications on PostgreSQL through Docker
# Run this after run_sql_update.ps1

# Copy the SQL file into the Docker container
echo "Copying verification SQL file to Docker container..."
docker cp SQL/verify_changes.sql todolist-postgres:/tmp/

# Execute the SQL script
echo "Executing verification SQL script..."
docker exec -it todolist-postgres psql -U postgres -d todolistdb -f /tmp/verify_changes.sql

echo "Verification complete."

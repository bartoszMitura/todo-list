# SQL Scripts for Database Management

This directory contains SQL scripts to manage and update the PostgreSQL database schema directly.

## Available Scripts

- `task_extension.sql` - Adds columns for expanded task functionality (start time, end time, category, status)
- `verify_changes.sql` - Verifies that the database schema changes were applied correctly

## PowerShell Script Helpers

- `run_sql_update.ps1` - Script to run SQL updates against the Docker container
- `verify_sql_update.ps1` - Script to verify the applied changes

## Usage

From the root of the project directory, run:

```powershell
# To apply the database changes
cd ToDoList
.\SQL\run_sql_update.ps1

# To verify changes were applied correctly
.\SQL\verify_sql_update.ps1
```

## Note

These SQL scripts are provided as an alternative to Entity Framework Core migrations when the migration system encounters issues with Docker or connection problems.

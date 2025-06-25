-- Script to verify that the columns were added correctly
-- Run this after task_extension.sql has been executed

-- Check if columns exist in TodoItems table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'TodoItems' 
  AND column_name IN ('StartTime', 'EndTime', 'Category', 'Status');

-- Check if index exists on Category column
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'TodoItems' 
  AND indexname = 'IX_TodoItems_Category';

-- Optional: See a sample of the data with new columns
SELECT "Id", "Title", "IsCompleted", "StartTime", "EndTime", "Category", "Status" 
FROM "TodoItems" 
LIMIT 10;

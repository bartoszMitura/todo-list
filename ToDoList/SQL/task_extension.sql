-- Script to add new columns for task functionality
-- Run this script against your PostgreSQL database if migrations are not working

-- Add new columns to TodoItems table
ALTER TABLE "TodoItems" ADD COLUMN IF NOT EXISTS "StartTime" timestamp with time zone;
ALTER TABLE "TodoItems" ADD COLUMN IF NOT EXISTS "EndTime" timestamp with time zone;
ALTER TABLE "TodoItems" ADD COLUMN IF NOT EXISTS "Category" character varying(50);

-- Add Status column with default value of 0 (NotStarted)
ALTER TABLE "TodoItems" ADD COLUMN IF NOT EXISTS "Status" integer NOT NULL DEFAULT 0;

-- Create an index on the Category for faster filtering by category
CREATE INDEX IF NOT EXISTS "IX_TodoItems_Category" ON "TodoItems" ("Category");

-- Update existing records to set Status based on IsCompleted
UPDATE "TodoItems" SET "Status" = 2 WHERE "IsCompleted" = true; -- 2 = Completed

-- Create enum type for Status if you want to enforce value constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taskstatus') THEN
        CREATE TYPE taskstatus AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Delayed', 'Cancelled');
    END IF;
END$$;

-- Optional: You can add comments to document the columns
COMMENT ON COLUMN "TodoItems"."StartTime" IS 'Planned start time for the task';
COMMENT ON COLUMN "TodoItems"."EndTime" IS 'Planned end time or deadline for the task';
COMMENT ON COLUMN "TodoItems"."Category" IS 'Optional category for grouping tasks';
COMMENT ON COLUMN "TodoItems"."Status" IS 'Task status: 0=NotStarted, 1=InProgress, 2=Completed, 3=Delayed, 4=Cancelled';

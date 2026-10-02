-- Add the teacher's optional homework attachment without changing existing rows.
ALTER TABLE "Homework" ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT;

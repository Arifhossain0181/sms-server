-- Store a student's written answer and uploaded submission file.
ALTER TABLE "HomeworkSubmission" ADD COLUMN IF NOT EXISTS "answerText" TEXT;
ALTER TABLE "HomeworkSubmission" ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT;

import { Request, Response, NextFunction } from 'express';
import { HomeworkService } from './homework.service';
import { sendSuccess } from '../../utils/response.util';
import { TeachersService } from '../teachers/teachers.service';
import { StudentService } from '../student/student.service';
import { ParentsService } from '../parents/parents.service';
import prisma from '../../config/db';
import { uploadFileToCloudinary } from '../../config/cloudinary';
import { gradeHomeworkSubmission } from './homework-ai-grader.service';

export class HomeworkController {
  // ── TEACHER: create 
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const attachmentUrl = req.file
        ? (await uploadFileToCloudinary(req.file.buffer, 'homework/resources')).secure_url
        : undefined;
      const homework = await HomeworkService.create(teacherId, { ...req.body, attachmentUrl });
      sendSuccess(res, homework, 'Homework created', 201);
    } catch (err) { next(err); }
  }

  // ── TEACHER: update 
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const attachmentUrl = req.file
        ? (await uploadFileToCloudinary(req.file.buffer, 'homework/resources')).secure_url
        : undefined;
      const homework = await HomeworkService.update(teacherId, req.params.id as string, { ...req.body, ...(attachmentUrl && { attachmentUrl }) });
      sendSuccess(res, homework, 'Homework updated');
    } catch (err) { next(err); }
  }

  // ── TEACHER: mark reviewed 
  async markReviewed(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const homework = await HomeworkService.markReviewed(teacherId, req.params.id as string);
      sendSuccess(res, homework, 'Homework marked as reviewed');
    } catch (err) { next(err); }
  }

  // ── TEACHER: delete ─
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      await HomeworkService.delete(teacherId, req.params.id as string);
      sendSuccess(res, null, 'Homework deleted');
    } catch (err) { next(err); }
  }

  // ── TEACHER: list own homework, filterable 
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const { sectionId, subjectId, status, page, pageSize } = req.query as any;
      const result = await HomeworkService.listMine(teacherId, {
        sectionId, subjectId, status,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Homework fetched');
    } catch (err) { next(err); }
  }

  // ── TEACHER dashboard widget: overdue & unreviewed 
  async listOverdue(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const data = await HomeworkService.listOverdue(teacherId);
      sendSuccess(res, data, 'Overdue homework fetched');
    } catch (err) { next(err); }
  }

  // ── ADMIN / TEACHER: single item with view stats 
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const homework = await HomeworkService.getById(req.params.id as string);
      sendSuccess(res, homework, 'Homework fetched');
    } catch (err) { next(err); }
  }

  // ── TEACHER: evaluate homework with student view details 
  async getEvaluationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const result = await HomeworkService.getEvaluationDetails(req.params.id as string);
      
      // Verify teacher owns this homework
      const homework = await prisma.homework.findUnique({
        where: { id: req.params.id as string },
        select: { teacherId: true },
      });
      if (!homework) throw new Error('Homework not found');
      if (homework.teacherId !== teacherId) throw new Error('You can only evaluate your own homework');

      sendSuccess(res, result, 'Evaluation details fetched');
    } catch (err) { next(err); }
  }

  // ── STUDENT: own homework 
  async getMyHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(403).json({ success: false, message: 'Student profile not found for this user' });

      const { status, page, pageSize } = req.query as any;
      const result = await HomeworkService.getMyHomework(studentId, {
        status, page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, result, 'Your homework fetched');
    } catch (err) { next(err); }
  }

  // ── STUDENT: mark one item as viewed 
  async markViewed(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(403).json({ success: false, message: 'Student profile not found for this user' });

      const result = await HomeworkService.markViewed(studentId, req.params.id as string);
      sendSuccess(res, result, 'Marked as viewed');
    } catch (err) { next(err); }
  }

  // ── STUDENT: submit homework answer and optional attachment
  async submitSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = await StudentService.getStudentIdByUserId((req.user as any)?.id);
      if (!studentId) return res.status(403).json({ success: false, message: 'Student profile not found for this user' });

      const attachmentUrl = req.file
        ? (await uploadFileToCloudinary(req.file.buffer, 'homework/submissions')).secure_url
        : undefined;
      let result = await HomeworkService.submitSolution(studentId, req.params.id as string, req.body.answerText, attachmentUrl);

      if (req.file?.mimetype === 'application/pdf' && result.id) {
        try {
          result = await gradeHomeworkSubmission({
            submissionId: result.id,
            homeworkId: req.params.id as string,
            pdfBuffer: req.file.buffer,
            mimeType: req.file.mimetype,
          }) as typeof result;
        } catch (error) {
          console.error('[HOMEWORK_AI_GRADING_FAILED]', error);
        }
      }

      sendSuccess(res, result, 'Homework submitted');
    } catch (err) { next(err); }
  }

  // ── PARENT: a specific child's homework 
  async getChildHomework(req: Request, res: Response, next: NextFunction) {
    try {
      const parentId = await ParentsService.getParentIdByUserId((req.user as any)?.id);
      if (!parentId) return res.status(403).json({ success: false, message: 'Parent profile not found for this user' });

      const { status, page, pageSize } = req.query as any;
      const result = await HomeworkService.getChildHomework(parentId, req.params.studentId as string, {
        status, page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined,
      });
      sendSuccess(res, "Child's homework fetched", result as any);
    } catch (err) { next(err); }
  }

  // ── TEACHER: submit/update marks for a student's homework ─────────
  async submitMark(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const { studentId, marks, feedback } = req.body;
      const result = await HomeworkService.submitMark(teacherId, req.params.id as string, studentId, marks, feedback);
      sendSuccess(res, result, 'Mark submitted');
    } catch (err) { next(err); }
  }

  //  TEACHER: get all submissions for a homework 
  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const result = await HomeworkService.getSubmissions(teacherId, req.params.id as string);
      sendSuccess(res, result, 'Submissions fetched');
    } catch (err) { next(err); }
  }

  // TEACHER: grade a student's text, image, or PDF submission with Gemini
  async aiGradeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      let teacherId = String((req.user as any)?.id);
      const teacherByUserId = await TeachersService.getTeacherIdByUserId(teacherId);
      if (teacherByUserId) teacherId = teacherByUserId;

      const studentId = String(req.body.studentId || '');
      if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });
      const input = await HomeworkService.getAiGradeInput(teacherId, String(req.params.id), studentId);
      const result = await gradeHomeworkSubmission(input);
      sendSuccess(res, result, 'AI mark submitted');
    } catch (err) { next(err); }
  }
}

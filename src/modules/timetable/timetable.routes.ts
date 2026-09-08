import { Router } from 'express';
import { TimetableController } from './timetable.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new TimetableController();

const VIEWERS = ['SCHOOL_ADMIN', 'TEACHER', 'EXAM_CONTROLLER'] as const;

router.use(authenticate);



// ── STUDENT: own routine only, classId never passed by the client ───
router.get('/my-routine',               authorizeRoles('STUDENT'), c.getMyRoutine.bind(c));
router.get('/my-routine/today',         authorizeRoles('STUDENT'), c.getMyTodayRoutine.bind(c));

// ── PARENT: routine for a specific child, ownership checked server-side ─
router.get('/parent/child/:studentId',        authorizeRoles('PARENT'), c.getChildRoutine.bind(c));
router.get('/parent/child/:studentId/today',  authorizeRoles('PARENT'), c.getChildTodayRoutine.bind(c));

// ── ADMIN / TEACHER / EXAM_CONTROLLER: staff-facing browse & filter ────────────────────
router.get('/',                         authorizeRoles(...VIEWERS), c.findAll.bind(c));
router.get('/class/:classId',           authorizeRoles(...VIEWERS), c.getClassWeeklyView.bind(c));
router.get('/teacher/:teacherId',       authorizeRoles(...VIEWERS), c.getTeacherWeeklyView.bind(c));
router.get('/:id',                      authorizeRoles(...VIEWERS), c.findById.bind(c));

// ── Write: EXAM_CONTROLLER only 
router.post('/',                        authorizeRoles('EXAM_CONTROLLER'), c.createSlot.bind(c));
router.post('/bulk',                    authorizeRoles('EXAM_CONTROLLER'), c.bulkCreate.bind(c));
router.patch('/:id',                    authorizeRoles('EXAM_CONTROLLER'), c.update.bind(c));
router.delete('/class/:classId',        authorizeRoles('EXAM_CONTROLLER'), c.deleteClassSchedule.bind(c));
router.delete('/:id',                   authorizeRoles('EXAM_CONTROLLER'), c.delete.bind(c));

export default router;
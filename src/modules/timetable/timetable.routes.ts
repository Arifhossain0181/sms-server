import { Router } from 'express';
import { TimetableController } from './timetable.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new TimetableController();

router.use(authenticate);

// ── Read: students & teachers can view ────────────────────────────
router.get('/',                         authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), c.findAll.bind(c));
router.get('/class/:classId',           authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), c.getClassWeeklyView.bind(c));
router.get('/teacher/:teacherId',       authorizeRoles('ADMIN', 'TEACHER'),             c.getTeacherWeeklyView.bind(c));
router.get('/:id',                      authorizeRoles('ADMIN', 'TEACHER', 'STUDENT'), c.findById.bind(c));

// ── Write: Admin only ─────────────────────────────────────────────
router.post('/',                        authorizeRoles('ADMIN'), c.createSlot.bind(c));
router.post('/bulk',                    authorizeRoles('ADMIN'), c.bulkCreate.bind(c));
router.patch('/:id',                    authorizeRoles('ADMIN'), c.update.bind(c));
router.delete('/class/:classId',        authorizeRoles('ADMIN'), c.deleteClassSchedule.bind(c));
router.delete('/:id',                   authorizeRoles('ADMIN'), c.delete.bind(c));

export default router;
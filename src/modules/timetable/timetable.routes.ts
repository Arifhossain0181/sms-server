import { Router } from 'express';
import { TimetableController } from './timetable.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();
const c = new TimetableController();

router.use(authMiddleware);

// ── Read: students & teachers can view ────────────────────────────
router.get('/',                         roleMiddleware('ADMIN', 'TEACHER', 'STUDENT'), c.findAll.bind(c));
router.get('/class/:classId',           roleMiddleware('ADMIN', 'TEACHER', 'STUDENT'), c.getClassWeeklyView.bind(c));
router.get('/teacher/:teacherId',       roleMiddleware('ADMIN', 'TEACHER'),             c.getTeacherWeeklyView.bind(c));
router.get('/:id',                      roleMiddleware('ADMIN', 'TEACHER', 'STUDENT'), c.findById.bind(c));

// ── Write: Admin only ─────────────────────────────────────────────
router.post('/',                        roleMiddleware('ADMIN'), c.createSlot.bind(c));
router.post('/bulk',                    roleMiddleware('ADMIN'), c.bulkCreate.bind(c));
router.patch('/:id',                    roleMiddleware('ADMIN'), c.update.bind(c));
router.delete('/class/:classId',        roleMiddleware('ADMIN'), c.deleteClassSchedule.bind(c));
router.delete('/:id',                   roleMiddleware('ADMIN'), c.delete.bind(c));

export default router;
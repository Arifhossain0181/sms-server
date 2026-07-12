import { Router } from 'express';
import { TimetableController } from './timetable.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new TimetableController();

router.use(authenticate);

/**
 * =====================================================================
 * WHAT CHANGED FROM THE OLD ROUTES FILE
 * =====================================================================
 * - STUDENT removed from '/' and '/class/:classId' — those let a
 *   student pass ANY classId/teacherId and see someone else's data.
 *   Students now only ever hit /my-routine and /my-routine/today,
 *   where the classId is resolved server-side from their own profile.
 * - PARENT added, with its own /parent/child/:studentId routes —
 *   ownership (this child belongs to this parent) is checked in the
 *   service before any data is returned.
 * - '/:id' (single slot lookup) is now ADMIN/TEACHER only — a raw
 *   slot-by-id lookup isn't something a student/parent needs; they
 *   use the weekly/today routes instead.
 * =====================================================================
 */

// ── STUDENT: own routine only, classId never passed by the client ───
router.get('/my-routine',               authorizeRoles('STUDENT'), c.getMyRoutine.bind(c));
router.get('/my-routine/today',         authorizeRoles('STUDENT'), c.getMyTodayRoutine.bind(c));

// ── PARENT: routine for a specific child, ownership checked server-side ─
router.get('/parent/child/:studentId',        authorizeRoles('PARENT'), c.getChildRoutine.bind(c));
router.get('/parent/child/:studentId/today',  authorizeRoles('PARENT'), c.getChildTodayRoutine.bind(c));

// ── ADMIN / TEACHER: staff-facing browse & filter ────────────────────
router.get('/',                         authorizeRoles('SCHOOL_ADMIN', 'TEACHER'), c.findAll.bind(c));
router.get('/class/:classId',           authorizeRoles('SCHOOL_ADMIN', 'TEACHER'), c.getClassWeeklyView.bind(c));
router.get('/teacher/:teacherId',       authorizeRoles('SCHOOL_ADMIN', 'TEACHER'), c.getTeacherWeeklyView.bind(c));
router.get('/:id',                      authorizeRoles('SCHOOL_ADMIN', 'TEACHER'), c.findById.bind(c));

// ── Write: Admin only ─────────────────────────────────────────────
router.post('/',                        authorizeRoles('SCHOOL_ADMIN'), c.createSlot.bind(c));
router.post('/bulk',                    authorizeRoles('SCHOOL_ADMIN'), c.bulkCreate.bind(c));
router.patch('/:id',                    authorizeRoles('SCHOOL_ADMIN'), c.update.bind(c));
router.delete('/class/:classId',        authorizeRoles('SCHOOL_ADMIN'), c.deleteClassSchedule.bind(c));
router.delete('/:id',                   authorizeRoles('SCHOOL_ADMIN'), c.delete.bind(c));

export default router;
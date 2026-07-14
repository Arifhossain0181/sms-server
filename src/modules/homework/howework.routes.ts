import { Router } from 'express';
import { HomeworkController } from './homework.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const c = new HomeworkController();

router.use(authenticate);

// ── STUDENT: own homework only, sectionId resolved server-side
router.get('/my-homework',              authorizeRoles('STUDENT'), c.getMyHomework.bind(c));
router.patch('/:id/viewed',             authorizeRoles('STUDENT'), c.markViewed.bind(c));

// ── PARENT: a specific child's homework, ownership checked in service ─
router.get('/child/:studentId',         authorizeRoles('PARENT'), c.getChildHomework.bind(c));

// ── TEACHER: own homework CRUD + dashboard widget 
router.get('/my',                       authorizeRoles('TEACHER'), c.listMine.bind(c));
router.get('/my/overdue',               authorizeRoles('TEACHER'), c.listOverdue.bind(c));
router.post('/',                        authorizeRoles('TEACHER'), c.create.bind(c));
router.patch('/:id',                    authorizeRoles('TEACHER'), c.update.bind(c));
router.patch('/:id/review',             authorizeRoles('TEACHER'), c.markReviewed.bind(c));
router.delete('/:id',                   authorizeRoles('TEACHER'), c.delete.bind(c));

// ── ADMIN / TEACHER: single item with view stats 
router.get('/:id',                      authorizeRoles('SCHOOL_ADMIN', 'TEACHER'), c.getById.bind(c));

export default router;
import { Router } from 'express'
import { RagController } from './rag.controller'



const router = Router() 
router.get('/stats', RagController.getStats)

export default router

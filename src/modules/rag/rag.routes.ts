import { Router } from 'express'



const router = Router() 
router.get('/', (req, res) => {
  res.send('RAG route is working!')
})

export const ragRouter = router

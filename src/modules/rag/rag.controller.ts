import { Request, Response } from 'express';
const getStats = async (req: Request, res: Response) => {
  try {
    
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }}


  export { getStats };
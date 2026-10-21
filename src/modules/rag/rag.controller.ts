import { Request, Response } from 'express';
import { RagService } from './rag.service';

const ragService = new RagService();
const getStats = async (req: Request, res: Response) => {
  console.log("connected to getStats", req.query);
  res.status(200).json({ messageinfo: 'Stats retrieved successfully' });
  }
  const ingestStudents = async (req: Request, res: Response) => {
    const result = await ragService.ingestStudentData();
    res.status(200).json(result);
  }


  export const RagController = {
    getStats,
    ingestStudents
  };
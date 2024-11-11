import express, { Request, Response } from 'express';
import { createObject, getObject, deleteObject, createObjectsBatch } from '../services/objectService';
import { STATUS_CODES } from '../config/config';

const router = express.Router();

router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const data = await getObject(key);
    res.json({ key, data });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ error: (error as any).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { key, data, ttl } = req.body;
    const response = await createObject(key, data, ttl);
    if (response === 'Key already exists in the database') {
      return res.status(STATUS_CODES.CONFLICT).json({ error: 'Key already exists in the database' });
    }
    res.status(STATUS_CODES.CREATED).json({ message : 'Object created', response });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ error: (error as any).message });
  }
});

router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const result = await deleteObject(key);
    if (result === 'Key not found in database') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ error: 'Key not found in database' });
    }
    res.status(STATUS_CODES.OK).json({ message: 'Object deleted' });
  } catch (error) {
    res.status(STATUS_CODES.NOT_FOUND).json({ error: (error as any).message });
}
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const objects = req.body;
    const response = await createObjectsBatch(objects);
    res.status(STATUS_CODES.CREATED).json({ response });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ error: (error as any).message });
  }
});

export default router;

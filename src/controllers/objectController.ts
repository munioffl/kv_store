import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createObject, getObject, deleteObject, createObjectsBatch } from '../services/objectService';

const router = express.Router();

router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const data = await getObject(key);
    res.json({ key, data });
  } catch (error) {
    res.status(404).json({ error: (error as any).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { key, data, ttl } = req.body;
    const tenantId = uuidv4();
    const response = await createObject(key, data, ttl);
    if (response === 'Key already exists in the database') {
      return res.status(409).json({ error: 'Key already exists in the database' });
    }
    res.status(201).json({ message : 'Object created', response });
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
});

router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const result = await deleteObject(key);
    if (result === 'Key not found in database') {
      return res.status(404).json({ error: 'Key not found in database' });
    }
    res.status(200).json({ message: 'Object deleted' });
  } catch (error) {
    res.status(404).json({ error: (error as any).message });
}
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const objects = req.body;
    const response = await createObjectsBatch(objects);
    res.status(201).json({ response });
  } catch (error) {
    res.status(400).json({ error: (error as any).message });
  }
});

export default router;

import express from 'express';
import bodyParser from 'body-parser';
import objectRoutes from './controllers/objectController';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { cleanupExpiredEntries } from './utils/cleanupExpired';
import cron from 'node-cron';
import { logger } from './utils/logger';

const app = express();

app.use(bodyParser.json());
app.use(rateLimiter);
app.use('/api/object', objectRoutes);
app.use(errorHandler);

// Run cleanup every 30 minute
cron.schedule('*/30 * * * *', async () => {
  await cleanupExpiredEntries();
  logger.info('Expired entries cleanup completed.');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app };
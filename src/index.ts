import express from 'express';
import bodyParser from 'body-parser';
import { cleanupExpiredEntries } from './utils/cleanupExpired';
import cron from 'node-cron';
import { logger } from './utils/logger';
import { sequelize } from './config/database';
import { KVModel } from './models/kvModel';
import objectRoutes from './routes/objectRoutes';

const app = express();

app.use(bodyParser.json());
app.use('/api', objectRoutes);

// Run cleanup every 30 minute
cron.schedule('*/30 * * * *', async () => {
  await cleanupExpiredEntries();
  logger.info('Expired entries cleanup completed.');
});
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }) // Ensure this runs only once at startup
  .then(() => {
    app.listen(PORT, async () => {
      await KVModel.sync({ alter: true }); // Synchronize the model
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to sync database:', err);
  });
export { app };
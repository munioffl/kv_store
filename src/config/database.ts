import { Sequelize } from 'sequelize';
import { config } from './config';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
  host: config.db.host,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    charset: 'utf8mb4', // For emoji support
  },
});

sequelize.authenticate()
  .then(() => logger.info('Database connected'))
  .catch((err) => logger.error('Database connection failed:', err));
import { KVModel } from '../models/kvModel';
import { Op } from 'sequelize';

export async function cleanupExpiredEntries() {
  const now = Math.floor(Date.now() / 1000);
  await KVModel.destroy({ where: { ttl: { [Op.lt]: now } } });
}

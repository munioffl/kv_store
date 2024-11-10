import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class KVModel extends Model {
  public key!: string;
  public data!: object;
  public ttl?: number;
  public tenantId!: string;
  public readonly createdAt!: Date;
}

KVModel.init({
  key: {
    type: DataTypes.STRING(32),
    primaryKey: true,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  ttl: {
    type: DataTypes.INTEGER,
  },
  tenantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'KVModel',
  tableName: 'kv_store',
  timestamps: false,
});
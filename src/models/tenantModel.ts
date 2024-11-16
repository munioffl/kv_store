import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class TenantModel extends Model {
  public tenantId!: string;
  public name!: string;
  public apiKey!: string;
  public tenantLimit!: number;
  public rateLimit!: number;
  public readonly createdAt!: Date;
  id: string | undefined;
}

TenantModel.init({
  tenantId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tenantLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rateLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100, // Default rate limit
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Tenant',
  tableName: 'tenants',
  timestamps: false,
});
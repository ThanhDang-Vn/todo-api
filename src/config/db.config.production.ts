import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import * as path from 'path';

export default (): PostgresConnectionOptions => ({
  url: process.env.POSTGRES_URL,
  type: 'postgres',
  port: process.env.PORT ? +process.env.PORT : 4000,
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
  synchronize: false,
});

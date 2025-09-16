import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import * as path from 'path';

export default (): PostgresConnectionOptions => ({
  url: 'postgresql://neondb_owner:npg_rO7tJkS0RIxg@ep-curly-bonus-a1vx2urs-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  type: 'postgres',
  port: 3306,
  entities: [path.resolve(__dirname, '..') + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});

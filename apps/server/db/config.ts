import { DataSource, DataSourceOptions } from 'typeorm';

// this config is used by both Nest.js and TypeORM CLI

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `./.env.${env}` });

export const dataSourceOptions: DataSourceOptions = {
  // typeorm configuration
  type: (process.env.TYPE as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'postgres',
  synchronize: false,
  logging: true,
  entities: [
    './dist/src/**/*.entity{.ts,.js}',
    './dist/src/**/entities/*.entity{.ts,.js}',
  ],
  migrations: ['./dist/db/migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

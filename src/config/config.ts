import dotenv from 'dotenv';
dotenv.config();

//const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
//const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL = process.env.MONGO_URL || '';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3000;

export const config = {
	mongo: {
		url: MONGO_URL
	},
	redis: {
		url: REDIS_URL
	},
	server: {
		port: SERVER_PORT
	}
};

require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logger from './libs/Logger';
import responseTime from 'response-time';

/* routes */
import subscriberRoutes from './routes/subscribers';
import itemRoutes from './routes/items';
import apiUserRoutes from './routes/api_user';
/* middlewares  for authentication */
import { Authenticate, RestricedPermissions } from './middleware/authenticate';
import { NeedDB } from './middleware/need_db';

import { version } from '../package.json';

const app = express();

//MoongoDB connection

const connectWithRetry = () => {
	Logger.info('Attempting to connect to MongoDB. at ' + config.mongo.url);
	return mongoose
		.connect(config.mongo.url, { w: 'majority', retryWrites: true })
		.then(() => {
			Logger.success('Connected to MongoDB successfully');
		})
		.catch((error) => {
			Logger.error('Failed to connect to MongoDB - retrying in 5 sec (' + error + ')');
			setTimeout(connectWithRetry, 5000);
		});
};

connectWithRetry();

const StartServer = () => {
	app.use(responseTime()); //add response time header
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	/* log requests in console */
	app.use((req: Request, res: Response, next: NextFunction) => {
		let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		//remove passwords from logs
		let logsBody = Object.assign({}, req.body);
		if (typeof logsBody.password != undefined) {
			delete logsBody.password;
		}
		Logger.info(`[${ip}] In -> [${req.method}] ${req.url}` + ' ' + JSON.stringify(logsBody));
		next();
	});
	/** API DEFAULT HEADER AND ACCESS CONTROL HEADERS */
	app.use((req: Request, res: Response, next: NextFunction) => {
		res.header('X-Powered-By', 'Rest API version: ' + version);
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		if (req.method == 'OPTIONS') {
			res.header('Access-Control-Allow-Metods', 'PUT, POST, PATCH, DELETE, GET');
			return res.status(200).json({});
		}
		next();
	});

	/** API MAIN ROUTES */
	app.use('/subscribers', subscriberRoutes);
	app.use('/items', itemRoutes);
	app.use('/api_user', apiUserRoutes);

	/** HEALTH CHECK */
	app.get('/ping', (req: Request, res: Response) => {
		return res.status(200).json({ message: 'pong ' + `[Local time: ${new Date().toLocaleString()}]` });
	});

	/** Just for testing purpose - authenticate only for group admin */
	app.get('/test_permissions', NeedDB, Authenticate, RestricedPermissions(['admin']), (req: Request, res: Response) => {
		return res.status(200).json({ message: 'OK you are admin logged in', user: req.user });
	});

	/** 404 STATUS HANDLING */
	app.use((req: Request, res: Response, next: NextFunction) => {
		const error = new Error('404 not found');
		Logger.error(error);
		return res.status(404).json({ error: error.message });
	});

	app.listen(config.server.port, () => Logger.info(`API server started on port ${config.server.port}`));
};

StartServer();

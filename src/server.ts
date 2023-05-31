require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logger from './libs/Logger';
import responseTime from 'response-time';
import jwt, { Secret } from 'jsonwebtoken';

/* routes */
import subscriberRoutes from './routes/subscribers';
import itemRoutes from './routes/items';

// import authenticate from './middleware/authenticate';

import { version } from '../package.json';

const app = express();

//MoongoDB connection
Logger.info('Attempting to connect to MongoDB. at ' + config.mongo.url);
mongoose
	.connect(config.mongo.url, { w: 'majority', retryWrites: true })
	.then(() => {
		Logger.info('Connected to MongoDB successfully');
	})
	.catch((error) => {
		Logger.error(error);
	});

const StartServer = () => {
	app.use(responseTime()); //add response time header
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	app.use((req, res, next) => {
		let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		Logger.info(`[${ip}] Incomming -> Method: [${req.method}] - URL: [${req.url}]`);
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

	/** HEALTH CHECK */
	app.get('/ping', (req: Request, res: Response) => res.status(200).json({ message: 'pong ' + `[Local time: ${new Date().toLocaleString()}]` }));

	// /** authorization */
	// app.post('/login', (req: Request, res: Response) => {
	// 	const username = req.body.username;
	// 	const created = new Date().toLocaleString();
	// 	const user = { username, created };
	// 	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as Secret);
	// 	res.status(200).json({ user: user, accessToken: accessToken });
	// });
	// /** authorization */
	// app.post('/generatelicense', async (req: Request, res: Response) => {
	// 	const owner = req.body.owner || 'Company';
	// 	const expires = req.body.expires || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toJSON().slice(0, 10);
	// 	const features = req.body.features || ['_ALL_'];
	// 	const type = req.body.customer || 'customer';

	// 	const licensePayload = {
	// 		owner: owner,
	// 		expires: expires,
	// 		created: new Date().toJSON().slice(0, 19).replace('T', ' '),
	// 		features: features,
	// 		type: type
	// 	};
	// 	const accessToken = jwt.sign(licensePayload, process.env.ACCESS_TOKEN_SECRET as Secret);

	// 	const license = new LicenseModel({
	// 		_id: new mongoose.Types.ObjectId(),
	// 		token: accessToken,
	// 		...licensePayload
	// 	});
	// 	return await license
	// 		.save()
	// 		.then((license) => res.status(201).json(license))
	// 		.catch((error) => res.status(500).json({ error }));
	// 	//res.status(200).json({ licensePayload, accessToken: accessToken });
	// });

	/** 404 STATUS HANDLING */
	app.use((req, res, next) => {
		const error = new Error('not found');
		Logger.error(error);
		return res.status(404).json({ message: error.message });
	});

	app.listen(config.server.port, () => Logger.info(`API server started on port ${config.server.port}`));
};

StartServer();

import express, { type Application, type Response } from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import ServerSocket from './socket';
import CompanyModel from './models/company.model';
import UserModel from './models/user.model';

const PORT = process.env.PORT || 3001;
const MONGO_URL = '';
const app: Application = express();

app.use(
	cors({
		origin: '*',
	}),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(MONGO_URL);

const httpServer = http.createServer(app);

const socket = new ServerSocket();
socket.CreateServer(httpServer);

app.get('/', async (_, res: Response): Promise<Response> => {
	const company = new CompanyModel({
		name: 'Banana Company',
		users: [],
	});
	company.save();

	const { _id: companyId } = company;

	const user = new UserModel({
		name: 'banana',
		email: 'banana@banana.com',
		status: 'online',
		company: companyId,
	});

	user.save();
	const { _id: userId } = user;

	company.users.push(userId);

	return res.status(200).send({
		message: 'Hello World!',
	});
});

httpServer.listen({ port: PORT });

export default app;

import express, { type Application, type Response } from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';
import ServerSocket from './socket';

const PORT = process.env.PORT || 3001;
const app: Application = express();

app.use(
	cors({
		origin: '*',
	}),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const httpServer = http.createServer(app);

const socket = new ServerSocket();
socket.CreateServer(httpServer);

app.get('/', async (_, res: Response): Promise<Response> => {
	return res.status(200).send({
		message: 'Hello World!',
	});
});

httpServer.listen({ port: PORT });

export default app;

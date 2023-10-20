import express, {
	type Application,
	type Request,
	type Response,
} from 'express';
import bodyParser from 'body-parser';
import http from 'http';
// eslint-disable-next-line
import cors from 'cors';
import ServerSocket from './socket';

const PORT = process.env.PORT || 3001;
const app: Application = express();
app.use(
	cors({
		origin: '*',
	}),
);

const httpServer = http.createServer(app);

// eslint-disable-next-line
new ServerSocket(httpServer);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get(
	'/',
	async (req: Request, res: Response): Promise<Response> =>
		res.status(200).send({
			message: 'Hello World!',
		}),
);

app.post(
	'/post',
	async (req: Request, res: Response): Promise<Response> =>
		res.status(200).send({
			message: 'Hello World from post!',
		}),
);

httpServer.listen({ port: PORT }, (): void => {
	// eslint-disable-next-line no-console
	console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

export default app;

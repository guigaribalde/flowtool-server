import { Server as HTTPServer } from 'http';
import { Socket, Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import registerCursorHandler from './handlers/cursor.handler';
import registerUserHandler from './handlers/user.handler';
import Sessions from './sessionizer';
import registerBoardHandler from './handlers/board.handler';
import auth from './auth';

export default class ServerSocket {
	public io: Server;

	public sessions: Sessions;

	constructor() {
		this.io = {} as Server;
		this.sessions = new Sessions();
	}

	CreateServer = (server: HTTPServer): void => {
		this.io = new Server(server, {
			cors: {
				origin: '*',
			},
			serveClient: false,
			pingInterval: 10000,
			pingTimeout: 5000,
			cookie: false,
		});

		this.io.use((socket, next) => {
			const user = auth(socket);

			if (user) {
				next();
			} else next(new Error('invalid'));
		});

		this.io.on('connect', this.StartListeners);
		this.io.of('/cursor').on('connect', this.StartCursorListeners);
		console.info('Socket server initialized');
	};

	StartListeners = (socket: Socket): void => {
		registerUserHandler({ io: this.io, socket, sessions: this.sessions });
		registerBoardHandler({ io: this.io, socket, sessions: this.sessions });

		socket.on('disconnect', () => {
			const spaceId = this.sessions.GetUserSpaceIdBySocketId(socket.id);
			this.sessions.RemoveUserBySocketId(socket.id);
			const users = this.sessions.GetUsers(spaceId);

			this.io.to(spaceId).emit('update:users', users);
		});
	};

	StartCursorListeners = (socket: Socket): void => {
		registerCursorHandler({ io: this.io, socket });
	};
}

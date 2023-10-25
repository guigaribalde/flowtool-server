import { Server as HTTPServer } from 'http';
import { Socket, Server } from 'socket.io';
import registerCursorHandler from './handlers/cursor.handler';

export default class ServerSocket {
	public io: Server;

	constructor() {
		this.io = {} as Server;
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
		// this.io.on('connect', this.StartListeners);
		this.io.of('/cursor').on('connect', this.StartCursorListeners);
		console.info('Socket server initialized');
	};

	// StartListeners = (socket: Socket): void => {};

	StartCursorListeners = (socket: Socket): void => {
		registerCursorHandler({ io: this.io, socket });
	};
}

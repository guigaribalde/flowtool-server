import { Server as HTTPServer } from 'http';
import { Socket, Server } from 'socket.io';

export default class ServerSocket {
	public static instance: ServerSocket;

	public io: Server;

	constructor(server: HTTPServer) {
		ServerSocket.instance = this;
		this.io = new Server(server, {
			cors: {
				origin: '*',
			},
			serveClient: false,
			pingInterval: 10000,
			pingTimeout: 5000,
			cookie: false,
		});

		this.io.on('connect', this.StartListeners);

		console.info('Socket server initialized');
	}

	StartListeners = (socket: Socket): void => {
		socket.on('message', (data) => {
			console.log(data);
			this.io.emit('message', data);
		});
	};
}

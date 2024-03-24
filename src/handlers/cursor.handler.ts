import { Socket, Server } from 'socket.io';
import Sessions from '../sessionizer';

interface HandlerProps {
	io: Server;
	socket: Socket;
	sessions: Sessions;
}

export default function cursorHandler({ socket, sessions }: HandlerProps) {
	socket.on('cursor:update-position', (data) => {
		console.log(data);
		socket.broadcast.emit('cursor:update-position', {
			...data,
		});
	});
}

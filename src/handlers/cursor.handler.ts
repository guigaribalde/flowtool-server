import { Socket, Server } from 'socket.io';

interface HandlerProps {
	io: Server;
	socket: Socket;
}

export default function cursorHandler({ socket }: HandlerProps) {
	socket.on('cursor:update-position', (data) => {
		// data must include business id and user name
		socket.broadcast.emit('cursor:update-position', {
			...data,
			uid: socket.id,
		});
	});
}

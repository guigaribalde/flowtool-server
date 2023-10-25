import { Socket, Server } from 'socket.io';

interface HandlerProps {
	io: Server;
	socket: Socket;
}

export default function cursorHandler({ socket }: HandlerProps) {
	socket.on('cursor:update-position', (data) => {
		socket.broadcast.emit('cursor:update-position', {
			...data,
			uid: socket.id,
		});
	});
}

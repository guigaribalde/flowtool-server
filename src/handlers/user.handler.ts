import { Socket, Server } from 'socket.io';
// import Company from '../models/company.model';

interface HandlerProps {
	io: Server;
	socket: Socket;
}

// type Callback = (uid: string, users: string[]) => void;

export default function userHandler({ socket }: HandlerProps) {
	socket.on('user:handshake', async () => {
		// if user in business connected users execute reconnect callback
		// const user = await Company.findOne({
		// 	'users.uid': socket.id,
		// });
	});
}

import { Socket, Server } from 'socket.io';
import { getUser } from '../controllers/user.controller';
// import Company from '../models/company.model';

interface HandlerProps {
	io: Server;
	socket: Socket;
}

interface HandshakeData {
	uid: string;
}

// type Callback = (uid: string, users: string[]) => void;

export default function userHandler({ socket }: HandlerProps) {
	socket.on('user:handshake', async ({ uid }: HandshakeData) => {
		// if user in business connected users execute reconnect callback
		// const user = await Company.findOne({
		// 	'users.uid': socket.id,
		// });
		console.info('user:handshake');
		const user = await getUser(uid);
		console.log(user);
	});
}

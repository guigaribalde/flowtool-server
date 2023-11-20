import { Socket, Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import prisma from '../../prisma/prisma';
import Sessions from '../sessionizer';
import auth from '../auth';

interface HandlerProps {
	io: Server;
	socket: Socket;
	sessions: Sessions;
}

interface HandshakeData {
	uid: string;
}

type Callback = (uid: string, users: User[]) => void;

type HandshakeProps = {
	spaceId: string;
	userId: string;
};

export default function userHandler({ socket, sessions }: HandlerProps) {
	socket.on(
		'user:handshake',
		async ({ spaceId, userId }: HandshakeProps, callback: Callback) => {
			console.log(spaceId, userId);
			const verify = auth(socket);

			if (!verify) return;

			if (typeof verify.sub === 'string') {
				const user = await prisma.user.update({
					where: {
						clerkId: verify.sub as string,
					},
					data: {
						socketId: socket.id,
						status: 'online',
					},
				});

				if (user) {
					sessions.AddUser(spaceId, user);
					const users = sessions.GetUsers(spaceId) || [];

					socket.join(spaceId);

					callback(user.id, users);
					socket.broadcast.to(spaceId).emit('update:users', users);
				}
			}
		},
	);
}

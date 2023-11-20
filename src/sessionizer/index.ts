import { User } from '@prisma/client';

type SpaceId = string;
type Users = User[];

export default class Sessions {
	public sessions: Map<SpaceId, Users>;

	constructor() {
		this.sessions = new Map();
	}

	public AddUser = (space: SpaceId, user: User): void => {
		const users = this.sessions.get(space);
		if (users) {
			if (users.find((u) => u.id === user.id)) return;
			this.sessions.set(space, [...users, user]);
		} else {
			this.sessions.set(space, [user]);
		}
	};

	public RemoveUser = (space: SpaceId, userId: string): void => {
		const users = this.sessions.get(space);
		if (users) {
			this.sessions.set(
				space,
				users.filter((u) => u.id !== userId),
			);
		}
	};

	public GetUsers = (space: SpaceId): Users | undefined => {
		return this.sessions.get(space);
	};

	public GetSpaces = (): SpaceId[] => {
		return Array.from(this.sessions.keys());
	};

	public RemoveUserBySocketId = (socketId: string): void => {
		this.sessions.forEach((users, space) => {
			this.sessions.set(
				space,
				users.filter((u) => u.socketId !== socketId),
			);
		});
	};

	public GetUserSpaceIdBySocketId = (socketId: string): SpaceId => {
		let space = '';
		this.sessions.forEach((users, s) => {
			if (users.find((u) => u.socketId === socketId)) space = s;
		});
		return space;
	};
}

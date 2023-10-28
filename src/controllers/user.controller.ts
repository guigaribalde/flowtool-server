import Users from '../models/user.model';

const getUser = (uid: string) => {
	try {
		return Users.findOne({ _id: uid });
	} catch (err) {
		console.log(err);
		return undefined;
	}
};

const updateUserSocketId = (uid: string, socketId: string) => {
	try {
		return Users.findOneAndUpdate({ _id: uid }, { socketId }, { new: true });
	} catch (err) {
		console.log(err);
		return undefined;
	}
};

export { getUser, updateUserSocketId };

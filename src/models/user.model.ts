import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ['online', 'offline'],
		default: 'offline',
	},
	company: {
		type: Schema.Types.ObjectId,
		ref: 'Company',
		required: true,
	},
	socketId: {
		type: String,
	},
});

export default mongoose.model('User', UserSchema);

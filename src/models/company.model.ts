import mongoose from 'mongoose';

const { Schema } = mongoose;

const CompanySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	users: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

export default mongoose.model('Company', CompanySchema);

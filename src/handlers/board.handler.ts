import { Socket, Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { throws } from 'assert';
import { ObjectId } from 'bson';
import prisma from '../../prisma/prisma';
import Sessions from '../sessionizer';
import auth from '../auth';

interface HandlerProps {
	io: Server;
	socket: Socket;
	sessions: Sessions;
}

type TBoard =
	| ({
			columns: TColumn[];
	  } & {
			id: string;
			name: string;
			spaceId: string | null;
	  })
	| undefined;

type TColumn = {
	id: string;
	name: string;
	index: number;
	boardId: string | null;
	tasks: {
		id: string;
		name: string;
		index: number;
		columnId: string | null;
	}[];
};

export type CreateColumnPayload = {
	id: string;
	name: string;
	index: number;
	tasks: any[];
	spaceId: string;
};

export type CreateTaskPayload = {
	id: string;
	name: string;
	index: number;
	columnId: string;
	spaceId: string;
};

export default function boardHandler({ socket, sessions }: HandlerProps) {
	socket.on(
		'create:column',
		async ({ id, name, index, tasks, spaceId }: CreateColumnPayload) => {
			const verify = auth(socket);
			if (!verify) return;

			try {
				const result = await prisma.$transaction(async (db) => {
					const workspace = await prisma.workSpace.findFirst({
						where: {
							Space: {
								some: {
									id: spaceId,
								},
							},
						},
						include: {
							Space: {
								where: {
									id: spaceId,
								},
								include: {
									boards: true,
								},
							},
							UserOnWorkSpace: {
								where: {
									user: {
										clerkId: verify.sub as string,
									},
								},
								include: {
									user: true,
								},
							},
						},
					});

					if (
						!workspace?.UserOnWorkSpace?.length ||
						!workspace?.Space?.length
					) {
						throw new Error('User not found');
					}

					const boardId = workspace.Space[0]?.boards?.length
						? workspace.Space[0].boards[0].id
						: undefined;

					const randomId = new ObjectId().toString();
					const column = await prisma.column.create({
						data: {
							name,
							index,
							id,
							tasks: {},
							Board: {
								connectOrCreate: {
									where: {
										id: boardId || randomId,
									},
									create: {
										name: 'AUTOGENERATED_BOARD',
										Space: {
											connect: {
												id: spaceId,
											},
										},
									},
								},
							},
						},
					});

					if (!column) throw new Error('Unable to create column');

					return column;
				});

				socket.broadcast.to(spaceId).emit('create:column', result);
			} catch (e) {
				console.log(e);
			}
		},
	);

	socket.on(
		'create:task',
		async ({ id, name, index, columnId, spaceId }: CreateTaskPayload) => {
			const verify = auth(socket);
			if (!verify) return;

			try {
				const result = await prisma.$transaction(async (db) => {
					const workspace = await prisma.workSpace.findFirst({
						where: {
							Space: {
								some: {
									id: spaceId,
								},
							},
						},
						include: {
							Space: {
								where: {
									id: spaceId,
								},
								include: {
									boards: true,
								},
							},
							UserOnWorkSpace: {
								where: {
									user: {
										clerkId: verify.sub as string,
									},
								},
								include: {
									user: true,
								},
							},
						},
					});

					if (
						!workspace?.UserOnWorkSpace?.length ||
						!workspace?.Space?.length
					) {
						throw new Error('User not found');
					}

					const column = await prisma.column.findFirst({
						where: {
							id: columnId,
						},
					});

					if (!column) {
						throw new Error('Column not found');
					}

					const task = await prisma.task.create({
						data: {
							id,
							name,
							index,
							Column: {
								connect: {
									id: columnId,
								},
							},
						},
					});

					if (!task)
						throw new Error('Unable to create task, please try again later');

					return task;
				});
				socket.broadcast.to(spaceId).emit('create:task', result);
			} catch (e) {
				console.log(e);
			}
		},
	);

	type UpdateTaskOrderPayload = {
		source: {
			columnId: string;
			taskIndex: number;
		};
		destination: {
			columnId: string;
			taskIndex: number;
		};
		taskId: string;
		spaceId: string;
	};
	socket.on(
		'update:task-order',
		async ({
			spaceId,
			taskId,
			source: s,
			destination: d,
		}: UpdateTaskOrderPayload) => {
			const verify = auth(socket);
			if (!verify) return;

			const destination = d.taskIndex;
			const source = s.taskIndex;

			socket.broadcast.to(spaceId).emit('update:task-order', {
				spaceId,
				taskId,
				source: s,
				destination: d,
			});
			try {
				const result = await prisma.$transaction(async (db) => {
					const workspace = await prisma.workSpace.findFirst({
						where: {
							Space: {
								some: {
									id: spaceId,
								},
							},
						},
						include: {
							Space: {
								where: {
									id: spaceId,
								},
								include: {
									boards: true,
								},
							},
							UserOnWorkSpace: {
								where: {
									user: {
										clerkId: verify.sub as string,
									},
								},
								include: {
									user: true,
								},
							},
						},
					});

					if (
						!workspace?.UserOnWorkSpace?.length ||
						!workspace?.Space?.length
					) {
						throw new Error('User not found');
					}

					// Retrieve the task to be moved
					const taskToMove = await db.task.findUnique({
						where: { id: taskId },
					});

					if (!taskToMove) {
						throw new Error('Task not found');
					}

					// Check if the task is being moved within the same column
					if (taskToMove.index !== source) {
						throw new Error('Task is not in the specified source position');
					}
					// Update the indices of the tasks affected by the move
					if (source < destination) {
						// Moving the task downwards
						await db.task.updateMany({
							where: {
								columnId: taskToMove.columnId,
								index: {
									gt: source,
									lte: destination,
								},
							},
							data: {
								index: {
									decrement: 1,
								},
							},
						});
					} else {
						// Moving the task upwards
						await db.task.updateMany({
							where: {
								columnId: taskToMove.columnId,
								index: {
									lt: source,
									gte: destination,
								},
							},
							data: {
								index: {
									increment: 1,
								},
							},
						});
					}

					// Update the index of the moved task
					const data = await db.task.update({
						where: { id: taskId },
						data: { index: destination },
					});
					return data;
				});
			} catch (e) {
				console.log(e);
			}
		},
	);

	socket.on(
		'update:task-column',
		async ({
			spaceId,
			taskId,
			source: s,
			destination: d,
		}: UpdateTaskOrderPayload) => {
			const verify = auth(socket);
			if (!verify) return;

			const sourceColumnId = s.columnId;
			const destinationColumnId = d.columnId;
			const destinationIndex = d.taskIndex;

			socket.broadcast.to(spaceId).emit('update:task-column', {
				spaceId,
				taskId,
				source: s,
				destination: d,
			});
			try {
				const result = await prisma.$transaction(async (db) => {
					const workspace = await prisma.workSpace.findFirst({
						where: {
							Space: {
								some: {
									id: spaceId,
								},
							},
						},
						include: {
							Space: {
								where: {
									id: spaceId,
								},
								include: {
									boards: true,
								},
							},
							UserOnWorkSpace: {
								where: {
									user: {
										clerkId: verify.sub as string,
									},
								},
								include: {
									user: true,
								},
							},
						},
					});

					if (
						!workspace?.UserOnWorkSpace?.length ||
						!workspace?.Space?.length
					) {
						throw new Error('User not found');
					}

					// Retrieve the task to be moved
					const taskToMove = await db.task.findUnique({
						where: { id: taskId },
					});

					if (!taskToMove) {
						throw new Error('Task not found');
					}

					// Check if the task is in the source column
					if (taskToMove.columnId !== sourceColumnId) {
						throw new Error('Task is not in the specified source column');
					}

					// Decrement indices of tasks in the source column that are after the moved task
					await db.task.updateMany({
						where: {
							columnId: sourceColumnId,
							index: {
								gt: taskToMove.index,
							},
						},
						data: {
							index: {
								decrement: 1,
							},
						},
					});

					// Increment indices of tasks in the destination column that are on or after the destination index
					await db.task.updateMany({
						where: {
							columnId: destinationColumnId,
							index: {
								gte: destinationIndex,
							},
						},
						data: {
							index: {
								increment: 1,
							},
						},
					});

					// Update the task with the new column and index
					const task = await db.task.update({
						where: { id: taskId },
						data: {
							columnId: destinationColumnId,
							index: destinationIndex,
						},
					});

					return task;
				});
			} catch (e) {
				console.log(e);
			}
		},
	);

	socket.on('move:task', async (payload: any) => {
		const verify = auth(socket);
		if (!verify) return;

		socket.broadcast.to(payload.spaceId).emit('move:task', payload);
	});

	socket.on('move-end:task', async (payload: any) => {
		const verify = auth(socket);
		if (!verify) return;

		socket.broadcast.to(payload.spaceId).emit('move-end:task', payload);
	});
}

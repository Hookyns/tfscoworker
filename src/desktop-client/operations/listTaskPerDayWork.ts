import {IListTaskPerDayWorkMessage, ITaskPerDayWorkMessage} from "../messages/messageInterfaces";
import DesktopClient from "../desktopClient";
import TfsService from "../../tfsService";
import {MessageType} from "../messages/messageType";

export default async function listTaskPerDayWork(message: IListTaskPerDayWorkMessage, client: DesktopClient, tfsService: TfsService)
{
	try {
		let work = await tfsService.getTaskWorkPerDays(message.taskId);

		await client.send<ITaskPerDayWorkMessage>({
			type: MessageType.TaskPerDayWork,
			work: work
		});
	} catch (err) {
		await client.send<ITaskPerDayWorkMessage>({
			type: MessageType.TaskPerDayWork,
			work: undefined,
			error: err.message
		});
	}
}
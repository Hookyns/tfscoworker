import {IListTaskPerDayWorkMessage, ITaskPerDayWorkMessage} from "../messages/baseMessages";
import DesktopClient from "../desktopClient";
import TfsService from "../tfsService";
import {MessageType} from "../messages/messageType";

export default async function listTaskPerDayWork(message: IListTaskPerDayWorkMessage, client: DesktopClient, tfsService: TfsService)
{
	try {
		let work = await tfsService.getTaskWorkPerDays(message.TaskId);

		client.send<ITaskPerDayWorkMessage>({
			Type: MessageType.TaskPerDayWork,
			Work: work
		});
	} catch (err) {
		client.send<ITaskPerDayWorkMessage>({
			Type: MessageType.TaskPerDayWork,
			Work: undefined,
			Error: err.message
		});
	}
}
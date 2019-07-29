import {IApplyWorkSpanMessage, IWorkSpanApplyResultMessage} from "../messages/baseMessages";
import DesktopClient from "../desktopClient";
import TfsService from "../tfsService";
import {MessageType} from "../messages/messageType";

export default async function applyWorkSpan(message: IApplyWorkSpanMessage, client: DesktopClient, tfsService: TfsService) {
	try {
		let task = await tfsService.applyWorkSpan(message.taskId, message.workTime, client.workContext.memberInfo.displayName);

		await client.send<IWorkSpanApplyResultMessage>({
			type: MessageType.WorkSpanApplyResult,
			task: task
		});
	} catch (err) {
		await client.send<IWorkSpanApplyResultMessage>({
			type: MessageType.WorkSpanApplyResult,
			task: null,
			error: err.message
		});
	}
}
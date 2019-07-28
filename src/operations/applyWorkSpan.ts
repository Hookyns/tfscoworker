import {IApplyWorkSpanMessage, IWorkSpanApplyResultMessage} from "../messages/baseMessages";
import DesktopClient from "../desktopClient";
import TfsService from "../tfsService";
import {MessageType} from "../messages/messageType";

export default async function applyWorkSpan(message: IApplyWorkSpanMessage, client: DesktopClient, tfsService: TfsService) {
	try {
		let task = await tfsService.applyWorkSpan(message.TaskId, message.WorkTime, client.workContext.memberInfo.displayName);

		client.send<IWorkSpanApplyResultMessage>({
			Type: MessageType.WorkSpanApplyResult,
			Task: task
		});
	} catch (err) {
		client.send<IWorkSpanApplyResultMessage>({
			Type: MessageType.WorkSpanApplyResult,
			Task: null,
			Error: err.message
		});
	}
}
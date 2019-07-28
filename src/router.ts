import {IBaseMessage} from "./messages/baseMessages";
import {MessageType} from "./messages/messageType";
import TfsService from "./tfsService";
import DesktopClient from "./desktopClient";
import listMyTasks from "./operations/listMyTasks";
import listMyProjects from "./operations/listMyProjects";
import applyWorkSpan from "./operations/applyWorkSpan";
import listTaskPerDayWork from "./operations/listTaskPerDayWork";

export const RouteTable: {[key: number]: (message: IBaseMessage, client: DesktopClient, tfsService: TfsService) => void} = {
	[MessageType.ListMyProjects]: listMyProjects,
	[MessageType.ListMyTasks]: listMyTasks,
	[MessageType.ApplyWorkSpan]: applyWorkSpan,
	[MessageType.ListTaskPerDayWork]: listTaskPerDayWork,
};
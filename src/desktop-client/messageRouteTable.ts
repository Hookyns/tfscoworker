import {IBaseMessage} from "./messages/messageInterfaces";
import {MessageType} from "./messages/messageType";
import TfsService from "../tfs-api/tfsService";
import DesktopClient from "./desktopClient";
import listMyTasks from "./operations/listMyTasks";
import listMyProjects from "./operations/listMyProjects";
import applyWorkSpan from "./operations/applyWorkSpan";
import listTaskPerDayWork from "./operations/listTaskPerDayWork";
import listTaskStates from "./operations/listTaskStates";

export const MessageRouteTable: { [key: number]: (message: IBaseMessage, client: DesktopClient, tfsService: TfsService) => Promise<void> } = {
    [MessageType.ListMyProjects]: listMyProjects,
    [MessageType.ListMyTasks]: listMyTasks,
    [MessageType.ApplyWorkSpan]: applyWorkSpan,
    [MessageType.ListTaskPerDayWork]: listTaskPerDayWork,
    [MessageType.ListTaskStates]: listTaskStates
};
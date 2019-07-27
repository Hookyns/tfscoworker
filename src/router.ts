import {MessageType} from "./messages/messageType";
import listMyTasks from "./operations/listMyTasks";

export const RouteTable = {
	[MessageType.ListMyTasks]: listMyTasks
};
import DesktopClientServer from "../desktop-client/desktopClientServer";
import TfsService from "../tfs-api/tfsService";
import {EventType} from "./enums";
import {IBaseEvent} from "./interfaces";
import workItemCreated from "./operations/workItemCreated";

export const EventRouteTable: { [eventType: string]: (event: IBaseEvent, desktopClientServer: DesktopClientServer, tfsService: TfsService) => Promise<void> } = {
    [EventType.WorkItemCreated]: workItemCreated
};
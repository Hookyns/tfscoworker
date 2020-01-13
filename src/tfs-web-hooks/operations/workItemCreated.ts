import DesktopClientServer from "../../desktop-client/desktopClientServer";
import TfsService from "../../tfs-api/tfsService";
import {IBaseEvent} from "../interfaces";

export default async function workItemCreated(event: IBaseEvent, desktopClientServer: DesktopClientServer, tfsService: TfsService): Promise<void> {
    // let member = await tfsService.getMemberAssignedTo(event.resource.workItemId);
    // desktopClientServer.sendNoticeTo(member.id, event);
}
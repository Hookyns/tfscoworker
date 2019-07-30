import {IListTaskStates, ITaskStatesListMessage} from "../messages/messageInterfaces";
import DesktopClient from "../desktopClient";
import TfsService from "../../tfs-api/tfsService";
import {MessageType} from "../messages/messageType";

export default async function listTaskStates(message: IListTaskStates, client: DesktopClient, tfsService: TfsService)
{
    try {
        const wit = this._api.getQWorkItemTrackingApi();
        let res = await wit.exportWorkItemTypeDefinition(message.projectId, "Task");

        let states = [];
        res.template.replace(/<STATE value="(.*?)">/g, (_, state) => {
            states.push(state);
            return "";
        });

        await client.send<ITaskStatesListMessage>({
            type: MessageType.TaskStatesList,
            states: states
        });
    }
    catch (err) {
        await client.send<ITaskStatesListMessage>({
            type: MessageType.TaskPerDayWork,
            states: undefined,
            error: err.message
        });
    }
}
import TfsService from "../../tfsService";
import DesktopClient from "../desktopClient";
import {IListMyTasksMessage, ITaskListMessage} from "../messages/messageInterfaces";
import {WorkItemQueryResult, WorkItem} from "azure-devops-node-api-0.7.0/api/interfaces/WorkItemTrackingInterfaces";
import TaskInfo from "../../dtos/taskInfo";
import {MessageType} from "../messages/messageType";
import {createTaskInfo, toFloat, toInt} from "../../utility/dataHelper";

export default async function listMyTasks(message: IListMyTasksMessage, client: DesktopClient, tfsService: TfsService) {
	try {
		let api = tfsService.api.getQWorkItemTrackingApi();

		let queryMatch: WorkItemQueryResult = await api.queryByWiql({
			query: `
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.AssignedTo], [System.State], [System.Tags], [Microsoft.VSTS.Scheduling.EstimatedWork], [Microsoft.VSTS.Scheduling.CompletedWork], [System.IterationPath]
	FROM WorkItems
	WHERE 
		[System.TeamProject] = @project and [System.WorkItemType] = 'Task' and [System.AssignedTo] = '${client.workContext.memberInfo.displayName}'
		and (
			(
				([System.ChangedDate] >= @today - 2 and [System.ChangedDate] <= @today) 
				and [System.State] = 'Done'
			) 
			or ([System.State] = 'In Progress' and [System.IterationPath] = @currentIteration) 
			or ([System.State] = 'To Do' and [System.IterationPath] = @currentIteration)
		)
	ORDER BY [State], [Changed Date], [Completed Work] DESC
`
		}, {projectId: message.projectId, teamId: ""} as any);

		// Select IDs
		let tasksIds = queryMatch.workItems.map(item => item.id);

		// List tasks details
		let tasks: WorkItem[] = await api.getWorkItems(tasksIds, [
			"System.WorkItemType", "System.Title", "System.AssignedTo", "System.State", "System.Tags",
			"Microsoft.VSTS.Scheduling.EstimatedWork", "Microsoft.VSTS.Scheduling.CompletedWork",
			"Microsoft.VSTS.Scheduling.RemainingWork", "Microsoft.VSTS.Common.Activity"]);

		// Create result set
		let result: Array<TaskInfo> = tasks.map(t => createTaskInfo(t));

		await client.send<ITaskListMessage>({
			type: MessageType.TasksList,
			projectId: message.projectId,
			tasks: result
		});
	} catch (err) {
		await client.send<ITaskListMessage>({
			type: MessageType.TasksList, 
			projectId: message.projectId,
			tasks: null,
			error: err.message
		});
	}
}
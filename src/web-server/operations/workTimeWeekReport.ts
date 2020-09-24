import {WorkItem, WorkItemQueryResult}   from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import {IncomingMessage, ServerResponse} from "http";
import TfsService                        from "../../tfs-api/tfsService";

/**
 *
 * @param request
 * @param response
 * @param {{from: Date, to: Date}} query
 * @param tfsService
 */
export default async function workTimeWeekReport(request: IncomingMessage, response: ServerResponse, query, tfsService: TfsService) {
	try
	{
		let api = tfsService.api.getQWorkItemTrackingApi();
		
		let from = new Date(query.from);
		let to = new Date(query.to);

		let queryMatch: WorkItemQueryResult = await api.queryByWiql({
			query: `
SELECT [System.Id], [System.WorkItemType], [System.Title], [System.AssignedTo], [System.State], [System.Tags], [Microsoft.VSTS.Scheduling.EstimatedWork], [Microsoft.VSTS.Scheduling.CompletedWork], [System.IterationPath]
	FROM WorkItems
	WHERE 
		[System.TeamProject] = @project and [System.WorkItemType] = 'Task'
		and ([System.ChangedDate] >= '${from.toISOString().split("T")[0]}' and [System.CreatedDate] <= '${to.toISOString().split("T")[0]}') 
		and (
			[System.State] = 'Done' or [System.State] = 'In Progress'
		)
	ORDER BY [System.AssignedTo] ASC, [Changed Date] DESC
`
		}, {projectId: query.projectId, teamId: ""} as any);

		// Select IDs
		let tasksIds = queryMatch.workItems.map(item => item.id);

		// TODO: Maximální počet parametrů je 300 (možná za to může délka URL, těžko říct), každopádně zde udělat rozdělení a ideálně po 100 položkách
		
		// List tasks details
		let tasks: WorkItem[] = await api.getWorkItems(tasksIds, [
			"System.WorkItemType", "System.Title", "System.AssignedTo", "System.State",
			"Microsoft.VSTS.Scheduling.EstimatedWork", "Microsoft.VSTS.Scheduling.CompletedWork",
			"Microsoft.VSTS.Scheduling.RemainingWork", "Microsoft.VSTS.Common.Activity"]);

		let hours = {};
		for (let taskId of tasksIds)
		{
			// let taskDayHours = await tfsService.getTaskWorkInRange(taskId, from, to);
			// let sum = 0;
			//
			// for (let date in taskDayHours) {
			// 	let d = new Date(date);
			// 	if (d >= from && d <= to) {
			// 		sum += taskDayHours[date];
			// 	}
			// }
			
			hours[taskId] = await tfsService.getTaskWorkInRange(taskId, from, to);
		}

		let out = tasks
			.filter(x => hours[x.id] > 0)
			.sort((a, b) => a.fields["System.AssignedTo"] > b.fields["System.AssignedTo"] ? 1 : -1)
			.map(task =>`
<tr>
	<th>${task.id}</th>
	<td>${task.fields["System.Title"]}</th>
	<td>${task.fields["System.AssignedTo"]}</td>
	<td>${(hours[task.id] || 0).toString().replace(".", ",")}</td>
	<td>${(task.fields["Microsoft.VSTS.Scheduling.EstimatedWork"] || 0).toString().replace(".", ",")}</td>
	<td>${(task.fields["Microsoft.VSTS.Scheduling.CompletedWork"] || 0).toString().replace(".", ",")}</td>
	<td>${(task.fields["Microsoft.VSTS.Scheduling.RemainingWork"] || 0).toString().replace(".", ",")}</td>
	<td>${task.fields["Microsoft.VSTS.Common.Activity"] || ""}</td>
</tr>`
		).join("\n");

		response.writeHead(200, {"content-type": "text/html; charset=utf-8"});
		response.end("<table>" + out + "</table>");
	}
	catch (ex)
	{
		response.statusCode = 500;
		response.end(ex.message + ex.stack);
		console.log("WebServer::workTimeWeekReport() error: " + ex.message + ex.stack);
	}
};
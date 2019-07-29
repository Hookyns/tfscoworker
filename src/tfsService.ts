import {getNtlmHandler} from "azure-devops-node-api"; // TODO: Extract from package and put into azure-devops-node-api-0.7.0
import {WebApi} from "azure-devops-node-api-0.7.0/api/WebApi";
import Log from "./log";
import {TeamProjectReference} from "azure-devops-node-api-0.7.0/api/interfaces/CoreInterfaces";
import {
	IdentityRef,
	JsonPatchOperation,
	Operation
} from "azure-devops-node-api-0.7.0/api/interfaces/common/VSSInterfaces";
import ProjectInfo from "./dtos/projectInfo";
import TeamMemberInfo from "./dtos/teamMemberInfo";
import TaskInfo from "./dtos/taskInfo";
import {WorkItem} from "azure-devops-node-api-0.7.0/api/interfaces/WorkItemTrackingInterfaces";
import {createTaskInfo, toFloat, toInt} from "./utility/dataHelper";

export default class TfsService
{
	/**
	 * Field holding WebApi instance
	 */
	private _api: WebApi;

	/**
	 * Field holding TFS projects
	 */
	private _projects: Array<ProjectInfo> = [];

	/**
	 * Field holding all members from TFS
	 */
	private _teamMembers: Array<TeamMemberInfo> = [];

	/**
	 * API accessor
	 */
	get api(): WebApi
	{
		return this._api;
	}

	/**
	 * TFS projects
	 */
	get projects(): Array<ProjectInfo>
	{
		return this._projects.slice();
	}

	/**
	 * Team members
	 */
	get teamMembers(): Array<TeamMemberInfo>
	{
		return this._teamMembers;
	}

	/**
	 * Ctor
	 */
	constructor()
	{
		this.init();
	}

	/**
	 * Load all needed, cacheable info from TFS
	 */
	public async loadTfsInfo()
	{
		return Promise.all([
			this.loadProjects(),
			this.loadFields()
		]);
	}

	/**
	 * Get task info
	 * @param taskId
	 */
	public async getTaskInfo(taskId: number): Promise<TaskInfo>
	{
		const wit = this._api.getQWorkItemTrackingApi();
		let task = await wit.getWorkItem(taskId,
			[
				"System.WorkItemType", "System.Title", "System.AssignedTo", "System.State", "System.Tags",
				"Microsoft.VSTS.Scheduling.EstimatedWork", "Microsoft.VSTS.Scheduling.CompletedWork",
				"Microsoft.VSTS.Scheduling.RemainingWork", "Microsoft.VSTS.Common.Activity"
			]);

		return createTaskInfo(task);
	}

	/**
	 * Get detailed work times split over days
	 * @param taskId
	 */
	public async getTaskWorkPerDays(taskId: number): Promise<{ [date: string]: number }>
	{
		const wit = this._api.getQWorkItemTrackingApi();
		
		// Get revisions
		let revisions = (await wit.getRevisions(taskId))
			.sort((a, b) => a.rev - b.rev);
		
		let groups: { [date: string]: number } = {};
		let index = 0;
		
		for (let revision of revisions) {
			let dateTime = new Date(revision.fields["System.ChangedDate"]);
			let date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
			let dateId = date.toISOString();
			
			let prevCompletedWork = index > 0 ? toFloat(revisions[index - 1].fields["Microsoft.VSTS.Scheduling.completedWork"]) : 0;
			let addedTime = toFloat(revision.fields["Microsoft.VSTS.Scheduling.completedWork"]) - prevCompletedWork;
			
			groups[dateId] = (groups[dateId] || 0) + addedTime;
			
			index++;
		}
		
		
		return groups;
	}

	/**
	 * Apply work span over given task
	 * @param taskId
	 * @param workSpan
	 * @param userDisplayName
	 */
	public async applyWorkSpan(taskId: number, workSpan: number, userDisplayName: string): Promise<TaskInfo>
	{
		// Fix type
		workSpan = toFloat(workSpan);

		let task = await this.getTaskInfo(taskId);

		// Fix remaining
		let remaining = task.remainingWork - workSpan;
		if (remaining < 0) {
			remaining = 0;
		}

		let patch: Array<JsonPatchOperation> = [
			{
				op: Operation.Replace,
				path: "/fields/Microsoft.VSTS.Scheduling.CompletedWork",
				value: task.completedWork + workSpan,
				from: undefined
			},
			{
				op: Operation.Replace,
				path: "/fields/Microsoft.VSTS.Scheduling.RemainingWork",
				value: remaining,
				from: undefined
			},
			{
				op: Operation.Add,
				path: "/fields/System.History",
				value: "Work progress by: " + userDisplayName,
				from: undefined
			}
		];

		const wit = this._api.getQWorkItemTrackingApi();
		let res: WorkItem = await wit.updateWorkItem({}, patch, taskId);
		
		if (!res) {
			throw new Error("Work item update failed")
		}
		
		return createTaskInfo(res);
	}

	/**
	 * Load all work items fields
	 */
	private async loadFields()
	{
		// const wit = this._api.getQWorkItemTrackingApi();
		// let fields = await wit.getFields();
	}

	/**
	 * Load projects and their teams info
	 */
	private async loadProjects()
	{
		let core = this._api.getQCoreApi();
		let projects: TeamProjectReference[] = await core.getProjects();

		// List all project and store them in memory
		for (let project of projects) {
			let projectInfo: ProjectInfo = {
				id: project.id,
				name: project.name,
				description: project.description,
				members: []
			};

			// Get team(s)
			let teams = await core.getTeams(project.id);

			for (let team of teams.value) {
				// Get team members
				let members: IdentityRef[] = await core.getTeamMembers(project.id, team.id);

				for (let member of members) {
					let memberInfo: TeamMemberInfo = {
						id: member.id,
						displayName: member.displayName,
						uniqueName: member.uniqueName,
						profileUrl: member.profileUrl,
						imageUrl: member.imageUrl,
						projects: []
					};

					// Add member into project
					if (!projectInfo.members.some(m => m.id == member.id)) {
						projectInfo.members.push(memberInfo);
					}

					if (!this._teamMembers.some(m => m.id == member.id)) {
						this._teamMembers.push(memberInfo);
					}
				}
			}

			this._projects.push(projectInfo);
		}

		// Add project into team member info
		for (let member of this._teamMembers) {
			let memberProjs = this._projects.filter(p => p.members.some(m => m.id == member.id));

			for (let project of memberProjs) {
				member.projects.push(project);
			}
		}
	}

	/**
	 * Init TFS service
	 */
	private init()
	{
		try {
			const handler = getNtlmHandler(process.env.TFS_USERNAME, process.env.TFS_PASSWORD, "", "");
			this._api = new WebApi(process.env.TFS_API_URL, handler);
			
			// (async () => {
			// 	let res = await this.getTaskInfo(8523);
			// 	console.log(res);
			// })();
		} catch (err) {
			Log.error(err);
		}
	}
}
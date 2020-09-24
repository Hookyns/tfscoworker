import {getNtlmHandler} from "azure-devops-node-api"; // TODO: Extract from package and put into azure-devops-node-api-0.7.0
import {WebApi} from "azure-devops-node-api-0.7.0/api/WebApi";
import Log from "../utility/log";
import {TeamProjectReference} from "azure-devops-node-api-0.7.0/api/interfaces/CoreInterfaces";
import {
	IdentityRef,
	JsonPatchOperation,
	Operation
} from "azure-devops-node-api-0.7.0/api/interfaces/common/VSSInterfaces";
import ProjectInfo from "../dtos/projectInfo";
import TeamMemberInfo from "../dtos/teamMemberInfo";
import TaskInfo from "../dtos/taskInfo";
import {WorkItem} from "azure-devops-node-api-0.7.0/api/interfaces/WorkItemTrackingInterfaces";
import {createTaskInfo, getFieldPath, toFloat, toInt} from "../utility/dataHelper";
import {FieldName} from "./enums";

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
		]);
	}

	/**
	 * Get task info
	 * @param taskId
	 */
	public async getTaskInfo(taskId: number): Promise<TaskInfo>
	{
		const wit = this._api.getQWorkItemTrackingApi();
		let task = await wit.getWorkItem(taskId, FieldName.TaskInfoFieldNames);

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
			let dateTime = new Date(revision.fields[FieldName.ChangedDate]);
			let date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
			let dateId = date.toISOString();
			
			let prevCompletedWork = index > 0 ? toFloat(revisions[index - 1].fields[FieldName.CompletedWork]) : 0;
			let addedTime = toFloat(revision.fields[FieldName.CompletedWork]) - prevCompletedWork;
			
			groups[dateId] = (groups[dateId] || 0) + addedTime;
			
			index++;
		}
		
		
		return groups;
	}

	/**
	 * Get detailed work times split over days
	 * @param taskId
	 * @param from
	 * @param to
	 */
	public async getTaskWorkInRange(taskId: number, from: Date, to: Date): Promise<number>
	{
		const wit = this._api.getQWorkItemTrackingApi();

		// Get revisions
		let revisions = (await wit.getRevisions(taskId))
			.sort((a, b) => a.rev - b.rev);

		// let groups: { [date: string]: number } = {};
		let index = 0;
		let sum = 0;

		for (let revision of revisions) {
			let dateTime = new Date(revision.fields[FieldName.ChangedDate]);
			
			if (dateTime < from || dateTime > to) {
				index++;
				continue;
			}
			
			// let date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
			// let dateId = date.toISOString();

			let prevCompletedWork = index > 0 ? toFloat(revisions[index - 1].fields[FieldName.CompletedWork]) : 0;
			let addedTime = toFloat(revision.fields[FieldName.CompletedWork]) - prevCompletedWork;

			// groups[dateId] = (groups[dateId] || 0) + addedTime;
			
			sum += addedTime;

			index++;
		}


		return sum;
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
				path: getFieldPath(FieldName.CompletedWork),
				value: task.completedWork + workSpan,
				from: undefined
			},
			{
				op: Operation.Replace,
				path: getFieldPath(FieldName.RemainingWork),
				value: remaining,
				from: undefined
			},
			{
				op: Operation.Add,
				path: getFieldPath(FieldName.History),
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
	 * Returns team member info about member assigned to given work item
	 */
	public async getMemberAssignedTo(workItemId): Promise<TeamMemberInfo>
	{
		const wit = this._api.getQWorkItemTrackingApi();
		let assignedTo = await wit.getWorkItem(workItemId, [ FieldName.AssignedTo ]);
		console.log(assignedTo);
		return this._teamMembers.find(m => m.displayName == assignedTo.fields[FieldName.AssignedTo]);
	}

	/**
	 * Load projects and their teams info
	 */
	private async loadProjects()
	{
		let core = this._api.getQCoreApi();
		let projects: TeamProjectReference[] = await new Promise((resolve, reject) => {
			core.getProjects()
				.then((val) => resolve(val))
				.catch(reason => reject(reason));
		});

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
		} catch (err) {
			Log.error(err);
		}
	}
}
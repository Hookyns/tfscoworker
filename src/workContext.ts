import {TeamProject, WebApiTeamRef} from "azure-devops-node-api-0.7.0/api/interfaces/CoreInterfaces";

export default class WorkContext
{
	private readonly _team: WebApiTeamRef;
	private readonly _project: TeamProject;
	
	private readonly _userName: string;
	private readonly _userSystemName: string;

	/**
	 * Get client's selected project
	 */
	public get project(): TeamProject
	{
		return this._project;
	}

	/**
	 * Get client's selected project team info
	 */
	public get team(): WebApiTeamRef {
		return this._team;
	}

	/**
	 * Client's system username
	 */
	get userSystemName(): string
	{
		return this._userSystemName;
	}

	/**
	 * Client's username
	 */
	get userName(): string
	{
		return this._userName;
	}

	/**
	 * Ctor
	 * @param userName
	 * @param userSystemName
	 * @param project
	 * @param team
	 */
	constructor(userName: string, userSystemName: string, project: TeamProject, team: WebApiTeamRef)
	{
		this._userName = userName;
		this._userSystemName = userSystemName;
		this._project = project;
		this._team = team;
	}
}
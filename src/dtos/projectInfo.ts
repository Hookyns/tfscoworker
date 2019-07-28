import TeamMemberInfo from "./teamMemberInfo";

export default interface ProjectInfo {
	/**
	 * Team (Identity) Guid. A Team Foundation ID.
	 */
	id: string;
	
	/**
	 * Team name
	 */
	name: string;

	/**
	 * Project description
	 */
	description: string;

	/**
	 * List of team members
	 */
	members: Array<TeamMemberInfo>;
}
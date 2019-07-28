import ProjectInfo from "./projectInfo";

export default interface TeamMemberInfo {
	/**
	 * TFS Identification
	 */
	id: string;

	/**
	 * Member display name
	 */
	displayName: string;

	/**
	 * Unique name
	 */
	uniqueName: string;

	/**
	 * Image URL
	 */
	imageUrl: string;

	/**
	 * Profile URL
	 */
	profileUrl: string;

	/**
	 * List of team member's projects
	 */
	projects: Array<ProjectInfo>;
}
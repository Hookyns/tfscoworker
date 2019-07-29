export default interface TaskInfo {
	/**
	 * TFS Id of task
	 */
	id: number | undefined;

	/**
	 * Title
	 */
	title: string;

	/**
	 * State
	 */
	state: string;

	/**
	 * Activity
	 */
	activity: string;

	/**
	 * Estimated work time
	 */
	estimatedWork: number;

	/**
	 * Completed work time
	 */
	completedWork: number;

	/**
	 * Remaining work time
	 */
	remainingWork: number;

	/**
	 * Tags, separated by ";"
	 */
	tags: string;
}
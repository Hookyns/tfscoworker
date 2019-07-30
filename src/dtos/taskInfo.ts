export default interface TaskInfo {
	/**
	 * TFS Id of task
	 * @type {integer | undefined}
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
	 * @type {double}
	 */
	estimatedWork: number;

	/**
	 * Completed work time
	 * @type {double}
	 */
	completedWork: number;

	/**
	 * Remaining work time
	 * @type {double}
	 */
	remainingWork: number;

	/**
	 * Tags, separated by ";"
	 */
	tags: string;

	/**
	 * Task priority
	 * @type {integer}
	 */
	backlogPriority: number;
}
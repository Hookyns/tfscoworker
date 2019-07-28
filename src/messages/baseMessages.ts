import {MessageType} from "./messageType";
import ProjectInfo from "../dtos/projectInfo";
import TaskInfo from "../dtos/taskInfo";

/**
 * Base message interface
 */
export interface IBaseMessage
{
	Type: MessageType;
}

/**
 * Base response message
 */
export interface IBaseResponseMessage extends IBaseMessage
{
	/**
	 * Error message in case of error
	 */
	Error?: string;
}

/**
 * Disconnect message
 * @description Send from server to client before socket close
 */
export interface IDisconnectMessage extends IBaseMessage
{
	Reason: string;
}

/**
 * Request: Handshake message interface
 */
export interface IHandshakeMessage extends IBaseMessage
{
	/**
	 * Identifier
	 */
	Identifier: string; //Array<number>;

	/**
	 * User name
	 */
	User: string;

	/**
	 * User password
	 */
	Password: string;
}

/**
 * Response: Handshake response message
 */
export interface IHandshakeStatusMessage extends IBaseResponseMessage {
	Status: boolean;
}

/**
 * Request: Tasks list
 */
export interface IListMyTasksMessage extends IBaseMessage {
	/**
	 * Project ID (can be unique project name)
	 */
	ProjectId: string;
}

/**
 * Response: Tasks list
 */
export interface ITaskListMessage extends IBaseResponseMessage {
	Tasks: Array<TaskInfo>
}

/**
 * Request: Projects list
 */
export interface IListMyProjectsMessage extends IBaseMessage {
	
}

/**
 * Response: Projects list
 */
export interface IProjectListMessage extends IBaseResponseMessage {
	Projects: Array<ProjectInfo>
}

/**
 * Request: Apply work span
 */
export interface IApplyWorkSpanMessage extends IBaseMessage {
	/**
	 * Id of task to which changes should be applied
	 */
	TaskId: number;

	/**
	 * Work span time
	 */
	WorkTime: number;
}

/**
 * Response: Apply work span
 */
export interface IWorkSpanApplyResultMessage extends IBaseResponseMessage {
	/**
	 * Task after work span application
	 */
	Task: TaskInfo
}

/**
 * Request:Task work times per day
 */
export interface IListTaskPerDayWorkMessage extends IBaseMessage {
	/**
	 * Id of task whose details are required
	 */
	TaskId: number;
}

/**
 * Response:Task work times per day
 */
export interface ITaskPerDayWorkMessage extends IBaseResponseMessage {
	/**
	 * Id of task whose details are required
	 * @description Key-value collection (dictionary) with work time sums per day. Key is ISO date format. Value is float number.
	 */
	Work: { [date: string]: number };
}
import { MessageType } from "./messageType";
import ProjectInfo from "../../dtos/projectInfo";
import TaskInfo from "../../dtos/taskInfo";

/**
 * Base message interface
 */
export interface IBaseMessage
{
    type: MessageType;
}

/**
 * Base response message
 */
export interface IBaseResponseMessage extends IBaseMessage
{
    /**
     * Error message in case of error
     */
    error?: string;
}

/**
 * Disconnect message
 * @description Send from server to client before socket close
 */
export interface IDisconnectMessage extends IBaseMessage
{
    reason: string;
}

/**
 * Request: Handshake message interface
 */
export interface IHandshakeMessage extends IBaseMessage
{
    /**
     * Identifier
     */
    identifier: string;

    /**
     * User name
     */
    user: string;

    /**
     * User password
     */
    password: string;
}

/**
 * Response: Handshake response message
 */
export interface IHandshakeStatusMessage extends IBaseResponseMessage
{
    status: boolean;
}

/**
 * Request: Tasks list
 */
export interface IListMyTasksMessage extends IBaseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;
}

/**
 * Response: Tasks list
 */
export interface ITaskListMessage extends IBaseResponseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;

    /**
     * List of tasks
     */
    tasks: Array<TaskInfo>
}

/**
 * Request: Projects list
 */
export interface IListMyProjectsMessage extends IBaseMessage
{

}

/**
 * Response: Projects list
 */
export interface IProjectListMessage extends IBaseResponseMessage
{
    projects: Array<ProjectInfo>
}

/**
 * Request: Apply work span
 */
export interface IApplyWorkSpanMessage extends IBaseMessage
{
    /**
     * Id of task to which changes should be applied
     */
    taskId: number;

    /**
     * Work span time
     */
    workTime: number;
}

/**
 * Response: Apply work span
 */
export interface IWorkSpanApplyResultMessage extends IBaseResponseMessage
{
    /**
     * Task after work span application
     */
    task: TaskInfo
}

/**
 * Request:Task work times per day
 */
export interface IListTaskPerDayWorkMessage extends IBaseMessage
{
    /**
     * Id of task whose details are required
     */
    taskId: number;
}

/**
 * Response:Task work times per day
 */
export interface ITaskPerDayWorkMessage extends IBaseResponseMessage
{
    /**
     * Id of task whose details are required
     * @description Key-value collection (dictionary) with work time sums per day. Key is ISO date format. Value is float number.
     */
    work: { [date: string]: number };
}

/**
 * Request: Create task
 */
export interface ICreateTaskMessage extends IBaseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;

    /**
     * Task which should be created
     */
    task: TaskInfo
}

/**
 * Response: Task created
 */
export interface ITaskCreatedMessage extends IBaseResponseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;

    /**
     * Created task info
     */
    task: TaskInfo
}

/**
 * Notice: Task removed
 */
export interface ITaskRemovedMessage extends IBaseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;

    /**
     * Task which was removed
     */
    taskId: number
}

/**
 * Notice: Task assigned
 */
export interface ITaskAssignedMessage extends IBaseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;

    /**
     * Assigned task info
     */
    task: TaskInfo
}

/**
 * Notice: Task reassigned to somebody else
 */
export interface ITaskReassigned extends IBaseMessage
{
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;

    /**
     * Task which was reassigned
     */
    taskId: number

    /**
     * New task owner
     */
    userDisplayName: string;
}

/**
 * Request: List task's states
 */
export interface IListTaskStates extends IBaseMessage {
    /**
     * Project ID (can be unique project name)
     */
    projectId: string;
}

/**
 * Response: List of task's states
 */
export interface ITaskStatesListMessage extends IBaseResponseMessage {
    /**
     * List of states
     */
    states: Array<string>;
}
import TaskInfo from "../dtos/taskInfo";
import {WorkItem} from "azure-devops-node-api-0.7.0/api/interfaces/WorkItemTrackingInterfaces";
import {FieldName} from "../tfs-api/enums";

/**
 * Parse float number
 * @param num
 */
export function toFloat(num: string | number)
{
    let result = parseFloat(((num || "") + "").replace(",", "."));

    if (isNaN(result)) {
        return 0;
    }

    return result;
}

/**
 * Parse float number
 * @param num
 */
export function toInt(num: string | number)
{
    let result = parseInt(((num || "") + "").replace(",", "."));

    if (isNaN(result)) {
        return 0;
    }

    return result;
}

/**
 * Get Task info from work item
 * @param workItem
 */
export function createTaskInfo(workItem: WorkItem): TaskInfo {
    return {
        id: toInt(workItem.id),
        title: workItem.fields["System.Title"],
        activity: workItem.fields["Microsoft.VSTS.Common.Activity"],
        state: workItem.fields["System.State"],
        tags: workItem.fields["System.Tags"],
        estimatedWork: toFloat(workItem.fields["Microsoft.VSTS.Scheduling.EstimatedWork"]),
        completedWork: toFloat(workItem.fields["Microsoft.VSTS.Scheduling.CompletedWork"]),
        remainingWork: toFloat(workItem.fields["Microsoft.VSTS.Scheduling.RemainingWork"])
    }
}

/**
 * Return TFS path to field
 * @param {string} field
 */
export function getFieldPath(field: string): string {
	return "/fields/" + field;
}
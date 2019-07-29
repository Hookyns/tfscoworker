export interface IBaseEvent {
    /**
     * Type of event
     */
    eventType: string;

    /**
     * Text message describing event
     */
    message: { text: string };

    /**
     * Event resources
     */
    resource: IEventResource;
}

export interface IEventResource {
    id: number;

    /**
     * Work item ID (Id of Task, Bug etc..)
     */
    workItemId: number;

    /**
     * New revision number
     */
    rev: number;

    /**
     * Information about user who did revision
     */
    revisedBy: { id: string, name: string, url: string };

    /**
     * Revision date
     */
    revisedDate: string;

    /**
     * Field changes with old and new values
     */
    fields: { [field: string]: { oldValue: any, newValue: any } };
}
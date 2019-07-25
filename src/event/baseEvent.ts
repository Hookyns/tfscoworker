import EventArg from "./eventArg";

export default class BaseEvent<TData>
{
	/**
	 * List of listeners
	 */
	protected readonly listeners: Array<(data: EventArg<TData>) => void> = [];

	/**
	 * Event name
	 */
	protected _eventName?: string;

	/**
	 * Event name getter
	 */
	get eventName(): string
	{
		return this._eventName || "Unnamed";
	}
	
	/**
	 * Event ctor
	 * @param eventName Optional event name
	 */
	constructor(eventName?: string)
	{
		this._eventName = eventName;
	}

	/**
	 * Add listener
	 * @param listener
	 */
	public on(listener: (data: EventArg<TData>) => void)
	{
		this.listeners.push(listener);
	}

	/**
	 * Remove listener
	 * @param listener
	 */
	public off(listener: (data: EventArg<TData>) => void)
	{
		let index = this.listeners.indexOf(listener);

		if (index != -1) {
			this.listeners.splice(index, 1);
		}
	}

	/**
	 * Add listener
	 * @alias on
	 * @param listener
	 */
	public do(listener: (data: EventArg<TData>) => void) {
		return this.on(listener);
	}

	/**
	 * Remove listener
	 * @alias off
	 * @param listener
	 */
	public undo(listener: (data: EventArg<TData>) => void) {
		return this.off(listener);
	}
}
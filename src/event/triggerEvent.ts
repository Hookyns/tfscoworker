import BaseEvent from "./baseEvent";
import EventArg from "./eventArg";

export default class TriggerEvent<TData> extends BaseEvent<TData>
{
	/**
	 * Trigger listeners
	 * @param data
	 */
	public trigger(data?: TData)
	{
		let arg = new EventArg<TData>(data);
		
		for (let listener of this.listeners) {
			listener.call(null, arg);
			
			if (arg.propagationStopped) {
				return;
			}
		}
	}
}
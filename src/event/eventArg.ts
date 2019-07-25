export default class EventArg<TData>
{
	//region Fields
	
	/**
	 * Event data
	 */
	private readonly _data?: TData;

	/**
	 * Default prevent flag field
	 */
	private _defaultPrevented: boolean = false;

	/**
	 * Stop propagation flag field
	 */
	private _stopPropagation: boolean = false;

	//endregion
	
	//region Properties
	
	/**
	 * Getter to check if default action should be prevented
	 */
	get defaultPrevented(): boolean
	{
		return this._defaultPrevented;
	}

	/**
	 * Getter for data
	 */
	get data(): TData | undefined {
		return this._data;
	}

	/**
	 * Getter to check if propagation was stopped
	 */
	get propagationStopped(): boolean
	{
		return this._stopPropagation;
	}
	
	//endregion

	/**
	 * Event arg ctor
	 * @param data
	 */
	constructor(data?: TData)
	{
		this._data = data;
	}

	//region Methods
	
	/**
	 * Mark event for preventing default operation
	 */
	public preventDefault() {
		this._defaultPrevented = true;
	}

	/**
	 * Stop propagation of event
	 */
	public stopPropagation() {
		this._stopPropagation = true;
	}
	
	//endregion
}
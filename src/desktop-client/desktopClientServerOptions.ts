export interface DesktopClientServerOptions
{
	/**
	 * Info message logger
	 * @param args
	 */
	infoLogger?: (...args: Array<any>) => void;
	
	/**
	 * Warning message logger
	 * @param args
	 */
	warningLogger?: (...args: Array<any>) => void;
	
	/**
	 * Error message logger
	 * @param args
	 */
	errorLogger?: (...args: Array<any>) => void;
}
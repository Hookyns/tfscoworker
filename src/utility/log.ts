/**
 * Logger type
 */
declare type Logger = (message: string, ...args) => void;

/**
 * Log loggers options
 */
export interface ILogOptions
{
	/**
	 * Logger for debug messages
	 */
	debugLogger?: Logger;

	/**
	 * Logger for detailed/talkativeLogger messages
	 */
	talkativeLogger?: Logger;
	
	/**
	 * Logger for info messages
	 */
	infoLogger?: Logger;

	/**
	 * Logger for warning messages
	 */
	warnLogger?: Logger;

	/**
	 * Logger for error messages
	 */
	errorLogger?: Logger;
}

/**
 * Available logging levels
 */
export enum LogLevel
{
	/**
	 * No messages will be logged
	 */
	None,
	Error,
	Warn,
	Info,
	Talkative,
	Debug
}

/**
 * Log abstraction class
 */
export default class Log
{
	/**
	 * Current log level
	 */
	private static logLevel: LogLevel = LogLevel.Error;

	/**
	 * VOID logger
	 */
	private static voidLogger: Logger = () => {};

	/**
	 * Loggers
	 */
	private static loggers: { [key: number]: Logger } = {
		[LogLevel.None]: Log.voidLogger,
		[LogLevel.Error]: Log.voidLogger,
		[LogLevel.Warn]: Log.voidLogger,
		[LogLevel.Info]: Log.voidLogger,
		[LogLevel.Talkative]: Log.voidLogger,
		[LogLevel.Debug]: Log.voidLogger
	};

	/**
	 * Ctor
	 * @private
	 */
	protected constructor()
	{
		if (new.target != LogActivator) {
			throw new Error("This constructor is private!");
		}
	}

	/**
	 * Set loggers
	 * @param options
	 */
	public static setLoggers(options: ILogOptions)
	{
		Log.loggers[LogLevel.Debug] = options.debugLogger || Log.voidLogger;
		Log.loggers[LogLevel.Talkative] = options.talkativeLogger || Log.voidLogger;
		Log.loggers[LogLevel.Info] = options.infoLogger || Log.voidLogger;
		Log.loggers[LogLevel.Warn] = options.warnLogger || Log.voidLogger;
		Log.loggers[LogLevel.Error] = options.errorLogger || Log.voidLogger;
	}

	/**
	 * Set log level
	 * @param level
	 */
	public static setLogLevel(level: LogLevel)
	{
		this.logLevel = level;
	}

	/**
	 * Log message with given level
	 * @param level
	 * @param message
	 * @param args
	 */
	public static log(level: LogLevel, message: any, ...args: any[]): void
	{
		if (level > Log.logLevel) {
			return;
		}
		
		this.loggers[level](message, ...args);
	}
	
	/**
	 * Log debug message
	 * @param message
	 * @param args
	 */
	public static debug(message: string, ...args: any[]) {
		Log.log(LogLevel.Debug, message, ...args)
	}

	/**
	 * Log talkativeLogger message
	 * @param message
	 * @param args
	 */
	public static talkative(message: string, ...args: any[]) {
		Log.log(LogLevel.Talkative, message, ...args)
	}

	/**
	 * Log info message
	 * @param message
	 * @param args
	 */
	public static info(message: string, ...args: any[]) {
		Log.log(LogLevel.Info, message, ...args)
	}

	/**
	 * Log warn message
	 * @param message
	 * @param args
	 */
	public static warn(message: string, ...args: any[]) {
		Log.log(LogLevel.Warn, message, ...args)
	}

	/**
	 * Log error message
	 * @param message
	 * @param args
	 */
	public static error(message: string | Error, ...args: any[]) {
		Log.log(LogLevel.Error, message, ...args)
	}
}

class LogActivator extends Log {}
import DesktopClientServer from "./desktopClientServer";
import TfsService from "./tfsService";
import EventArg from "./event/eventArg";
import IClientMessageArg from "./dtos/clientMessageArg";
import {RouteTable} from "./router";
import Log from "./log";

/**
 * Base Application class
 */
export default class Application
{

	/**
	 * Field holding instance
	 */
	private static _instance: Application;

	/**
	 * TFS service
	 */
	private tfsService: TfsService;

	/**
	 * Server for desktop clients
	 */
	private server: DesktopClientServer;
	
	/**
	 * Application instance getter
	 */
	static get instance(): Application
	{
		return this._instance;
	}

	/**
	 * Application ctor
	 * @private
	 */
	protected constructor()
	{
		if (new.target != ApplicationActivator) {
			throw new Error("This constructor is private!");
		}

		this.init();
	}

	/**
	 * Initialize Application
	 */
	public static initialize()
	{
		Application.initEnvironmentConfiguration();

		// Create singleton instance
		Application._instance = Reflect.construct(Application, [], ApplicationActivator);
	}

	/**
	 * Initialize environment setting
	 */
	private static initEnvironmentConfiguration()
	{
		require("dotenv").config();
	}

	/**
	 * Initialization
	 */
	private init()
	{
		this.server = new DesktopClientServer(parseInt(process.env.PORT));
		this.server.start();

		this.tfsService = new TfsService();
		
		this.server.onMessage.do(data => this.routeMessage(data));
	}

	/**
	 * Route message
	 * @param data
	 */
	private routeMessage(data: EventArg<IClientMessageArg>)
	{
		const operation = RouteTable[data.data.message.Type];
		
		if (!operation) {
			Log.error(`Operation for message ${data.data.message.Type} wasn't found`)
		}
		
		
	}
}

class ApplicationActivator extends Application
{
}
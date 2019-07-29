import DesktopClientServer from "./desktopClientServer";
import TfsService from "./tfsService";
import EventArg from "./event/eventArg";
import IClientMessageArg from "./dtos/clientMessageArg";
import {RouteTable} from "./router";
import Log from "./log";
import WorkContext from "./dtos/workContext";
import {IHandshakeMessage} from "./messages/baseMessages";
import {TeamProject, WebApiTeamRef} from "azure-devops-node-api-0.7.0/api/interfaces/CoreInterfaces";
import {MessageType} from "./messages/messageType";

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
	}

	/**
	 * Initialize Application
	 */
	public static async initialize()
	{
		Application.initEnvironmentConfiguration();

		// Create singleton instance
		Application._instance = Reflect.construct(Application, [], ApplicationActivator);

		// Initialize
		await Application._instance.init();
	}

	/**
	 * Fetch client's work context
	 * @param handshakeMessage
	 */
	public async fetchClientWorkContext(handshakeMessage: IHandshakeMessage): Promise<WorkContext>
	{
		let members = this.tfsService.teamMembers.filter(m => m.uniqueName == handshakeMessage.user);

		if (members.length != 1) {
			return null;
		}

		return new WorkContext(members[0]);
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
	private async init()
	{
		// Init TFS
		this.tfsService = new TfsService();
		// Load all needed, cacheable info from TFS
		await this.tfsService.loadTfsInfo();

		// Init WS server for desktop clients
		this.server = new DesktopClientServer(parseInt(process.env.PORT));
		this.server.start();

		this.server.onMessage.do(data => this.routeMessage(data));
	}

	/**
	 * Route message
	 * @param data
	 */
	private async routeMessage(data: EventArg<IClientMessageArg>)
	{
		Log.talkative(`Message from ${data.data.client.workContext.memberInfo.displayName}: type: ${MessageType[data.data.message.type]}`, data.data.message);

		const operation = RouteTable[data.data.message.type];

		if (!operation) {
			Log.error(`Operation for message ${data.data.message.type} wasn't found`)
		}

		try {
			await operation(data.data.message, data.data.client, this.tfsService);
		} catch (err) {
			Log.error(err);
		}
	}
}

class ApplicationActivator extends Application
{
}
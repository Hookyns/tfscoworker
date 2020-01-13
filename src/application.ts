import DesktopClientServer from "./desktop-client/desktopClientServer";
import {IHandshakeMessage} from "./desktop-client/messages/messageInterfaces";
import {MessageType}       from "./desktop-client/messages/messageType";
import {MessageRouteTable} from "./desktop-client/messageRouteTable";
import IClientMessageArg  from "./dtos/clientMessageArg";
import WorkContext        from "./dtos/workContext";
import EventArg           from "./event/eventArg";
import {EventRouteTable}  from "./tfs-web-hooks/eventRouteTable";
import {IBaseEvent}       from "./tfs-web-hooks/interfaces";
import Log                from "./utility/log";
import TfsService         from "./tfs-api/tfsService";
import WebHooksServer     from "./tfs-web-hooks/webHooksServer";
import {WebServer}        from "./web-server/WebServer";
import workTimeWeekReport from "./web-server/operations/workTimeWeekReport";

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
    private desktopClientServer: DesktopClientServer;

    /**
     * Web Hooks server instance
     */
    private webHooksServer: WebHooksServer;

	/**
	 * Web server
	 */
	private webServer: WebServer;

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
     * Initialize environment setting
     */
    private static initEnvironmentConfiguration()
    {
        require("dotenv").config();
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
     * Initialization
     */
    private async init()
    {
        // Init TFS
        this.tfsService = new TfsService();
        // Load all needed, cacheable info from TFS
        await this.tfsService.loadTfsInfo();

        // Init Web Hooks server
        this.webHooksServer = new WebHooksServer(parseInt(process.env.WEB_HOOKS_PORT));
        this.webHooksServer.onEventMessage.do(arg => this.routeEventMessage(arg));
        this.webHooksServer.start();

        // Init WS server for desktop clients
        this.desktopClientServer = new DesktopClientServer(parseInt(process.env.PORT));
        this.desktopClientServer.onMessage.do(data => this.routeClientMessage(data));
        this.desktopClientServer.start();
        
        // Init WebServer
		this.webServer = new WebServer(parseInt(process.env.WEB_SERVER_PORT));
		this.webServer.on("/worktime/week", (args) => workTimeWeekReport(args.request, args.response, args.query, this.tfsService));
		this.webServer.start();
    }

    /**
     * Route message
     * @param data
     */
    private async routeClientMessage(data: EventArg<IClientMessageArg>)
    {
        Log.talkative(`${new Date().toISOString()}: Message from ${data.data.client.workContext.memberInfo.displayName}: type: ${MessageType[data.data.message.type]}`, data.data.message);

        const operation = MessageRouteTable[data.data.message.type];

        if (!operation) {
            Log.error(`Operation for message ${data.data.message.type} wasn't found`)
        }

        try {
            await operation(data.data.message, data.data.client, this.tfsService);
        }
        catch (err) {
            Log.error(err);
        }
    }

    /**
     * Route TFS event message
     * @param arg
     */
    private async routeEventMessage(arg: EventArg<IBaseEvent>) {
        try {
            await EventRouteTable[arg.data.eventType](arg.data, this.desktopClientServer, this.tfsService);
        }
        catch (err) {
            Log.error(err.message);
        }
    }
}

class ApplicationActivator extends Application
{
}
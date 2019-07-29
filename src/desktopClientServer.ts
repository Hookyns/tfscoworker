import * as WebSocket from "ws";
import * as $http from "http";
import TriggerEvent from "./event/triggerEvent";
import BaseEvent from "./event/baseEvent";
import {DesktopClientServerOptions} from "./desktopClientServerOptions";
import {IBaseMessage, IHandshakeMessage} from "./messages/baseMessages";
import DesktopClient from "./desktopClient";
import IClientMessageArg from "./dtos/clientMessageArg";
import Log from "./log";
import {AddressInfo} from "ws";

/**
 * Server for desktop clients
 */
export default class DesktopClientServer
{
	//region Fields

	/**
	 * Server port number
	 */
	private readonly port: number;

	/**
	 * Server options
	 */
	private options: DesktopClientServerOptions;

	/**
	 * On message event
	 */
	private readonly _onMessage = new TriggerEvent<IClientMessageArg>("message");

	/**
	 * On connect event
	 */
	private readonly _onConnect = new TriggerEvent<{ [key: string]: any }>("connect");

	/**
	 * Internal server instance
	 */
	private server: WebSocket.Server = null as any as WebSocket.Server;

	/**
	 * Upgraded clients with succeeded handshake
	 */
	private readonly clients: Array<DesktopClient> = [];

	//endregion

	//region Properties

	/**
	 * On message event
	 */
	public get onMessage(): BaseEvent<IClientMessageArg>
	{
		return this._onMessage;
	}

	/**
	 * On connect event
	 */
	public get onConnect(): BaseEvent<{ [key: string]: any }>
	{
		return this._onConnect;
	}

	//endregion

	/**
	 * Server ctor
	 * @param port
	 * @param {DesktopClientServerOptions} options
	 */
	constructor(port: number, options?: DesktopClientServerOptions)
	{
		this.options = options || {} as DesktopClientServerOptions;
		this.port = port;
	}

	//region Methods

	/**
	 * Start server listening
	 */
	public start()
	{
		this.server = new WebSocket.Server({port: this.port});

		this.server
			.on("listening", () => {
				let address: AddressInfo = this.server.address() as AddressInfo;
				Log.info(`Server is listening on [${address.address}]:${address.port}`);
			})
			.on("connection", (socket, request) => this.connection(socket as any, request))
	}

	/**
	 * Stop server listening
	 */
	public stop()
	{
		this.server.close((err) => {
			if (err) {
				Log.error(err);
				return;
			}

			Log.info("Server stopped");
		});
	}

	/**
	 * Remove client
	 * @description Called by client itself after disconnect or other events which are handled by DesktopClient. This just tells to server it should remote that client.
	 * @param client
	 */
	public removeClient(client: DesktopClient)
	{
		let index = this.clients.indexOf(client);

		if (index != -1) {
			this.clients.splice(index, 1);
		}
	}

	//endregion

	//region Private methods

	/**
	 * New connection handler
	 * @param socket
	 * @param request
	 */
	private async connection(socket: WebSocket, request: $http.IncomingMessage)
	{
		try {
			Log.info("New connection", request.connection.remoteAddress);

			const client = new DesktopClient(socket, this);
			let message: IHandshakeMessage = await client.handshake();

			if (message) {
				this.acceptClient(client, message);
			}
		} catch (err) {
			Log.error(err);
		}
	}

	/**
	 * Upgrade socket
	 * @param client
	 * @param message
	 */
	private acceptClient(client: DesktopClient, message: IHandshakeMessage)
	{
		Log.info("New client handshaked, user:", message.user);

		this.clients.push(client);

		client.onMessage.do(arg => {
			this._onMessage.trigger({client: client, message: arg.data as IBaseMessage});
		});
	}

	//endregion
}
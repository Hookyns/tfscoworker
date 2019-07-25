import * as $net from "net";
import {Server, Socket} from "net";
import TriggerEvent from "./event/triggerEvent";
import BaseEvent from "./event/baseEvent";
import {DesktopClientServerOptions} from "./desktopClientServerOptions";
import {Message} from "./message";
import {IBaseMessage, IDisconnectMessage, IHandshakeMessage} from "./messages/baseMessages";
import {MessageType} from "./messages/messageType";
import DesktopClient from "./desktopClient";
import IClientMessageArg from "./dtos/clientMessageArg";

/**
 * Server for desktop clients
 */
export default class DesktopClientServer
{
	//region Fields

	/**
	 * Handshake limit time [ms]
	 */
	private static HandshakeLimit = 1000;

	/**
	 * Handhsake identifier
	 */
	private static HandshakeIdentifier = [100, 100, 100];

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
	private server: Server = null as any as Server;

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

	/**
	 * Get info logger
	 */
	private get infoLogger(): (...args: any[]) => void
	{
		if (!this.options.infoLogger) {
			this.options.infoLogger = () => {
			};
		}

		return this.options.infoLogger;
	}

	/**
	 * Get error logger
	 */
	private get errorLogger(): (...args: any[]) => void
	{
		if (!this.options.errorLogger) {
			this.options.errorLogger = () => {
			};
		}

		return this.options.errorLogger;
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

		this.init();
	}

	//region Methods

	/**
	 * Start server listening
	 */
	public start()
	{
		this.server.listen(this.port, () => {
			this.infoLogger("Server is listening");
		});
	}

	/**
	 * Stop server listening
	 */
	public stop()
	{
		this.server.close((err) => {
			if (err) {
				this.errorLogger(err);
				return;
			}

			this.infoLogger("Server closed")
		});
	}

	/**
	 * Close given socket
	 * @param socket
	 * @param reason
	 */
	public closeSocket(socket: Socket, reason?: string)
	{
		socket.end(Message.create<IDisconnectMessage>({Type: MessageType.Disconnect, Reason: reason || ""}));

		setTimeout(() => {
			socket.destroy();
		}, 100);
	}

	//endregion

	//region Private methods

	/**
	 * Server init method
	 */
	private init()
	{
		this.server = $net.createServer(socket => this.connection(socket));
	}

	/**
	 * New connection handler
	 * @param socket
	 */
	private connection(socket: Socket)
	{
		this.infoLogger("New connection", socket.address());

		// Timeout destroying socket if no handshake delivered in limit
		let socketHandshakeTimeout = setTimeout(
			() => {
				this.closeSocket(socket, "Handshake timeout");
			},

			DesktopClientServer.HandshakeLimit
		);

		// Wait for handshake data
		socket.on("data", (data) => {
			try {
				if (data) {
					let msg = Message.decode<IHandshakeMessage>(data);

					if (msg.Type === MessageType.Handshake) {

						if (msg.Identifier.every(b => DesktopClientServer.HandshakeIdentifier.includes(b)
							&& DesktopClientServer.HandshakeIdentifier.every(b => msg.Identifier.includes(b))))
						{
							this.upgradeSocket(socket);
							clearTimeout(socketHandshakeTimeout);
						}

						return;
					}

					console.log("Unexpected data received:", msg);
				}
			} catch (err) {
				this.errorLogger("Handshake validation error:", err);
			}
		})
			.on("error", (err) => {
				this.closeSocket(socket, "Handshake error");
				this.errorLogger("Handshake error", socket.address(), err);
			})
			.on("close", () => {
				clearTimeout(socketHandshakeTimeout);
			});
	}

	/**
	 * Upgrade socket
	 * @param socket
	 */
	private upgradeSocket(socket: Socket)
	{
		this.infoLogger("New client handshaked");
		
		const client = new DesktopClient(socket);
		this.clients.push(client);
		
		client.onMessage.do(arg => {
			this._onMessage.trigger({ client: client, message: arg.data as IBaseMessage });
		});
	}

	//endregion
}
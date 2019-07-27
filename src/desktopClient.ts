import {Message} from "./message";
import TriggerEvent from "./event/triggerEvent";
import {IBaseMessage, IHandshakeMessage, IHandshakeStatusMessage} from "./messages/baseMessages";
import BaseEvent from "./event/baseEvent";
import {MessageType} from "./messages/messageType";
import * as WebSocket from "ws";
import Log from "./log";
import DesktopClientServer from "./desktopClientServer";

export default class DesktopClient
{
	/**
	 * Handshake limit time [ms]
	 */
	private static HandshakeLimit = 200000;

	/**
	 * Handhsake identifier
	 */
	private static HandshakeIdentifier = "4a9dffb1-a9af-4b43-ba99-501d8a4be93d";


	/**
	 * Internal client socket
	 */
	private socket: WebSocket;

	/**
	 * On message event
	 */
	private readonly _onMessage = new TriggerEvent<IBaseMessage>("message");

	/**
	 * Handshake timeout
	 */
	private socketHandshakeTimeout: number | undefined;

	/**
	 * True if handshake was made
	 */
	private handshaked: boolean = false;


	/**
	 * Handshake promise resolve function
	 */
	private handshakeResolver: undefined | ((value: IHandshakeMessage) => void);


	/**
	 * Handshake promise reject function
	 */
	private handshakeRejecter: undefined | ((reason?: any) => void);

	/**
	 * Desktop client server instance
	 */
	private desktopClientServer: DesktopClientServer;

	/**
	 * On message event
	 */
	public get onMessage(): BaseEvent<IBaseMessage>
	{
		return this._onMessage;
	}

	/**
	 * Client ctor
	 * @param socket
	 * @param desktopClientServer
	 */
	constructor(socket: WebSocket, desktopClientServer: DesktopClientServer)
	{
		this.socket = socket;
		this.desktopClientServer = desktopClientServer;

		this.init();
	}

	public async handshake(): Promise<IHandshakeMessage>
	{
		return new Promise((resolve, reject) => {
			try {
				// Timeout destroying socket if no handshake delivered in limit
				this.socketHandshakeTimeout = setTimeout(
					() => {
						this.closeSocket("Handshake timeout");

						// Reject promise =>> throw from awaited handshake()
						resolve(null);
					},
					DesktopClient.HandshakeLimit
				) as any;

				this.handshakeResolver = resolve;
				this.handshakeRejecter = reject;
			} catch (err) {
				// Reject promise =>> throw from awaited handshake()
				reject(err);
			}
		});
	}

	/**
	 * Send message
	 * @param message
	 */
	public send<TMessage extends IBaseMessage>(message: TMessage)
	{
		const msg = Message.create<TMessage>(message);
		this.socket.send(msg);
	}

	/**
	 * Close given socket
	 * @param {string} reason
	 */
	public closeSocket(reason?: string)
	{
		this.socket.close(1001, reason || "");
	}

	/**
	 * Initialize
	 */
	private init()
	{
		this.socket
			.on("message", data => {
				if (!data) {
					return;
				}

				const message = Message.decode<IBaseMessage>(data);

				if (!message) {
					return;
				}

				if (!this.handshaked) {
					this.processHandshake(message as IHandshakeMessage);
					return;
				}

				this._onMessage.trigger(message);
			})
			.on("error", (err) => {
				Log.error(err);
				
				if (!this.handshaked) {
					// Send negative handshake response
					this.send<IHandshakeStatusMessage>({Type: MessageType.HandshakeStatus, Status: false});
					this.handshakeRejecter(err);
				}
			})
			.on("close", had_error => {
				Log.info("Client closed connection");
				
				if (this.handshaked) {
					this.desktopClientServer.removeClient(this);
				}
			});
	}

	/**
	 *
	 * @param message
	 */
	private processHandshake(message: IHandshakeMessage)
	{
		if (message.Type !== MessageType.Handshake) {
			Log.info("Unexpected data received:", message);
		}

		// Clear timeout
		clearTimeout(this.socketHandshakeTimeout);

		if (message.Identifier == DesktopClient.HandshakeIdentifier)
		{
			if (message.User && message.Password) {
				if (this.handshakeResolver) {
					// TODO: Remove timeout, just cuz of tests
					setTimeout(() => {

						// Send positive handshake response
						this.send<IHandshakeStatusMessage>({Type: MessageType.HandshakeStatus, Status: true});
						this.handshakeResolver(message);
						this.handshaked = true;
						this.handshakeResolver = undefined;
						this.handshakeRejecter = undefined;
					}, 5000);
					return;
				}
			}
		}

		// Send negative handshake response
		this.send<IHandshakeStatusMessage>({Type: MessageType.HandshakeStatus, Status: false});
		this.handshakeResolver(null);
		this.handshakeResolver = undefined;
		this.handshakeRejecter = undefined;
	}
}
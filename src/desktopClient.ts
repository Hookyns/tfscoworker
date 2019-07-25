import {Socket} from "net";
import {Message} from "./message";
import TriggerEvent from "./event/triggerEvent";
import {IBaseMessage} from "./messages/baseMessages";
import BaseEvent from "./event/baseEvent";

export default class DesktopClient
{
	/**
	 * Internal client socket
	 */
	private socket: Socket;
	
	private readonly _onMessage = new TriggerEvent<IBaseMessage>("message");
	
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
	 */
	constructor(socket: Socket)
	{
		this.socket = socket;
		
		this.init();
	}

	/**
	 * Send message
	 * @param message
	 */
	public send<TMessage>(message: TMessage) {
		const msg = Message.create<TMessage>(message);
		this.socket.write(msg);
	}

	/**
	 * Initialize
	 */
	private init()
	{
		this.socket
			.on("data", data => {
				if (!data) {
					return;
				}
				
				const message = Message.decode<IBaseMessage>(data);
				
				if (!message) {
					return;
				}
				
				this._onMessage.trigger(message);
			})
			.on("error", (err) => {
				// TODO: error
			})
			.on("close", had_error => {
				// TODO: close
			});
	}
}
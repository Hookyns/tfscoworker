import WebSocket = require("ws");
import {IBaseMessage} from "./messages/baseMessages";

const msgPack = require('msgpack5')();

export const Message = {
	/**
	 * Encode data
	 * @param data
	 */
	create<TMessage extends IBaseMessage>(data: TMessage)
	{
		let tmp: Buffer = msgPack.encode(data);
		return Buffer.from([data.Type & 0xff, (data.Type >> 8) & 0xff, ...tmp.slice()]);
	},

	/**
	 * Decodes data
	 * @param data
	 */
	decode<TMessage extends IBaseMessage>(data: WebSocket.Data): TMessage
	{
		let bytes = data as Uint8Array;
		let message: TMessage = msgPack.decode(bytes.slice(2));
		message.Type = Buffer.from(bytes.slice(0, 2)).readUInt16LE(0);
			
		return message;
	}
};
const msgPack = require('msgpack5')();

export const Message = {
	/**
	 * Encode data
	 * @param data
	 */
	create<TMessage>(data: TMessage)
	{
		return msgPack.encode(data);
	},

	/**
	 * Decodes data
	 * @param data
	 */
	decode<TMessage>(data: any): TMessage
	{
		return msgPack.decode(data);
	}
};
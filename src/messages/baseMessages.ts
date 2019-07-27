import {MessageType} from "./messageType";

/**
 * Base message interface
 */
export interface IBaseMessage
{
	Type: MessageType;
}

/**
 * Disconnect message
 * @description Send from server to client before socket close
 */
export interface IDisconnectMessage extends IBaseMessage
{
	Reason: string;
}

/**
 * Handshake message interface
 */
export interface IHandshakeMessage extends IBaseMessage
{
	/**
	 * Identifier
	 */
	Identifier: string; //Array<number>;

	/**
	 * User name
	 */
	User: string;

	/**
	 * User password
	 */
	Password: string;
}

export interface IHandshakeStatusMessage extends IBaseMessage {
	Status: boolean;
}
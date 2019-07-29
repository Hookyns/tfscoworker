import DesktopClient from "../desktop-client/desktopClient";
import {IBaseMessage} from "../desktop-client/messages/messageInterfaces";

/**
 * Client message DTO 
 */
export default interface IClientMessageArg
{
	/**
	 * Desktop client
	 */
	client: DesktopClient;

	/**
	 * Message
	 */
	message: IBaseMessage;
}
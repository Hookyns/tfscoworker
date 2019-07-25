import DesktopClient from "../desktopClient";
import {IBaseMessage} from "../messages/baseMessages";

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
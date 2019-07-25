import DesktopClientServer from "./server";

export default class Application {

	/**
	 * Server for desktop clients
	 */
	private server: DesktopClientServer;

	/**
	 * Appolication ctor
	 * @param port
	 */
	constructor(port: number)
	{
		this.server = new DesktopClientServer(port, {
			infoLogger: console.log,
			warningLogger: console.warn,
			errorLogger: console.error
		});
		
		this.server.start();
	}
}
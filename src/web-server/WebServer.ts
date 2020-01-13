import * as $http                        from "http";
import {IncomingMessage, ServerResponse} from "http";
import * as $url                         from "url";
import * as $qs                          from "querystring";
import Log                               from "../utility/log";
import {AddressInfo}                     from "net";
import {UrlWithStringQuery}              from "url";
import BaseEvent                         from "../event/baseEvent";
import IClientMessageArg                 from "../dtos/clientMessageArg";
import {IWebRequestArgs}                 from "../dtos/IWebRequestArgs";

export class WebServer
{
	/**
	 * Web server port
	 */
	private port: number;

	/**
	 * HTTP Server
	 */
	private server: $http.Server;

	/**
	 * Handlers
	 */
	private handlers: {[path: string]: (args: IWebRequestArgs) => void} = {};

	/**
	 * Ctor
	 * @param port
	 */
	constructor(port: number)
	{
		this.port = port;
		this.server = $http.createServer(this.onRequestHandler.bind(this));
	}

	/**
	 * Start server
	 */
	public start()
	{
		this.server.listen(this.port, () => {
			let address: AddressInfo = this.server.address() as AddressInfo;
			Log.info(`Web server is listening on [${address.address}]:${address.port}`);
		});
	}

	/**
	 * Register handlers for paths
	 * @param path
	 * @param handler
	 */
	public on(path, handler: (args: IWebRequestArgs) => void) {
		if (this.handlers[path]) {
			return;
		}
		
		this.handlers[path] = handler;
	}

	/**
	 * Handler for HTTP server requests
	 * @param onRequest
	 */
	private onRequestHandler(request: IncomingMessage, response: ServerResponse)
	{
		let url: $url.UrlWithStringQuery = $url.parse(request.url);
		let query = $qs.parse(url.query);
		
		let action = this.handlers[url.pathname];
		
		if (!action) {
			response.statusCode = 404;
			response.end(`Action '${url.pathname}' not found.`);
			return;
		}
			
		action({request, response, url, query});
	}
	
	
}
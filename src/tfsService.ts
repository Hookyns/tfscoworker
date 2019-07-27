import {getNtlmHandler} from "azure-devops-node-api"; // TODO: Extract from package and put into azure-devops-node-api-0.7.0
import {WebApi} from "azure-devops-node-api-0.7.0/api/WebApi";
import Log from "./log";

export default class TfsService
{
	/**
	 * API accessor
	 */
	get api(): WebApi
	{
		return this._api;
	}
	
	/**
	 * Field holding WebApi instance
	 */
	private _api: WebApi;

	constructor()
	{
		this.init();
	}

	/**
	 * Init TFS service
	 */
	private init()
	{
		try {
			const handler = getNtlmHandler(process.env.TFS_USERNAME, process.env.TFS_PASSWORD, "", "");
			this._api = new WebApi(process.env.TFS_API_URL, handler);
		} catch (err) {
			Log.error(err);
		}
	}
}
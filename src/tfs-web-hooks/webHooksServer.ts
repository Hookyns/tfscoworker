import * as $http from "http";
import {IncomingMessage, Server, ServerResponse} from "http";
import BaseEvent from "../event/baseEvent";
import TriggerEvent from "../event/triggerEvent";
import Log from "../utility/log";
import {AddressInfo} from "ws";
import * as formidable from "formidable";
import {IBaseEvent} from "./interfaces";

export default class WebHooksServer
{
    /**
     * Server port
     */
    private readonly port: number;

    /**
     * Server instance
     */
    private server: Server;

    /**
     * On event message receive event
     */
    private _onEventMessage: TriggerEvent<IBaseEvent> = new TriggerEvent<IBaseEvent>("EventMessage");

    /**
     * On event message receive event
     */
    public get onEventMessage(): BaseEvent<IBaseEvent>
    {
        return this._onEventMessage;
    }

    /**
     * Ctor
     * @param port
     */
    constructor(port: number) {
        this.port = port;

        this.init();
    }

    /**
     * Start listening
     */
    public start() {
        this.server.listen(this.port, () => {
            let address: AddressInfo = this.server.address() as AddressInfo;
            Log.info(`Web Hooks server is listening on [${address.address}]:${address.port}`);
        });
    }

    /**
     * Request handler
     * @param req
     * @param res
     */
    private async request(req: IncomingMessage, res: ServerResponse): Promise<void> {
        // If not POST
        if (req.method.toUpperCase() != "POST") {
            res.writeHead(400);
            res.end("");
            return;
        }

        try {
            let form = new formidable.IncomingForm();

            await new Promise((resolve, reject) => {
                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    await this.processEvent(fields);
                    resolve();
                });
            });

            res.writeHead(200);
            res.end("");
        }
        catch (err) {
            res.writeHead(500);
            res.end(err.message);
        }
    }

    /**
     * Initialize web hooks server
     */
    private init() {
        this.server = $http.createServer((async (req, res) => await this.request(req, res)));
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Process incoming event
     * @param event
     */
    private async processEvent(event: IBaseEvent): Promise<void> {
        Log.info(`Event '${event.eventType}' received. ${event.message.text}`);
        this._onEventMessage.trigger(event);
    }
}
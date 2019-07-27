// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import Q = require('q');
import vsom = require('./VsoClient');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import {HttpClient} from 'typed-rest-client/HttpClient';
import restm = require("./RestClient");
// import {RestClient} from 'typed-rest-client/RestClient';

export class ClientApiBase {
    baseUrl: string;
    userAgent: string;
    httpClient: HttpClient;
    restClient: restm.RestClient;
    vsoClient: vsom.VsoClient;

    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], userAgent?: string);

    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], userAgent: string) {
        this.baseUrl = baseUrl;
        this.httpClient = new HttpClient(userAgent, handlers as any);
        this.restClient = new restm.RestClient(this.httpClient);
        this.vsoClient = new vsom.VsoClient(baseUrl, this.restClient);
        this.userAgent = userAgent;
    }

    setUserAgent(userAgent: string) {
        this.userAgent = userAgent;
        this.httpClient.userAgent = userAgent;
    }

    connect(onResult: (err: any, statusCode: number, obj: any) => void): void {
        this.restClient.getJson(this.vsoClient.resolveUrl('/_apis/connectionData'), "", null, null, onResult);
		// try {
		// 	let res = await this.restClient.get(this.vsoClient.resolveUrl('/_apis/connectionData'));
		// 	onResult(null, res.statusCode, res.result);
		// } catch (err) {
		// 	onResult(err, 500, undefined);
		// }
    }
}

export class QClientApiBase {

    api: ClientApiBase;

    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], api: typeof ClientApiBase) {
        this.api = new api(baseUrl, handlers);
    }

    public connect(): Q.Promise<any> {
        var defer = Q.defer();

        this.api.connect((err: any, statusCode: number, obj: any) => {
            if (err) {
                err.statusCode = statusCode;
                defer.reject(err);
            }
            else {
                defer.resolve(obj);
            }
        });

        return defer.promise;
    }
}
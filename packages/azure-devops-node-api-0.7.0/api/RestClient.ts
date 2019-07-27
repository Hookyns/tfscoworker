// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.



import fs = require("fs");
import http = require("http");

// import * as  restm from "typed-rest-client/RestClient";
import * as  httpm from "typed-rest-client/HttpClient";

import ifm = require("./interfaces/common/VsoBaseInterfaces");
import Serialization = require('./Serialization');

// /**
//  * getJSON:  REST get request returning JSON object(s)
//  * @param options: http options object
//  * @param callback: callback to pass the results JSON object(s) back
//  */
//
// var getJsonResponse = function (contents) {
//     var json = JSON.parse(contents);
//     return json;
// }

var httpCodes = {
    300: "Multiple Choices",
    301: "Moved Permanantly",
    302: "Resource Moved",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Switch Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout"
}

export function processResponse(url, res, contents, serializationData: Serialization.SerializationData, onResult) {
    if (res.statusCode > 299) {
        // not success
        var msg = httpCodes[res.statusCode] ? "Failed Request: " + httpCodes[res.statusCode] : "Failed Request";
        msg += '(' + res.statusCode + ') - ';

        if (contents && contents.length > 0) {
            var jsonObj = null;
            try {
                jsonObj = JSON.parse(contents);
            } catch (e) {}

            if (jsonObj && jsonObj.message) {
                msg += jsonObj.message;
            } else {
                msg += url;
            }
        }

        onResult(new Error(msg), res.statusCode, null);
    } else {
        try {
            var jsonObj = null;
            if (contents && contents.length > 0) {
                jsonObj = JSON.parse(contents);
                if (serializationData) {
                    jsonObj = Serialization.ContractSerializer.deserialize(jsonObj, serializationData.responseTypeMetadata, false, serializationData.responseIsCollection);
                }
            }
        } catch (e) {

            onResult(new Error('Invalid Resource'), res.statusCode, null);
            return;
        }

        onResult(null, res.statusCode, jsonObj);
    }
};

export function enumToString(enumType: any, enumValue: number, camelCase: boolean) {
    var valueString = enumType[enumValue];

    if (valueString && camelCase) {
        if (valueString.length <= 1) {
            valueString = valueString.toLowerCase();
        }
        else {
            valueString = valueString.substring(0, 1).toLowerCase() + valueString.substring(1);
        }
    }

    return valueString;
}

export function makeAcceptHeader(type: string, apiVersion: string): string {
	return type + (apiVersion ? (";api-version=" + apiVersion) : "");
}

export async function getStream(httpClient, url, apiVersion, type, onResult) {
	let accept = makeAcceptHeader("application/octet-stream", apiVersion);
	try {
		let res = await httpClient.get(url, {"Accept": accept});
		onResult(null, 200, res.message)
	} catch (err) {
		onResult(err, err.statusCode, null);
	}
}

export class RestClient implements ifm.IRestClient {
    baseUrl: string;
    basePath: string;
    httpClient: httpm.HttpClient;

    constructor(httpClient: httpm.HttpClient) {
        this.httpClient = httpClient;
    }

    getJson(url: string, apiVersion: string, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): void {
        this._getJson('GET', url, apiVersion, customHeaders, serializationData, onResult);
    }

    options(url: string, onResult: (err: any, statusCode: number, obj: any) => void): void {
        this._getJson('OPTIONS', url, "", null, null, onResult);
    }

    delete(url: string, apiVersion: string, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): void {
        this._getJson('DELETE', url, apiVersion, customHeaders, serializationData, onResult);
    }

    create(url: string, apiVersion: string, resources: any, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): void {
        this._sendJson('POST', url, apiVersion, resources, customHeaders, serializationData, onResult);
    }

    update(url: string, apiVersion: string, resources: any, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): void {
        this._sendJson('PATCH', url, apiVersion, resources, customHeaders, serializationData, onResult);
    }

    uploadFile(verb: string, url: string, apiVersion: string, filePath: string, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): void {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                onResult(err, 400, null);
                return;
            }

            var headers = customHeaders || {};
            headers["Content-Length"] = stats.size;

            var contentStream: NodeJS.ReadableStream = fs.createReadStream(filePath);

            this.uploadStream(verb, url, apiVersion, contentStream, headers, serializationData, onResult);
        });
    }

    async uploadStream(verb: string, url: string, apiVersion: string, contentStream: NodeJS.ReadableStream, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): Promise<void> {

        var headers = customHeaders || {};
        headers["Accept"] = makeAcceptHeader('application/json', apiVersion);
        
        try {
			let res = await this.httpClient.sendStream(verb, url, contentStream, headers);
			processResponse(url, res, await res.readBody(), serializationData, onResult);
		} catch (err) {
			onResult(err, err.statusCode, undefined);
		}
		
        // this.httpClient.sendFile(verb, url, contentStream, headers, (err: any, res: ifm.IHttpResponse, contents: string) => {
        //     if (err) {
        //         onResult(err, err.statusCode, contents);
        //         return;
        //     }
		//
        //     processResponse(url, res, contents, serializationData, onResult);
        // });
    }

    replace(url: string, apiVersion: string, resources: any, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): void {
        this._sendJson('PUT', url, apiVersion, resources, customHeaders, serializationData, onResult);
    }

    async _getJson(verb: string, url: string, apiVersion: string, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): Promise<void> {

        var headers = {};
        headers["Accept"] = makeAcceptHeader('application/json', apiVersion);
        
        try {
			let res = await this.httpClient.request(verb, url, null, headers);
			processResponse(url, res, await res.readBody(), serializationData, onResult);

		} catch (err) {
			onResult(err, err.statusCode, null);
		}
        
        // this.httpClient.get(verb, url, headers, (err: any, res: ifm.IHttpResponse, contents: string) => {
        //     if (err) {
        //         onResult(err, err.statusCode, null);
        //         return;
        //     }
		//
        //     processResponse(url, res, contents, serializationData, onResult);
        // });
    }

    async _sendJson(verb: string, url: string, apiVersion: string, data: any, customHeaders: ifm.IHeaders, serializationData: Serialization.SerializationData, onResult: (err: any, statusCode: number, obj: any) => void): Promise<void> {

        var headers = customHeaders || {};
        headers["Accept"] = makeAcceptHeader('application/json', apiVersion);
        headers["Content-Type"] = headers["Content-Type"] || 'application/json; charset=utf-8';

        if(serializationData) {
            data = Serialization.ContractSerializer.serialize(data, serializationData.requestTypeMetadata, true);
        }

		try {
			let res = await this.httpClient.request(verb, url, data, headers);
			processResponse(url, res, await res.readBody(), serializationData, onResult);
		} catch (err) {
			onResult(err, err.statusCode, undefined);
		}

        // this.httpClient.send(verb, url, data, headers, (err: any, res: ifm.IHttpResponse, contents: string) => {
        //     if (err) {
        //         onResult(err, err.statusCode, null);
        //         return;
        //     }
		//
        //     processResponse(url, res, contents, serializationData, onResult);
        // });
    }

}

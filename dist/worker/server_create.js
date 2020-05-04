"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("./worker");
class ServerCreateWorker extends worker_1.ServerWorker {
    constructor(client, data) {
        super(client);
        this.data = data;
    }
    process() {
        return new Promise((resolve, reject) => {
            const server = this.client.servers.build(this.data.serverName);
            server.serverType(this.data.serverType)
                .image(this.data.serverImage);
            if (this.data.serverLocation.length) {
                server.location(this.data.serverLocation);
            }
            if (this.data.serverSshKeyName.length) {
                server.sshKey(this.data.serverSshKeyName);
            }
            server.create()
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                let actionStatus = response.action.status;
                if (actionStatus === 'running') {
                    actionStatus = yield this.waitUntilFinished(response.action.id);
                }
                if (actionStatus === 'error') {
                    reject(`Removing the server failed. (action id: ${response.action.id})`);
                }
                resolve({
                    action: 'create',
                    id: response.server.id,
                    ipv4: response.server.publicNet.ipv4.ip,
                    ipv6: response.server.publicNet.ipv6.ip
                });
            }))
                .catch(reject);
        });
    }
}
exports.ServerCreateWorker = ServerCreateWorker;

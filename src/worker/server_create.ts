import {ServerWorker, TOutputFunc} from "./worker";
import * as hcloud from 'hcloud-js';
import {setOutput} from "@actions/core";

export interface ServerCreateData {
    serverName: string,
    serverType: string,
    serverImage: string,
    serverLocation?: string,
    serverSshKeyName?: string,
    waitForSsh: boolean
}

export class ServerCreateWorker extends ServerWorker<ServerCreateData> {
    constructor(client: hcloud.Client, outputFunc: TOutputFunc, data: ServerCreateData) {
        super(client, outputFunc);
        this.data = data;
    }

    public process()
    {
        return new Promise<void>((resolve, reject) => {
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
                .then(async (response) => {
                    let actionStatus = response.action.status;
                    if (actionStatus === 'running') {
                        actionStatus = await this.waitUntilFinished(response.action.id);
                    }
                    if (actionStatus === 'error') {
                        reject(`Removing the server failed. (action id: ${response.action.id})`);
                    }
                    this.setOutput('hcloud_server_id', response.server.id);
                    this.setOutput('hcloud_server_created_ipv4', response.server.publicNet.ipv4.ip);
                    this.setOutput('hcloud_server_created_ipv6', response.server.publicNet.ipv6.ip);
                    if (this.data.waitForSsh) {
                        const waitPort = require('wait-port')
                        await waitPort({
                            host: response.server.publicNet.ipv4.ip,
                            port: 22,
                        });
                    }
                    resolve();
                })
                .catch(reject);
        });
    }
}

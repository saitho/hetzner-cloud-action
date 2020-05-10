import {ServerWorker, TOutputFunc} from "./worker";
import * as hcloud from 'hcloud-js';

export interface ServerRemoveData {
    serverId: string
}

export class ServerRemoveWorker extends ServerWorker<ServerRemoveData> {
    constructor(client: hcloud.Client,  outputFunc: TOutputFunc, data: ServerRemoveData) {
        super(client, outputFunc);
        this.data = data;
    }

    public async process()
    {
        return new Promise<void>((resolve, reject) => {
            this.client.servers.delete(this.data.serverId)
                .then(async (response) => {
                    let actionStatus = response.status;
                    if (actionStatus === 'running') {
                        actionStatus = await this.waitUntilFinished(response.id);
                    }
                    if (actionStatus === 'error') {
                        reject(`Removing the server failed. (action id: ${response.id})`);
                    }
                    this.setOutput('hcloud_server_id', this.data.serverId);
                    resolve();
                })
                .catch(reject);
        });
    }
}
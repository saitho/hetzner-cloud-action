import {ServerWorker} from "./worker";
import * as hcloud from 'hcloud-js';
import {Server} from "../interfaces/server";

export interface ServerRemoveData {
    serverId: string
}

export class ServerRemoveWorker extends ServerWorker<ServerRemoveData> {
    constructor(client: hcloud.Client, data: ServerRemoveData) {
        super(client);
        this.data = data;
    }

    public async process()
    {
        return new Promise<Server>((resolve, reject) => {
            this.client.servers.delete(this.data.serverId)
                .then(async (response) => {
                    let actionStatus = response.status;
                    if (actionStatus === 'running') {
                        actionStatus = await this.waitUntilFinished(response.id);
                    }
                    if (actionStatus === 'error') {
                        reject(`Removing the server failed. (action id: ${response.id})`);
                    }
                    resolve({
                        action: 'remove',
                        id: this.data.serverId,
                        ipv4: null,
                        ipv6: null,
                        isAlive: null
                    });
                })
                .catch(reject);
        });
    }
}
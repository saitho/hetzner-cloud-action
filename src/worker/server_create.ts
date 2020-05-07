import {ServerWorker} from "./worker";
import * as hcloud from 'hcloud-js';
import * as ping from 'ping';
import {Server} from "../interfaces/server";

export interface ServerCreateData {
    serverName: string,
    serverType: string,
    serverImage: string,
    serverLocation?: string,
    serverSshKeyName?: string
}

export class ServerCreateWorker extends ServerWorker<ServerCreateData> {
    constructor(client: hcloud.Client, data: ServerCreateData) {
        super(client);
        this.data = data;
    }

    public process()
    {
        return new Promise<Server>((resolve, reject) => {
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
                        reject(`Creating the server failed. (action id: ${response.action.id})`);
                    }

                    const server = {
                        action: 'create',
                        id: response.server.id,
                        ipv4: response.server.publicNet.ipv4.ip,
                        ipv6: response.server.publicNet.ipv6.ip,
                        isAlive: null
                    };

                    ping.promise.probe(response.server.publicNet.ipv4.ip, {
                        deadline: 30 // wait 30 seconds for response
                    })
                        .then((pingResult) => resolve({...server, isAlive: pingResult.alive}))
                        .catch(() => resolve({...server, isAlive: false}))
                })
                .catch(reject);
        });
    }
}
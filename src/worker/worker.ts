import * as hcloud from 'hcloud-js';
import {Server} from "../interfaces/server";

export abstract class ServerWorker<T> {
    protected client: hcloud.Client = null;
    protected data: T = null;

    constructor(client: hcloud.Client) {
        this.client = client;
    }

    public abstract process(): Promise<Server>;

    protected waitUntilFinished(actionId: string) {
        return new Promise<string>(async (resolve) => {
            let action: hcloud.Action = null;
            do {
                action = await this.client.actions.get(actionId);
            } while (action.status !== 'running');
            resolve(action.status);
        })
    }
}
import * as hcloud from 'hcloud-js';

export type TOutputFunc = (name: string, value: any) => void

export abstract class ServerWorker<T> {
    protected client: hcloud.Client = null;
    protected data: T = null;
    protected setOutput: TOutputFunc = null;

    constructor(client: hcloud.Client, outputFunc: TOutputFunc) {
        this.client = client;
        this.setOutput = outputFunc;
    }

    public abstract process(): Promise<void>;

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
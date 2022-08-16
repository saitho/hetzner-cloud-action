import {debug, setFailed, getInput, setOutput} from '@actions/core'
import {join} from 'path'
import * as hcloud from 'hcloud-js';
import {ServerCreateData, ServerCreateWorker} from "./worker/server_create";
import {ServerRemoveData, ServerRemoveWorker} from "./worker/server_remove";
import {ServerWorker} from "./worker/worker";

function getServerCreateData(): ServerCreateData {
    const serverType = getInput('server_type');
    return {
        serverName: getInput('server_name'),
        serverType: serverType.length ? serverType : 'cx11',
        serverImage: getInput('server_image'),
        waitForSsh: ['1', 'true', 'yes'].includes( getInput('wait_for_ssh') ),
        serverLocation: getInput('server_location'),
        serverSshKeyName: getInput('server_ssh_key_name')
    };
}

function getServerRemoveData(): ServerRemoveData {
    return {
        serverId: getInput('server_id')
    };
}

/** Release main task. */
function run() {
    // Setup
    setOutput('hcloud_server_id', null);
    setOutput('hcloud_server_created_ipv4', null);
    setOutput('hcloud_server_created_ipv6', null);

    debug('action_workspace: ' + join(__dirname, '..'))
    debug('process.cwd: ' + process.cwd())

    // Do API calls
    let client = new hcloud.Client(process.env.API_TOKEN);
    let worker: ServerWorker<any> = null;
    let data = null;
    const action = getInput('action');
    switch (action) {
        case 'create':
            data = getServerCreateData();
            debug(`Creating server. Data: ${JSON.stringify(data)}`);
            worker = new ServerCreateWorker(client, setOutput, data);
            break;
        case 'remove':
            data = getServerRemoveData();
            debug(`Removing server. Data: ${JSON.stringify(data)}`);
            worker = new ServerRemoveWorker(client, setOutput, data);
            break;
        default:
            throw new Error(`Unknown action "${action}"`);
    }
    return worker.process();
}

run().catch((error) => {
    debug(error);
    setFailed(error);
    console.error(error);
});
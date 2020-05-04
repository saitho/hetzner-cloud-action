"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const path_1 = require("path");
const hcloud = require("hcloud-js");
const server_create_1 = require("./worker/server_create");
const server_remove_1 = require("./worker/server_remove");
function getServerCreateData() {
    const serverType = core_1.getInput('server_type');
    const data = {
        serverName: core_1.getInput('server_name'),
        serverType: serverType.length ? serverType : 'cx11',
        serverImage: core_1.getInput('server_image')
    };
    const serverLocation = core_1.getInput('server_location');
    if (serverLocation.length > 0) {
        data.serverLocation = serverLocation;
    }
    const serverSshKeyName = core_1.getInput('server_ssh_key_name');
    if (serverSshKeyName.length > 0) {
        data.serverSshKeyName = serverSshKeyName;
    }
    return data;
}
function getServerRemoveData() {
    return {
        serverId: core_1.getInput('server_id')
    };
}
/** Release main task. */
function run() {
    // Setup
    core_1.setOutput('hcloud_server_id', null);
    core_1.setOutput('hcloud_server_created_ipv4', null);
    core_1.setOutput('hcloud_server_created_ipv6', null);
    core_1.debug('action_workspace: ' + path_1.join(__dirname, '..'));
    core_1.debug('process.cwd: ' + process.cwd());
    // Do API calls
    let client = new hcloud.Client(process.env.API_TOKEN);
    let worker = null;
    let data = null;
    const action = core_1.getInput('action');
    switch (action) {
        case 'create':
            data = getServerCreateData();
            core_1.debug(`Creating server. Data: ${data}`);
            worker = new server_create_1.ServerCreateWorker(client, data);
            break;
        case 'remove':
            data = getServerRemoveData();
            core_1.debug(`Removing server. Data: ${data}`);
            worker = new server_remove_1.ServerRemoveWorker(client, data);
            break;
        default:
            throw new Error(`Unknown action "${action}"`);
    }
    return worker.process();
}
run().then((server) => {
    core_1.setOutput('hcloud_server_id', server.id);
    core_1.setOutput('hcloud_server_created_ipv4', server.ipv4);
    core_1.setOutput('hcloud_server_created_ipv6', server.ipv6);
    if (server.action === 'create') {
        core_1.debug(`Created server with id ${server.id} (IPv4: ${server.ipv4}, IPv6: ${server.ipv6})`);
    }
}).catch((error) => {
    core_1.debug(error);
    core_1.setFailed(error);
    console.error(error);
});

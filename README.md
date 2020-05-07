# Hetzner Cloud GitHub action

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Usage

### Inputs

| Name | Description | Action scope | Required? |
| ---- | ----------- | ------------ | --------- |
| action | The action to perform (create, delete) | - | yes |
| server_id | ID of the server | delete | yes |
| server_name | Name of the server | create | yes |
| server_type | Server type to set up | create | no (default: cx11) |
| server_image | Image used to create the server. | create | yes |
| server_location | Location of your server | create | no (default: nbg1) |
| server_ssh_key_name | Name of the SSH key you want to use to connect to the server.<br /><br />Requires you to add the public key in your Hetzner project panel. | create | no |

### Outputs

| Name             | Description |
| ---------------- | -------------------------------------------- |
| hcloud_server_id | ID of the server affected by the last action |
| hcloud_server_created_ipv4 | IPv4 address of the created server |
| hcloud_server_created_ipv6 | IPv6 address of the created server |

### Example

```yaml
jobs:
  startServer:
    name: Build
    runs-on: ubuntu-latest
    steps:
    # create a new server
    - name: Create new Hetzner server
      id: setup_server
      uses: saitho/hetzner-cloud-action@master
      with:
        action: create
        server_name: pr-${{ github.run_id }}
        server_image: ubuntu-18.04
        server_location: fsn1
        server_ssh_key_name: github-ci
      env:
        API_TOKEN: ${{ secrets.HETZNER_TOKEN }}
    # IPv4 address of created server is available in hcloud_server_created_ipv4
    # if CI is provided the private SSH key for the key named "server_ssh_key_name" it can connect via SSH
    - name: Work with the server
      run: echo 'do stuff on ${{ steps.setup_server.outputs.hcloud_server_created_ipv4 }}'
    # remove server
    - name: Remove Hetzner server
      uses: saitho/hetzner-cloud-action@master
      with:
        action: remove
        server_id: ${{ steps.setup_server.outputs.hcloud_server_id }}
      if: always() # make sure server is removed even if steps in between fail
      env:
        API_TOKEN: ${{ secrets.HETZNER_TOKEN }}
```

## Server boot time

In some cases the server may need some more time to be ready for connections.
Unfortunately GitHub runners can't use `ping` to check if the server can be reached.
You may want to add a sleep step after creating the server in order to make sure it's ready when working with it.

```yaml
jobs:
  startServer:
    steps:
      # ... create step here ...
      - name: wait for server
        run: sleep 5 # wait for 5 seconds
```

## SSH keys

You can set up an SSH key which you or your CI can use to connect to the newly created server.
Add the public key to your Hetzner project and the private key to your job's secrets.

Make sure to set `server_ssh_key_name` to the name you specified on your Hetzner project.

### Detailed instructions


Create a new SSH key without a passphrase:

```
ssh-keygen -f ./my-ssh-key -m pem -C gh-actions
```

This will create two files: `my-ssh-key` (private key) and `my-ssh-key.pub` (public key).

Go to your Hetzner project and create a new SSH key entry with the contents of `my-ssh-key.pub` and choose a name (e.g. `github-ci`).

Next, go to your GitHub repository and add a new secret with the contents of `my-ssh-key` and choose a name (e.g. `SSH_PRIVATE_KEY`)

You can then use any SSH provider GitHub action to use the key within your build, e.g.

```
- uses: webfactory/ssh-agent@v0.2.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

Also in the definition for @saitho/hetzner-cloud-action@ make sure to set `server_ssh_key_name` to the name you chose before (e.g. `github-ci`).

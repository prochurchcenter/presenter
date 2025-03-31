# presenter-react

An Electron application with React and TypeScript supporting real-time database synchronization.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

## Database Synchronization

This application uses Gun.js to provide real-time database synchronization between multiple instances running on the same network.

### How Sync Works

1. Each instance runs a Gun.js server on port 8765
2. The application automatically merges changes from connected peers
3. Data is stored locally using LMDB, ensuring persistence even when offline
4. When peers reconnect, data is automatically synchronized

### Setting Up Sync

To connect two or more instances of the application:

1. Open the Settings page in both instances
2. In each instance, find your "Connection Address" (looks like `http://192.168.1.xxx:8765/gun`)
3. In the second instance, enter the first instance's address in the "Add New Peer" field and click "Connect"
4. Optionally, do the same in reverse to ensure bidirectional connection

Once connected, all database operations (creating, updating, and deleting items) will be automatically synchronized between the connected instances.

### Troubleshooting Sync

- Ensure both devices are on the same network
- Check that port 8765 is not blocked by a firewall
- Verify the IP addresses are correct for your network
- Try restarting the application if connections fail

# ENTERO on Domain.by

The deployment archive is prebuilt. No dependency installation or server-side build is required.

## ISPmanager / Node.js application

- Node.js version: `24` (minimum `22.13`)
- Application root: the directory containing `package.json`
- Entry point: `server/index.mjs`
- Mode: `production`
- Start command when the panel requests one: `npm run start:domainby`
- Health check: `/healthz`

The entrypoint supports both hosting styles:

- ISPmanager socket: set `SOCKET_PATH` or `SOCKET` to the socket path supplied by the panel.
- TCP port: set `PORT` to the port supplied by the panel. `HOST` defaults to `127.0.0.1`.

Upload and extract the contents of `entero-domainby-node.tar.gz` into the application root. Do not place the archive itself inside the public web directory when the panel uses a separate Node application root.

After the application starts, attach the required domain in ISPmanager and verify:

- `/healthz` returns `ok`;
- `/?stage=idea`, `/?stage=space`, and `/?stage=project` open;
- CSS, fonts, AVIF/WebP images and JavaScript return HTTP 200.

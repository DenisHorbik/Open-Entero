# ENTERO on Domain.by

The deployment archive is prebuilt. No dependency installation or server-side build is required.

## ISPmanager / Node.js application

- Node.js version: `24` (minimum `22.13`)
- Application root: the directory containing `package.json`
- Entry point: `server/index.mjs`
- Mode: `production`
- Start command when the panel requests one: `npm run start:domainby`
- Health check: `/healthz`

## Private CRM environment

Add these variables in the Node.js application settings in ISPmanager. Do not place their values in Git, HTML, client JavaScript or a deployment archive:

```text
BITRIX24_WEBHOOK_URL=<full incoming webhook URL>
BITRIX24_DEAL_CATEGORY_ID=0
BITRIX24_DEAL_STAGE_ID=NEW
BITRIX24_SOURCE_ID=WEB
LEAD_UPLOAD_SECRET=<random secret of at least 32 characters>
```

`BITRIX24_WEBHOOK_URL` must use HTTPS. `LEAD_UPLOAD_SECRET` signs the short-lived token used when a visitor adds a document on the thank-you page. Restart only the `open.entero.by` Node.js application after changing these values.

On Domain.by these values are stored in `/www/open.entero.by/crm-config.txt`.
The generated `server.js` loads that file before starting the application. The
secret file is deliberately excluded from release archives and Git. The Node
server serves only the compiled `dist` tree, so this host-level file is not a
public web asset.

The entrypoint supports both hosting styles:

- ISPmanager socket: set `SOCKET_PATH` or `SOCKET` to the socket path supplied by the panel.
- TCP port: set `PORT` to the port supplied by the panel. `HOST` defaults to `127.0.0.1`.

Upload and extract the contents of `entero-domainby-node.tar.gz` into the application root. Do not place the archive itself inside the public web directory when the panel uses a separate Node application root.

After the application starts, attach the required domain in ISPmanager and verify:

- `/healthz` returns `ok`;
- `/?stage=idea`, `/?stage=space`, and `/?stage=project` open;
- CSS, fonts, AVIF/WebP images and JavaScript return HTTP 200.
- a test form creates one company and one deal in Bitrix24, and an additional document appears in the deal timeline.

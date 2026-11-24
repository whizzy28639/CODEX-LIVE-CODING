# CODEX PLAYGROUND

Browser-based HTML/CSS/JavaScript editor with server-backed administrator-controlled access requests.

## Run locally

1. Install Node.js 18 or newer.
2. Keep the included `.env` file private. It is configured with the requested admin password `TESTIMONY` for this private handoff.
3. In this folder, run:

   ```bash
   npm start
   ```

4. Open `http://localhost:8080` in your browser.
5. Visitors submit an access request. Use **ADMIN LOGIN** in the top-left and enter `TESTIMONY` to review requests.

Do not open `index.html` directly with `file://`. The access-request system requires the Node.js server.

## Deploying

Deploy this folder as a Node.js web service. Set the start command to `npm start` and configure `ADMIN_PASSWORD` as a private environment variable in the hosting dashboard. Set `NODE_ENV=production` when the site is served over HTTPS. Do not publish the included `.env` file or commit it to a public repository; replace its password before public deployment.

The app stores access requests in `data/access-requests.json`. The hosting service must provide persistent storage for the `data` directory (for example, an attached persistent disk). Without persistent storage, requests may be lost when the host restarts or redeploys. Back up this file regularly.

## Access model

- No visitor account creation, password, or email verification.
- Visitors submit a name, optional email, and reason.
- The administrator approves, rejects, suspends, restores, revokes, or deletes requests.
- Approval is associated with the visitor's browser cookie. Clearing browser cookies or switching browsers/devices means the visitor will need a fresh request.
- Admin sessions are server-side and expire when the server restarts or after the session cookie expires.

## Important notes

- Admin password checks and approval actions happen on the server; the password is not embedded in the frontend.
- This is a lightweight single-server JSON-file backend, suitable for a small private deployment. For high traffic or multiple server instances, migrate the JSON store to a managed database and shared session storage.
- Monaco Editor, JSZip, and FileSaver continue to load from their existing CDNs, so the editor requires an internet connection for those dependencies.

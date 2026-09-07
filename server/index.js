// LINEAR — Discord OAuth backend + static site server
// npm install express cors dotenv
// node server/index.js  →  runs on http://localhost:8000
//
// 1) create server/.env  (NEVER commit this file):
//      CLIENT_ID=1541543623215030473
//      CLIENT_SECRET=your_secret_here
//      REDIRECT_URI=http://localhost:8000/auth
//      SITE_ORIGIN=http://localhost:8000
//
// 2) In the Discord Developer Portal → OAuth2 → Redirects, add:
//      http://localhost:8000/auth

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: process.env.SITE_ORIGIN || true }));

const CLIENT_ID = process.env.CLIENT_ID || "1541543623215030473";
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/auth`;
const SITE_ORIGIN = process.env.SITE_ORIGIN || `http://localhost:${PORT}`;

const SITE_ROOT = path.join(__dirname, "..");
const LOADER_PATH = path.join(SITE_ROOT, "loader", "Linear.Loader V1.3.2.exe");
const LOADER_NAME = "Linear.Loader.V1.3.2.exe";

if (!CLIENT_SECRET) {
  console.warn("[warn] CLIENT_SECRET missing — add it to server/.env");
}

// Download loader — must be before static middleware
app.get("/download", (req, res) => {
  if (!fs.existsSync(LOADER_PATH)) {
    return res.status(404).send("loader file not found");
  }
  res.setHeader("Content-Disposition", `attachment; filename="${LOADER_NAME}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  fs.createReadStream(LOADER_PATH).pipe(res);
});

// Serve static files from project root
app.use(express.static(SITE_ROOT));

// Step 2 of OAuth: Discord redirects here with ?code=...
app.get("/auth", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("missing code");

  try {
    // exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error("token exchange failed");

    // fetch the discord profile
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    const user = await userRes.json();

    // TODO (later): create/find the user row in your DB here,
    // issue your own session JWT instead of a plain redirect.

    const params = new URLSearchParams({
      login: "success",
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
        : ""
    });
    res.redirect(`${SITE_ORIGIN}/?${params.toString()}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("discord auth failed");
  }
});

app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));

// LINEAR — Discord auth for Cloudflare Workers (always on, free tier)
//
// 1) dash.cloudflare.com → Workers & Pages → Create Worker → name it (e.g. "linear-auth") → Deploy
// 2) Edit code → paste this whole file → Deploy
// 3) Worker → Settings → Variables → add:
//      CLIENT_ID      = 1541543623215030473
//      CLIENT_SECRET  = (your secret)
//      REDIRECT_URI   = https://linear-auth.<your-subdomain>.workers.dev/auth
//      SITE_ORIGIN    = http://localhost:8000        (later: https://yourdomain.com)
// 4) Discord Developer Portal → OAuth2 → Redirects → add the SAME REDIRECT_URI value
// 5) In js/main.js set DISCORD_AUTH.redirectUri to that same URL

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname !== "/auth") {
      return new Response("linear auth service", { status: 404 });
    }

    const code = url.searchParams.get("code");
    if (!code) return new Response("missing code", { status: 400 });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.CLIENT_ID,
        client_secret: env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: env.REDIRECT_URI
      })
    });
    const token = await tokenRes.json();
    if (!token.access_token) return new Response("token exchange failed", { status: 500 });

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    const user = await userRes.json();

    const params = new URLSearchParams({
      login: "success",
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
        : ""
    });

    return Response.redirect(`${env.SITE_ORIGIN}/?${params.toString()}`, 302);
  }
};

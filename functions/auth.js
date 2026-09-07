// LINEAR — Discord auth as a Cloudflare Pages Function
// This file must live at:  functions/auth.js   (next to index.html)
// Then https://linearauth.pages.dev/auth comes alive automatically.
//
// Set these in Pages dashboard → Settings → Environment variables:
//   CLIENT_ID      = 1541543623215030473
//   CLIENT_SECRET  = (your secret)
//   REDIRECT_URI   = https://linearauth.pages.dev/auth
//   SITE_ORIGIN    = https://linearauth.pages.dev   (or http://localhost:8000 while testing)

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
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

// Cloudflare Pages Function — Loader download
// Serves the loader exe as a downloadable file.
// The file must be uploaded as a static asset or stored in R2/KV.

const LOADER_NAME = "Linear.Loader.V1.3.2.exe";

export async function onRequestGet({ env }) {
  // For Cloudflare Pages, the loader file should be placed in the static output
  // and served directly. This function handles the download headers.
  const url = new URL(env.SITE_ORIGIN || "https://linearauth.linear-04e.workers.dev");
  const fileUrl = `${url.origin}/loader/${LOADER_NAME}`;

  return new Response(null, {
    status: 302,
    headers: {
      "Location": fileUrl,
      "Content-Disposition": `attachment; filename="${LOADER_NAME}"`
    }
  });
}

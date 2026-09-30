// Server-side password gate for the Family Portal site (Cloudflare Pages Functions).
// Runs before every request (pages, assets, data files). Anyone can see the
// login page; entering the correct password sets a session cookie, after which
// the portal's own login works as before. The password itself is never in this
// file — only its SHA-256 hash, supplied via the PASSWORD_SHA256 environment
// variable on the Pages project.

const COOKIE = "fp_gate";
const MAX_AGE = 2592000; // 30 days

async function sha256Hex(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCookie(request, name) {
  const h = request.headers.get("Cookie") || "";
  const m = h.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function loginPage(message, isError) {
  const note = message
    ? '<p class="' + (isError ? "err" : "hint") + '">' + message + "</p>"
    : '<p class="hint">Enter the password to continue.</p>';
  const html =
    "<!doctype html><html lang='en'><head><meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>Family Portal — Sign in</title><style>" +
    "*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;" +
    "background:#0f1a2b;color:#f3ede2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px}" +
    ".card{width:100%;max-width:360px;background:#16263f;border:1px solid #2a3d5c;border-radius:16px;padding:32px 28px;text-align:center}" +
    "h1{margin:0 0 4px;font-size:26px}.sub{margin:0 0 20px;color:#9fb0c9;font-size:14px}" +
    ".hint{color:#9fb0c9;font-size:14px}.err{color:#ff9d9d;font-size:14px}" +
    "input{width:100%;padding:12px;border-radius:10px;border:1px solid #2a3d5c;background:#0f1a2b;color:#f3ede2;font-size:16px;margin:8px 0}" +
    "button{width:100%;padding:12px;border:0;border-radius:10px;background:#e8a33d;color:#16263f;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px}" +
    "</style></head><body><main class='card'><h1>Family Portal</h1><p class='sub'>Yu Family</p>" +
    note +
    "<form method='POST' action='/__login'>" +
    "<input type='password' name='password' placeholder='Password' autocomplete='current-password' required autofocus>" +
    "<button type='submit'>Enter</button></form></main></body></html>";
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const pwHash = env.PASSWORD_SHA256 || "";
  const token = pwHash ? await sha256Hex(pwHash + ":familyportal-auth") : "";

  // Authenticated visitors pass straight through to the site.
  if (token && getCookie(request, COOKIE) === token) {
    return next();
  }

  const url = new URL(request.url);

  // Login submission.
  if (url.pathname === "/__login") {
    if (request.method === "POST") {
      let pw = "";
      try {
        pw = String((await request.formData()).get("password") || "");
      } catch (e) {
        // fall through to the error page
      }
      if (pwHash && pw && (await sha256Hex(pw)) === pwHash) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie":
              COOKIE +
              "=" +
              token +
              "; Path=/; Max-Age=" +
              MAX_AGE +
              "; HttpOnly; Secure; SameSite=Lax",
            "Cache-Control": "no-store",
          },
        });
      }
      return loginPage("Incorrect password — try again.", true);
    }
    return Response.redirect(url.origin + "/", 302);
  }

  // Everyone else gets the login page.
  return loginPage();
}

import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { assertTikTokApp, tiktokRedirectUriTemplate } from "./env";
import { challengeFromVerifier, randomState, randomVerifier } from "./pkce";
import { saveTokens, type TikTokTokenFile } from "./tokenStore";

const execFileAsync = promisify(execFile);
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const SCOPES = ["user.info.basic", "video.upload", "video.publish"].join(",");

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  open_id?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

export function resolveRedirectUri(port: number): string {
  const template = tiktokRedirectUriTemplate();
  if (template.includes(":*")) {
    return template.replace(":*", `:${port}`);
  }
  return template;
}

function parseFixedPort(template: string): number | null {
  const match = template.match(/:(\d+)\//);
  return match ? Number(match[1]) : null;
}

async function openBrowser(url: string): Promise<void> {
  try {
    await execFileAsync("open", [url]);
  } catch {
    console.log(`Open this URL in a private browser window:\n${url}`);
  }
}

async function postForm(url: string, body: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams(body).toString(),
  });
  return (await response.json()) as TokenResponse;
}

function toTokenFile(data: TokenResponse, displayName?: string): TikTokTokenFile {
  if (!data.access_token || !data.refresh_token || !data.open_id) {
    throw new Error(data.error_description || data.error || "TikTok did not return tokens.");
  }
  const now = Date.now();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(now + (data.expires_in ?? 86400) * 1000).toISOString(),
    refreshExpiresAt: new Date(now + (data.refresh_expires_in ?? 31536000) * 1000).toISOString(),
    openId: data.open_id,
    scope: data.scope ?? SCOPES,
    displayName,
  };
}

export async function fetchDisplayName(accessToken: string): Promise<string | undefined> {
  const url = `${USER_INFO_URL}?fields=open_id,display_name,avatar_url`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await response.json()) as {
    data?: { user?: { display_name?: string } };
  };
  return json.data?.user?.display_name;
}

export async function refreshAccessToken(refreshToken: string): Promise<TikTokTokenFile> {
  const { clientKey, clientSecret } = assertTikTokApp();
  const data = await postForm(TOKEN_URL, {
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const tokens = toTokenFile(data);
  try {
    tokens.displayName = await fetchDisplayName(tokens.accessToken);
  } catch {
    tokens.displayName = undefined;
  }
  await saveTokens(tokens);
  return tokens;
}

export async function loginWithTikTok(): Promise<TikTokTokenFile> {
  const { clientKey, clientSecret } = assertTikTokApp();
  const verifier = randomVerifier();
  const challenge = challengeFromVerifier(verifier);
  const state = randomState();
  const fixedPort = parseFixedPort(tiktokRedirectUriTemplate());

  const tokens = await new Promise<TikTokTokenFile>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const requestUrl = new URL(req.url ?? "/", `http://127.0.0.1`);
        if (!requestUrl.pathname.replace(/\/$/, "").endsWith("callback")) {
          res.writeHead(404);
          res.end();
          return;
        }
        const error = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
        const returnedState = requestUrl.searchParams.get("state");
        const code = requestUrl.searchParams.get("code");
        if (error) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<p>TikTok login failed: ${error}</p>`);
          reject(new Error(error));
          server.close();
          return;
        }
        if (returnedState !== state || !code) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end("<p>TikTok login state mismatch. Close this tab and run login again.</p>");
          reject(new Error("TikTok login state mismatch."));
          server.close();
          return;
        }

        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 0;
        const redirectUri = resolveRedirectUri(port);
        const data = await postForm(TOKEN_URL, {
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: verifier,
        });
        const next = toTokenFile(data);
        try {
          next.displayName = await fetchDisplayName(next.accessToken);
        } catch {
          next.displayName = undefined;
        }
        await saveTokens(next);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<html><body style="font-family:ui-sans-serif;padding:48px;background:#fff7f4;color:#28252b">
            <h1>Connected</h1>
            <p>TikTok account ${next.displayName ? `<strong>${next.displayName}</strong>` : "is"} linked to Finance Reels. You can close this tab.</p>
          </body></html>`,
        );
        resolve(next);
        server.close();
      } catch (err) {
        reject(err);
        server.close();
      }
    });

    const listenPort = fixedPort ?? 0;
    server.listen(listenPort, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : listenPort;
      const redirectUri = resolveRedirectUri(port);
      const auth = new URL(AUTH_URL);
      auth.searchParams.set("client_key", clientKey);
      auth.searchParams.set("response_type", "code");
      auth.searchParams.set("scope", SCOPES);
      auth.searchParams.set("redirect_uri", redirectUri);
      auth.searchParams.set("state", state);
      auth.searchParams.set("code_challenge", challenge);
      auth.searchParams.set("code_challenge_method", "S256");
      openBrowser(auth.toString()).catch(reject);
    });

    setTimeout(() => {
      server.close();
      reject(new Error("TikTok login timed out. Run npm run tiktok -- login again."));
    }, 5 * 60 * 1000);
  });

  return tokens;
}

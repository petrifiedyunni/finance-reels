export function printTikTokSetup(): void {
  console.log(`
🎀 Finance Reels → TikTok

TikTok will not let this CLI invent an account. Create the brand account in TikTok,
then connect it here.

1. New TikTok account (do this in the TikTok app)
   • Use a fresh email or phone, not your personal login
   • Suggested handle vibe: financefordivas / divafinance
   • Bio: Finance for Divas. Bite-size options, no fake guru talk.
   • Switch the in-app account to this one before you connect

2. TikTok Developer app (desktop)
   https://developers.tiktok.com/apps/
   • Create an app, platform: Desktop
   • Terms of Service + Privacy Policy need public https URLs
     Host the pages in /legal (Google Sites is the fastest)
     Terms:   .../terms
     Privacy: .../privacy
   • Add Login Kit
   • Redirect URI: http://127.0.0.1:*/callback/
   • Add Content Posting API
   • Scopes: user.info.basic, video.upload, video.publish

3. Keys in .env
   TIKTOK_CLIENT_KEY=...
   TIKTOK_CLIENT_SECRET=...

4. Connect the new account
   npm run tiktok -- login
   Use a private/incognito window so you sign into the BRAND account, not your personal one.

5. After a reel is rendered
   npm run tiktok -- publish generated/2026-09-15-what-is-an-option
   Default is inbox/draft. Open TikTok, tap the inbox notice, paste tiktok-caption.txt, post.

   Direct post (private until TikTok audits the app):
   npm run tiktok -- publish generated/2026-09-15-what-is-an-option --direct

   Or produce + upload in one shot:
   npm run reel -- --spec examples/what-is-an-option.json --skip-ai --publish inbox
`);
}

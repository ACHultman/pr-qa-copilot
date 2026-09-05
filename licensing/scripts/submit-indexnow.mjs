const siteUrl = "https://pr-qa-copilot.vercel.app";
const key = "8cb9cde61c8ea108c7777de370501941";

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList: [siteUrl],
  }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow rejected the submission with HTTP ${response.status}.`);
}

console.log(`IndexNow accepted PR QA Copilot with HTTP ${response.status}.`);

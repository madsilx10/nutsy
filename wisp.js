const https = require("https");
const fs = require("fs");

const EMAILS_FILE = "emails.txt";
const DELAY_MS = 2000;

const FORM_ID = "1FAlpQLSc-diD3TFbZKnCdZdYyaaWdFTxwJ045czITly4PrcDtXO3bPA";
const ENTRY_ID = "entry.703357982";

function submit(email) {
  return new Promise((resolve) => {
    const body = `${ENTRY_ID}=${encodeURIComponent(email)}`;

    const options = {
      hostname: "docs.google.com",
      path: `/forms/d/e/${FORM_ID}/formResponse`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Origin: "https://usewisp.io",
        Referer: "https://usewisp.io/",
        "Sec-Ch-Ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
    };

    const req = https.request(options, (res) => {
      res.resume();
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${email}`);
        } else {
          console.log(`❌ ${email} | Status: ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on("error", (e) => {
      console.log(`🔥 ${email} | ERROR → ${e.message}`);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!fs.existsSync(EMAILS_FILE)) {
    console.log("File emails.txt tidak ditemukan!");
    process.exit(1);
  }

  const emails = fs
    .readFileSync(EMAILS_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  console.log(`Total email: ${emails.length}\n`);

  for (let i = 0; i < emails.length; i++) {
    await submit(emails[i]);
    if (i < emails.length - 1) await sleep(DELAY_MS);
  }

  console.log("\nDone semua!");
}

main();

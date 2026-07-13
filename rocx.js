const https = require("https");
const fs = require("fs");
const zlib = require("zlib");

const EMAILS_FILE = "emails.txt";
const DELAY_MS = 2000;

function submit(email) {
  return new Promise((resolve) => {
    const boundary = "----WebKitFormBoundaryVfBpAvAtS5s3tNT";
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="email"\r\n\r\n` +
      `${email}\r\n` +
      `--${boundary}--\r\n`;

    const options = {
      hostname: "formspree.io",
      path: "/f/xlgkpojg",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": Buffer.byteLength(body),
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Origin: "https://rocx.io",
        Referer: "https://rocx.io/",
        "Sec-Ch-Ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
    };

    const req = https.request(options, (res) => {
      const enc = res.headers["content-encoding"];
      let stream = res;
      if (enc === "gzip") stream = res.pipe(zlib.createGunzip());
      else if (enc === "br") stream = res.pipe(zlib.createBrotliDecompress());

      let data = "";
      stream.on("data", (c) => (data += c));
      stream.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.ok) {
            console.log(`✅ ${email}`);
          } else {
            console.log(`❌ ${email} | ${data}`);
          }
        } catch {
          console.log(`⚠️  ${email} | PARSE ERROR → ${data.slice(0, 100)}`);
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

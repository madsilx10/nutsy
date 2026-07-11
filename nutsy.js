const https = require("https");
const fs = require("fs");

// usernames.txt → satu username per baris
// wallets.txt   → satu wallet per baris (urutan harus sama)
const USERNAMES_FILE = "usernames.txt";
const WALLETS_FILE = "wallets.txt";
const COOKIE = "__test=d20dee4c8ec02ad61346b76784347357";
const DELAY_MS = 2000; // jeda antar akun (ms)

function randomStatus() {
  const suffix = Array.from({ length: 17 }, () => Math.floor(Math.random() * 10)).join("");
  return `20${suffix}`;
}

function buildPayload(username, wallet) {
  return JSON.stringify({
    x_username: username,
    comment_link: `https://x.com/${username}/status/${randomStatus()}?s=20`,
    wallet_address: wallet,
  });
}

function submit(username, wallet) {
  return new Promise((resolve) => {
    const body = buildPayload(username, wallet);

    const options = {
      hostname: "nutsy.xyz",
      path: "/api/submit.php",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Cookie: COOKIE,
        Origin: "https://nutsy.xyz",
        Referer: "https://nutsy.xyz/index.php",
        "Sec-Ch-Ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log(`✅ ${username} | ${wallet} → ID: ${json.id}`);
          } else {
            console.log(`❌ ${username} | FAILED → ${data}`);
          }
        } catch {
          console.log(`⚠️  ${username} | PARSE ERROR → ${data}`);
        }
        resolve();
      });
    });

    req.on("error", (e) => {
      console.log(`🔥 ${username} | REQUEST ERROR → ${e.message}`);
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
  if (!fs.existsSync(USERNAMES_FILE) || !fs.existsSync(WALLETS_FILE)) {
    console.log("File usernames.txt atau wallets.txt tidak ditemukan!");
    process.exit(1);
  }

  const usernames = fs.readFileSync(USERNAMES_FILE, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);
  const wallets = fs.readFileSync(WALLETS_FILE, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);

  if (usernames.length !== wallets.length) {
    console.log(`⚠️  Jumlah username (${usernames.length}) dan wallet (${wallets.length}) beda!`);
    process.exit(1);
  }

  console.log(`Total akun: ${usernames.length}\n`);

  for (let i = 0; i < usernames.length; i++) {
    await submit(usernames[i], wallets[i]);
    if (i < usernames.length - 1) await sleep(DELAY_MS);
  }

  console.log("\nDone semua!");
}

main();

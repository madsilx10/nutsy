const https = require("https");
const zlib = require("zlib");

const FORM_ID = "1FAlpQLSc-diD3TFbZKnCdZdYyaaWdFTxwJ045czITly4PrcDtXO3bPA";
const ENTRY_ID = "entry.703357982";
const email = "test@test.com";

const body = `${ENTRY_ID}=${encodeURIComponent(email)}`;

const options = {
  hostname: "docs.google.com",
  path: `/forms/d/e/${FORM_ID}/formResponse`,
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": Buffer.byteLength(body),
    Origin: "https://usewisp.io",
    Referer: "https://usewisp.io/",
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  },
};

const req = https.request(options, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Location:", res.headers["location"] || "-");
  console.log("Content-Encoding:", res.headers["content-encoding"] || "-");

  const enc = res.headers["content-encoding"];
  let stream = res;
  if (enc === "gzip") stream = res.pipe(zlib.createGunzip());
  else if (enc === "br") stream = res.pipe(zlib.createBrotliDecompress());

  let data = "";
  stream.on("data", (c) => (data += c));
  stream.on("end", () => {
    console.log("\nBody (500 char pertama):\n", data.slice(0, 500));
  });
});

req.on("error", (e) => console.log("ERROR:", e.message));
req.write(body);
req.end();

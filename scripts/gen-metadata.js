const fs = require('fs');

const NUM_TOKENS = 4;;
const TOKEN_BASE = 1;

const IMAGE_URL_BASE = "ipfs://QmdSt88Vmc4a45UNqcx6yS3yB9dpvVaF3Kj4ENNYhE9ySU/";
const SHOW_URL_BASE = "https://show.rhea.art/the-ego-and-its-0wned/";

const TOKENS = [
  [
    "Hugging Shark Friend",
    "hugging-shark-friend.png",
    "hugging-shark-friend.html"
  ],
  [
    "Shot (Estrogen)",
    "shot-estrogen.png",
    "injecting.html"
  ],
  [
    "Being Pinched",
    "being-pinched.png",
    "pinching.html",
  ],
  [
    "Kissing",
    "kissing.png",
    "kissing.html"
  ],
];

if (!fs.existsSync("./metadata/")){
  fs.mkdirSync("./metadata");
}

for(let i = 0; i < NUM_TOKENS; i++) {
  const [
    tokenName, tokenImg, tokenPage
  ] = TOKENS[i];
  const tokenNum = TOKEN_BASE + i;
  const filePath = `./metadata/${tokenNum}`;
  fs.writeFileSync(
    filePath,
    `{
"description": "The Ego, And It's 0wned: commodified subjective experience as property visualized under hypercapitalism.",
"external_url": "${SHOW_URL_BASE}${tokenPage}",
"image": "${IMAGE_URL_BASE}${tokenImg}",
"name": "${tokenName}"
}`
  );
}

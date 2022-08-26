import download from "image-downloader";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processed = fs.readdirSync("media").reduce((history, line) => {
  history[line] = 1;
  return history;
}, {});
console.log(processed);

run();

async function run() {
  const data = JSON.parse(fs.readFileSync("data.json"));
  const books = Object.values(data.books);
  const works = Object.values(data.works);
  const promises = [...books, ...works].map(downloadMedia);
  console.log("start: processed", Object.keys(processed).length);
  try {
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
  console.log("done: processed", Object.keys(processed).length);
}

async function downloadMedia({ covers, coverUrls }) {
  const promises = covers
    .map((cover, i) => {
      const url = coverUrls[i];
      const name = cover;
      if (processed[name]) return null;
      processed[name] = 1;
      return download.image({
        url,
        dest: path.join(__dirname, `media/${cover}`),
      });
    })
    .filter(Boolean);
  try {
    await Promise.all(promises);
    return true;
  } catch (e) {
    console.log(e);
  }
}

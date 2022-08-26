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
  const books = Object.values(JSON.parse(fs.readFileSync("data.json")).books);
  const promises = books.map(downloadMedia);
  console.log("start: processed", Object.keys(processed).length);
  try {
    await Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
  console.log("done: processed", Object.keys(processed).length);
}

async function downloadMedia({ key, covers }) {
  const cleanKey = key.replace("/books/", "");
  if (!covers || !covers[0] || processed[cleanKey]) {
    return true;
  }
  const coverUrl = `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`;
  const fileName = `${cleanKey}.jpg`;
  processed[cleanKey] = 1;
  try {
    await download.image({
      url: coverUrl,
      dest: path.join(__dirname, `media/${fileName}`),
    });
    return true;
  } catch (e) {
    console.log(e);
  }
}

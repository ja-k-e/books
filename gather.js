const fs = require("fs");
const queue = fs.readFileSync("queue.txt").toString();
const data = JSON.parse(fs.readFileSync("data.json").toString());
const isbns = queue
  .split("\n")
  .map((a) => a.trim())
  .filter(Boolean);

function processISBN() {
  const isbn = isbns.shift();
  try {
  } catch (e) {}
}
console.log(isbns.length);
processISBN();
console.log(isbns.length);

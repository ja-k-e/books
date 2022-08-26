import fs from "fs";
import fetch from "node-fetch";

const queue = fs.readFileSync("queue.txt").toString();
const data = JSON.parse(fs.readFileSync("data.json").toString());
const isbns = queue
  .split("\n")
  .map((a) => a.trim())
  .filter(Boolean);
const failedIsbns = [];

async function processISBN() {
  const isbn = isbns.shift();
  try {
    console.log(`Loading ISBN ${isbn}`);
    const isbnUrl = `https://openlibrary.org/isbn/${isbn}.json`;
    const response = await fetch(isbnUrl);
    const book = await response.json();
    const authors = await Promise.all(
      (book.authors || []).map(
        (author) =>
          new Promise((resolve, reject) => {
            fetch(`https://openlibrary.org${author.key}.json`)
              .then((result) => resolve(result.json()))
              .catch(reject);
          })
      )
    );
    const key = book.key.replace("/books/", "");
    book.cover = book.covers && book.covers[0] ? `${key}.jpg` : null;
    book.source = "open-library";
    authors.forEach((author) => (data.authors[author.key] = author));
    data.books[book.key] = book;
  } catch (e) {
    failedIsbns.push(isbn);
    console.error(e);
  } finally {
    if (isbns.length) {
      return processISBN();
    } else {
      fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
      fs.writeFileSync("queue.txt", [...isbns, ...failedIsbns].join("\n"));
      return data;
    }
  }
}
processISBN().then(() => {
  console.log(isbns.length, failedIsbns.length);
});

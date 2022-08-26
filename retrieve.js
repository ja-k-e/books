import fs from "fs";
import fetch from "node-fetch";

const queue = fs.readFileSync("queue.txt").toString();
const data = JSON.parse(fs.readFileSync("data.json").toString());
const isbns = queue
  .split("\n")
  .map((a) => a.trim())
  .filter(Boolean);
const failedIsbns = [];

const loadedKeys = {};

function loadData(item) {
  const { key } = item;
  return new Promise((resolve, reject) => {
    if (loadedKeys[key]) {
      resolve(new Promise((resolve) => resolve()));
    } else {
      loadedKeys[key] = 1;
      fetch(`https://openlibrary.org${key}.json`)
        .then((result) => resolve(result.json()))
        .catch(reject);
    }
  });
}

async function processISBN() {
  const isbn = isbns.shift();
  try {
    console.log(`Loading ISBN ${isbn}`);
    const isbnUrl = `https://openlibrary.org/isbn/${isbn}.json`;
    const response = await fetch(isbnUrl);
    const rawBook = await response.json();
    const rawAuthors = await Promise.all((rawBook.authors || []).map(loadData));
    const rawWorks = await Promise.all((rawBook.works || []).map(loadData));
    rawAuthors.forEach((authorRaw) => {
      if (authorRaw) {
        const author = formatAuthor(authorRaw);
        data.authors[author.id] = author;
      }
    });
    rawWorks.forEach((workRaw) => {
      if (workRaw) {
        const work = formatWork(workRaw);
        data.works[work.id] = work;
      }
    });
    const book = formatBook(rawBook);
    data.books[book.id] = book;
  } catch (e) {
    failedIsbns.push(isbn);
    console.log(`ISBN ${isbn} FAILED`);
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

function cleanId(key) {
  return key.replace(/[^\w\d]/g, "").toUpperCase();
}

function description(description) {
  if (!description) {
    return null;
  } else if (Array.isArray(description)) {
    return description.length ? description.join("\n") : null;
  } else if (typeof description === "string") {
    return description.trim() || null;
  } else if ("value" in description) {
    return description.value;
  } else {
    return null;
  }
}

function coverUrls(covers = []) {
  return covers.map((c) => `https://covers.openlibrary.org/b/id/${c}-L.jpg`);
}

function covers(covers = []) {
  return covers.map((c) => `${c}.jpg`);
}

function formatAuthor(raw) {
  const id = cleanId(raw.key);
  return {
    id,
    name: raw.name,
    source: "open-library",
    key: raw.key,
  };
}

function formatBook(raw) {
  const id = cleanId(raw.key);
  const authors = (raw.authors || []).map(({ key }) => cleanId(key));
  return {
    id,
    covers: covers(raw.covers),
    coverUrls: coverUrls(raw.covers),
    title: raw.title || null,
    subtitle: raw.subtitle || null,
    description: description(raw.description),
    by:
      raw.by_statement ||
      authors
        .map((id) => data.authors[id].name)
        .filter(Boolean)
        .join(", ") ||
      null,
    authors,
    format: raw.physical_format || null,
    date: raw.publish_date || raw.copyright_date || null,
    pages: raw.number_of_pages || null,
    isbn:
      [...(raw.isbn_13 || []), ...(raw.isbn_10 || [])].filter(Boolean)[0] ||
      null,
    work: (raw.works || []).map(({ key }) => cleanId(key))[0] || null,
    source: "open-library",
    key: raw.key,
  };
}
function formatWork(raw) {
  const id = cleanId(raw.key);
  return {
    id,
    covers: covers(raw.covers),
    coverUrls: coverUrls(raw.covers),
    title: raw.title,
    description: description(raw.description),
    subjects: raw.subjects,
    date: raw.first_publish_date || null,
    key: raw.key,
  };
}

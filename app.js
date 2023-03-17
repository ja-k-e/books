const books = document.getElementById("books");
const bookCount = books.children.length;

for (let i = bookCount; i >= 0; i--) {
  books.appendChild(books.children[(Math.random() * i) | 0]);
}

reflow();
window.addEventListener("resize", debounce(reflow));

function debounce(func) {
  let timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 300, event);
  };
}

function reflow() {
  const images = books.querySelectorAll("img");
  const w = window.innerWidth;
  const sizeMax = w < 600 ? 4 : w < 1024 ? 6 : w < 1400 ? 8 : 10;
  const sizeMin = Math.max(3, Math.floor(sizeMax * 0.8));
  const totalCount = images.length;
  let remaining = totalCount;
  let size = sizeMax;
  let sizeUnchanged = false;
  for (let i = 0; i < totalCount; i += size || 1) {
    const div = document.createElement("div");
    size =
      remaining && remaining <= sizeMax
        ? remaining
        : Math.round(Math.random() * (sizeMax - sizeMin) + sizeMin);
    // size = Math.round(Math.random() * (sizeMax - sizeMin) + sizeMin);
    books.appendChild(div);
    remaining -= size;
    if (remaining > 0 && remaining < sizeMax && !sizeUnchanged) {
      let newRemaining = remaining + size;
      size = Math.min(sizeMax, Math.ceil((remaining + size) / 2));
      sizeUnchanged = true;
      remaining = newRemaining - size;
    }
    for (let j = 0; j < size; j++) {
      const node = images[i + j];
      if (node) {
        const div2 = document.createElement("div");
        div2.style.flex = `calc(${node.width}/${node.height})`;
        div.appendChild(div2);
        div2.appendChild(node);
        if (node.complete) {
          node.classList.add("loaded");
        } else {
          node.onload = () => node.classList.add("loaded");
        }
      }
    }
  }
  books.querySelectorAll("div:empty").forEach((div) => {
    div.remove();
  });
  const rowCount = books.children.length;
  for (let i = rowCount; i >= 0; i--) {
    books.appendChild(books.children[(Math.random() * i) | 0]);
  }
}

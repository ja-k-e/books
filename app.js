const books = document.getElementById("books");
const bookCount = books.children.length;

// for (let i = bookCount; i >= 0; i--) {
//   books.appendChild(books.children[(Math.random() * i) | 0]);
// }

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
  const originalSize = w < 600 ? 3 : w < 1024 ? 5 : w < 1400 ? 7 : 9;
  const totalCount = images.length;
  let remaining = totalCount;
  let size = originalSize;
  for (let i = 0; i < totalCount; i += size) {
    const div = document.createElement("div");
    books.appendChild(div);
    remaining -= size;
    if (remaining > 0 && remaining < size && size === originalSize) {
      size = Math.ceil((remaining + size) / 2);
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
}

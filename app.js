// document.addEventListener("click", () => {
//   reflow();
// });
const books = document.getElementById("books");
for (let i = books.children.length; i >= 0; i--) {
  books.appendChild(books.children[(Math.random() * i) | 0]);
}

function reflow() {
  const w = books.clientWidth;
  const size = w < 600 ? 2 : w < 1024 ? 3 : w < 1400 ? 4 : 5;
  for (let i = 0; i < books.children.length; i += size) {
    let totalWidth = 0;
    let height = books.children[i].clientHeight;
    for (let j = 0; j < size; j++) {
      if (books.children[i + j]) {
        totalWidth += books.children[i + j].clientWidth;
      }
    }
    const factor = w / totalWidth;
    for (let j = 0; j < size; j++) {
      if (books.children[i + j]) {
        books.children[i + j].style.height = `${Math.floor(height * factor)}px`;
      }
    }
  }
}

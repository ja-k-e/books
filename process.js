const imageSize = require("image-size");
const fs = require("fs");

const json = [];

for (let i = 1; i <= 77; i++) {
  const dimensions = imageSize(
    `./images/book${i.toString().padStart(5, "0")}.jpg`
  );
  json.push([dimensions.width, dimensions.height]);
}

fs.writeFileSync("data.json", JSON.stringify(json, null, 2));

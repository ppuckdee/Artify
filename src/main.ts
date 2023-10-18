import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Nick's game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.appendChild(header);

function createStyledCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  canvas.style.border = "1px solid black";
  canvas.style.borderRadius = "10px";
  canvas.style.boxShadow = "5px 5px 10px rgba(0, 0, 0, 0.5)";

  app.appendChild(canvas);
}

createStyledCanvas();

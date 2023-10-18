import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Nick's drawing game";

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

  const context = canvas.getContext("2d");

  if (!context) {
    console.error("Canvas context is not available");
    return;
  }

  let drawing = false;

  canvas.addEventListener("mousedown", () => {
    drawing = true;
    context.beginPath();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    context.stroke();
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    drawing = false;
  });

  // Clear button
  const clearButton = document.createElement("button");
  clearButton.innerText = "Clear";
  clearButton.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  app.appendChild(clearButton);
}

createStyledCanvas();

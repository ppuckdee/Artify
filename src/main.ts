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
  let points: { x: number; y: number }[] = [];

  canvas.addEventListener("mousedown", () => {
    drawing = true;
    points = [];
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    points.push({
      x: e.clientX - canvas.offsetLeft,
      y: e.clientY - canvas.offsetTop,
    });
    canvas.dispatchEvent(new Event("drawing-changed"));
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    drawing = false;
  });

  canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "black";

    for (let i = 1; i < points.length; i++) {
      context.beginPath();
      context.moveTo(points[i - 1].x, points[i - 1].y);
      context.lineTo(points[i].x, points[i].y);
      context.stroke();
    }
  });

  const clearButton = document.createElement("button");
  clearButton.innerText = "Clear";
  clearButton.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
  });

  app.appendChild(clearButton);
}

createStyledCanvas();

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

  let isDrawing = false;
  let points: { x: number; y: number }[] = [];
  let displayList: { x: number; y: number }[][] = [];
  let redoStack: { x: number; y: number }[][] = [];

  canvas.addEventListener("mousedown", () => {
    isDrawing = true;
    points = [];
    canvas.dispatchEvent(new Event("drawing-changed"));
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    points.push({
      x: e.clientX - canvas.offsetLeft,
      y: e.clientY - canvas.offsetTop,
    });
    canvas.dispatchEvent(new Event("drawing-changed"));
  });

  canvas.addEventListener("mouseup", () => {
    if (isDrawing) {
      isDrawing = false;
      displayList.push([...points]);
      redoStack = [];
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  });

  canvas.addEventListener("mouseout", () => {
    if (isDrawing) {
      isDrawing = false;
      displayList.push([...points]);
      redoStack = [];
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  });

  canvas.addEventListener("drawing-changed", () => {
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
    displayList = [];
    redoStack = [];
    canvas.dispatchEvent(new Event("drawing-changed"));
  });

  const undoButton = document.createElement("button");
  undoButton.innerText = "Undo";
  undoButton.addEventListener("click", () => {
    if (displayList.length > 0) {
      const lastDrawing = displayList.pop()!;
      redoStack.push(lastDrawing);
      context.clearRect(0, 0, canvas.width, canvas.height);
      points = [];
      for (const drawing of displayList) {
        points = points.concat(drawing);
      }
      redrawCanvas(context, displayList);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  });

  const redoButton = document.createElement("button");
  redoButton.innerText = "Redo";
  redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
      const nextDrawing = redoStack.pop()!;
      displayList.push(nextDrawing);
      redrawCanvas(context, displayList);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  });

  app.appendChild(clearButton);
  app.appendChild(undoButton);
  app.appendChild(redoButton);
}

function redrawCanvas(
  context: CanvasRenderingContext2D,
  drawings: { x: number; y: number }[][]
) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  for (const drawing of drawings) {
    for (let i = 1; i < drawing.length; i++) {
      context.beginPath();
      context.moveTo(drawing[i - 1].x, drawing[i - 1].y);
      context.lineTo(drawing[i].x, drawing[i].y);
      context.stroke();
    }
  }
}

createStyledCanvas();

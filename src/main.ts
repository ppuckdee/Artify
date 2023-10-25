import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Nick's drawing game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.appendChild(header);

class DrawingCanvas {
  points: { x: number; y: number }[];
  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  addPoint(x: number, y: number) {
    this.points.push({ x, y });
  }
  display(context: CanvasRenderingContext2D) {
    if (this.points.length < 2) {
      return;
    }
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.stroke();
  }
}

const drawingCanvases: DrawingCanvas[] = [];

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
  let currentCanvas: DrawingCanvas | null = null;
  let redoStack: DrawingCanvas[] = [];

  const drawingChanged = new CustomEvent("drawing-changed");

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentCanvas = new DrawingCanvas(
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
    drawingCanvases.push(currentCanvas);
    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing || !currentCanvas) return;
    currentCanvas.addPoint(
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
  });

  canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const canvas of drawingCanvases) {
      canvas.display(context);
    }
  });

  const clearButton = document.createElement("button");
  clearButton.innerText = "Clear";
  clearButton.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingCanvases.length = 0;
    redoStack = [];
    canvas.dispatchEvent(drawingChanged);
  });

  const undoButton = document.createElement("button");
  undoButton.innerText = "Undo";
  undoButton.addEventListener("click", () => {
    if (drawingCanvases.length > 0) {
      const lastDrawing = drawingCanvases.pop()!;
      redoStack.push(lastDrawing);
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.dispatchEvent(drawingChanged);
    }
  });

  const redoButton = document.createElement("button");
  redoButton.innerText = "Redo";
  redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
      const nextDrawing = redoStack.pop()!;
      drawingCanvases.push(nextDrawing);
      canvas.dispatchEvent(drawingChanged);
    }
  });

  app.appendChild(clearButton);
  app.appendChild(undoButton);
  app.appendChild(redoButton);
}

createStyledCanvas();

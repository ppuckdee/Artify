import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Nick's drawing game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.appendChild(header);

class DrawingCanvas {
  points: { x: number; y: number }[];
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }

  addPoint(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length < 2) {
      return;
    }
    context.lineWidth = this.thickness;
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.stroke();
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }
}

const drawingCanvases: DrawingCanvas[] = [];

class ToolPreview {
  x: number;
  y: number;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(context: CanvasRenderingContext2D, thickness: number) {
    context.lineWidth = thickness;
    context.strokeStyle = "black";
    context.beginPath();
    context.arc(this.x, this.y, thickness / 2, 0, Math.PI * 2);
    context.stroke();
  }
}

let toolPreview: ToolPreview | null = null;

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

  let lineThickness = 2;

  const lineThicknessHistory: number[] = [];

  const drawingChanged = new CustomEvent("drawing-changed");

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentCanvas = new DrawingCanvas(
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop,
      lineThickness
    );
    drawingCanvases.push(currentCanvas);
    lineThicknessHistory.push(lineThickness);
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

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;

      if (toolPreview) {
        toolPreview.x = x;
        toolPreview.y = y;
      } else {
        toolPreview = new ToolPreview(x, y, lineThickness);
      }

      canvas.dispatchEvent(new Event("tool-moved"));
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentCanvas = new DrawingCanvas(
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop,
      lineThickness
    );
    drawingCanvases.push(currentCanvas);
    lineThicknessHistory.push(lineThickness);
    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("tool-moved", () => {
    if (!isDrawing) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const canvas of drawingCanvases) {
        canvas.display(context);
      }

      if (toolPreview) {
        toolPreview.draw(context, lineThickness);
      }
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

  const thinButton = document.createElement("button");
  thinButton.innerText = "Thin";
  thinButton.addEventListener("click", () => {
    lineThickness = 1;
  });

  const thickButton = document.createElement("button");
  thickButton.innerText = "Thick";
  thickButton.addEventListener("click", () => {
    lineThickness = 7;
  });

  app.appendChild(clearButton);
  app.appendChild(undoButton);
  app.appendChild(redoButton);
  app.appendChild(thinButton);
  app.appendChild(thickButton);
}

createStyledCanvas();

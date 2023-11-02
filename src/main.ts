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
  lineSymbol: string;
  stickers: Sticker[];

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
    this.lineSymbol = "black";
    this.stickers = [];
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
    context.strokeStyle = this.lineSymbol;
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.stroke();

    this.stickers.forEach((sticker) => sticker.display(context));
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }

  setLineSymbol(symbol: string) {
    this.lineSymbol = symbol;
  }

  addSticker(x: number, y: number, sticker: string) {
    const stickerObj = new Sticker(x, y, sticker);
    this.stickers.push(stickerObj);
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

class Sticker {
  x: number;
  y: number;
  sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "24px Arial";
    context.fillText(this.sticker, this.x, this.y);
  }
}

class StickerPreview {
  x: number;
  y: number;
  sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "24px Arial";
    context.fillText(this.sticker, this.x, this.y);
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
  let redoStack: DrawingCanvas[] = [];

  let lineThickness = 2;

  const drawingChanged = new CustomEvent("drawing-changed");

  let stickerPreview: StickerPreview | null = new StickerPreview(0, 0, "");

  const stickerButton1 = document.createElement("button");
  stickerButton1.innerText = "😀";
  stickerButton1.addEventListener("click", () => {
    if (stickerPreview) {
      stickerPreview.sticker = "😀";
      toolPreview = null;
    } else {
      stickerPreview = new StickerPreview(0, 0, "😀");
    }
    if (currentCanvas) {
      currentCanvas.setLineSymbol("😀");
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  });

  const stickerButton2 = document.createElement("button");
  stickerButton2.innerText = "😩";
  stickerButton2.addEventListener("click", () => {
    if (stickerPreview) {
      stickerPreview.sticker = "😩";
      toolPreview = null;
    } else {
      stickerPreview = new StickerPreview(0, 0, "😩");
    }
    if (currentCanvas) {
      currentCanvas.setLineSymbol("😩");
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  });

  const stickerButton3 = document.createElement("button");
  stickerButton3.innerText = "🫠";
  stickerButton3.addEventListener("click", () => {
    if (stickerPreview) {
      stickerPreview.sticker = "🫠";
    } else {
      stickerPreview = new StickerPreview(0, 0, "🫠");
    }
    if (currentCanvas) {
      currentCanvas.setLineSymbol("🫠");
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  });

  app.appendChild(stickerButton1);
  app.appendChild(stickerButton2);
  app.appendChild(stickerButton3);

  canvas.addEventListener("mousemove", (e) => {
    if (stickerPreview) {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      stickerPreview.x = x;
      stickerPreview.y = y;
      canvas.dispatchEvent(new Event("tool-moved"));
    }
  });

  let currentCanvas: DrawingCanvas | null = null;

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    currentCanvas = new DrawingCanvas(x, y, lineThickness);
    drawingCanvases.push(currentCanvas);
    currentCanvas.addPoint(x, y);
    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentCanvas) {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      currentCanvas.addPoint(x, y);
      canvas.dispatchEvent(drawingChanged);
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    currentCanvas = null;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    currentCanvas = null;
  });

  canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const canvasObj of drawingCanvases) {
      canvasObj.display(context);
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

  canvas.addEventListener("tool-moved", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const canvasObj of drawingCanvases) {
      canvasObj.display(context);
      for (const sticker of canvasObj.stickers) {
        sticker.display(context);
      }
    }

    if (toolPreview) {
      toolPreview.draw(context, lineThickness);
    }

    if (stickerPreview) {
      stickerPreview.display(context);
    }
  });

  canvas.addEventListener("click", (e) => {
    if (stickerPreview && currentCanvas) {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      currentCanvas.addSticker(x, y, stickerPreview.sticker);
      canvas.dispatchEvent(new Event("tool-moved"));
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
    if (stickerPreview) {
      stickerPreview = null;
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  });

  const thickButton = document.createElement("button");
  thickButton.innerText = "Thick";
  thickButton.addEventListener("click", () => {
    lineThickness = 7;
    if (stickerPreview) {
      stickerPreview = null;
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  });

  app.appendChild(clearButton);
  app.appendChild(undoButton);
  app.appendChild(redoButton);
  app.appendChild(thinButton);
  app.appendChild(thickButton);
}

createStyledCanvas();

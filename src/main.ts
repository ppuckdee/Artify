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

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
    this.lineSymbol = "black";
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
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }

  setLineSymbol(symbol: string) {
    this.lineSymbol = symbol;
  }
}

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

const initialStickers = ["😀", "😩", "🫠"];

const drawingCanvases: (DrawingCanvas | Sticker)[] = [];

let toolPreview: ToolPreview | null = null;
let currentTool = "drawing";
let currentEmoji = "";

function switchTool(tool: string) {
  currentTool = tool;
  if (toolPreview) toolPreview = null;
}

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
  let redoStack: (DrawingCanvas | Sticker)[] = [];

  let lineThickness = 10;

  const drawingChanged = new CustomEvent("drawing-changed");

  let stickerPreview: StickerPreview | null = new StickerPreview(0, 0, "");

  function createButton(text: string, clickHandler: () => void) {
    const button = document.createElement("button");
    button.innerText = text;
    button.addEventListener("click", clickHandler);
    return button;
  }

  function createStickerButton(sticker: string) {
    const stickerButton = createButton(sticker, () => {
      currentEmoji = sticker;
      if (stickerPreview) {
        stickerPreview.sticker = currentEmoji;
      } else {
        stickerPreview = new StickerPreview(0, 0, currentEmoji);
      }
      currentTool = "emoji";
      canvas.dispatchEvent(new Event("tool-moved"));
    });
    app.appendChild(stickerButton);
  }

  function createCustomStickerButton() {
    const customStickerButton = createButton("Custom Sticker", () => {
      const stickerText = prompt(
        "Enter text for the custom sticker:",
        "New Sticker"
      );

      if (stickerText !== null) {
        const trimmedStickerText = stickerText.trim();
        if (trimmedStickerText !== "") {
          currentEmoji = trimmedStickerText;
          if (stickerPreview) {
            stickerPreview.sticker = currentEmoji;
          } else {
            stickerPreview = new StickerPreview(0, 0, currentEmoji);
          }

          currentTool = "emoji";
          canvas.dispatchEvent(new Event("tool-moved"));
        }
      }
    });

    app.appendChild(customStickerButton);
  }

  initialStickers.forEach(createStickerButton);

  createCustomStickerButton();

  app.appendChild(
    createButton("Clear", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawingCanvases.length = 0;
      redoStack = [];
      canvas.dispatchEvent(drawingChanged);
    })
  );

  app.appendChild(
    createButton("Undo", () => {
      if (drawingCanvases.length > 0) {
        const lastDrawing = drawingCanvases.pop()!;
        redoStack.push(lastDrawing);
        canvas.dispatchEvent(drawingChanged);
      }
    })
  );

  app.appendChild(
    createButton("Redo", () => {
      if (redoStack.length > 0) {
        const nextDrawing = redoStack.pop()!;
        drawingCanvases.push(nextDrawing);
        canvas.dispatchEvent(drawingChanged);
      }
    })
  );

  app.appendChild(
    createButton("Thin", () => {
      switchTool("drawing");
      lineThickness = 2;
    })
  );

  app.appendChild(
    createButton("Thick", () => {
      switchTool("drawing");
      lineThickness = 7;
    })
  );

  app.appendChild(
    createButton("Export", () => {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1024;
      exportCanvas.height = 1024;

      const exportContext = exportCanvas.getContext("2d");

      if (!exportContext) {
        console.error("Export canvas context is not available");
        return;
      }

      exportContext.scale(4, 4);

      for (const canvasObj of drawingCanvases) {
        if (!(canvasObj instanceof ToolPreview)) {
          canvasObj.display(exportContext);
        }
      }

      const dataUrl = exportCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "drawing.png";
      a.click();
    })
  );

  canvas.addEventListener("mousemove", (e) => {
    if (stickerPreview) {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      stickerPreview.x = x;
      stickerPreview.y = y;
      canvas.dispatchEvent(new Event("tool-moved"));
    }
  });

  let currentCanvas: DrawingCanvas | Sticker | null = null;

  canvas.addEventListener("mousedown", (e) => {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    if (currentTool === "drawing") {
      isDrawing = true;
      currentCanvas = new DrawingCanvas(x, y, lineThickness);
      currentCanvas.addPoint(x, y);
    } else {
      currentCanvas = new Sticker(x, y, currentEmoji);
    }
    drawingCanvases.push(currentCanvas);
    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentCanvas instanceof DrawingCanvas) {
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
    }

    if (currentTool === "drawing") {
      if (toolPreview) {
        toolPreview.draw(context, lineThickness);
      }
    } else if (stickerPreview) {
      stickerPreview.display(context);
    }
  });
}

createStyledCanvas();

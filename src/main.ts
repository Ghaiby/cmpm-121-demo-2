import "./style.css";

const APP_NAME = "Sticker SketchPad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

interface Point {
    x: number;
    y: number;
}

interface MarkerLine {
    points: Point[];
    drag(x: number, y: number): void;
    display(ctx: CanvasRenderingContext2D): void;
    thickness: number;
}

function createMarkerLine(initialPoint: Point): MarkerLine {
    return {
        thickness: cursor.tool.thickness,
        points: [initialPoint],
        drag(x: number, y: number) {
            this.points.push({ x, y });
        },
        display(ctx: CanvasRenderingContext2D) {
            if (this.points.length > 0) {
                ctx.beginPath();
                ctx.lineWidth = this.thickness;
                ctx.moveTo(this.points[0].x, this.points[0].y);
                for (const point of this.points) {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.stroke();
            }
        },
    };
}

interface MarkerTool {
    thickness: number;
    x: number;
    y: number;
    draw(ctx: CanvasRenderingContext2D): void;
}

function createMarkerTool(thickness: number): MarkerTool {
    return {
        thickness,
        x: 0,
        y: 0,
        draw(ctx: CanvasRenderingContext2D) {
            if(!cursor.isDrawing){
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.thickness, 0, Math.PI * 2);
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        },
    };
}

const cursor = { isDrawing: false, lines: [] as MarkerLine[], tool: createMarkerTool(2) as MarkerTool,};

// Title
const title = document.createElement('h1');
title.textContent = "Sticker SketchPad";
app.appendChild(title);

// Add Canvas
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = "canvas";
app.appendChild(canvas);
const ctx = canvas.getContext("2d");

// Add mouse event listeners for drawing
canvas.addEventListener('mousedown', (event) => startDrawing(event));
canvas.addEventListener('mousemove', (event) => {
    draw(event);
    toolMoved(event);
});
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener("drawing-changed", drawingChanged);


function startDrawing(event: MouseEvent) {
    cursor.isDrawing = true;
    const newLine = createMarkerLine({ x: event.offsetX, y: event.offsetY });
    cursor.lines.push(newLine);
}

function draw(event: MouseEvent) {
    if (!cursor.isDrawing || cursor.lines.length === 0) return;

    const currentLine = cursor.lines[cursor.lines.length - 1];
    currentLine.drag(event.offsetX, event.offsetY);
    drawingChanged()
}

function stopDrawing() {
    cursor.isDrawing = false;
    drawingChanged()
}

function drawingChanged() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';

    for (const stroke of cursor.lines) {
        stroke.display(ctx);
    }
    cursor.tool.draw(ctx)
}

function toolMoved(event: MouseEvent) {
    if (!cursor.isDrawing) {
        cursor.tool.x = event.offsetX;
        cursor.tool.y = event.offsetY;
        drawingChanged()
    }
}


const buttonsContainer = document.createElement('div');
buttonsContainer.id = "buttons-container";
app.appendChild(buttonsContainer);

// Add clear button
const clearButton = document.createElement('button');
buttonsContainer.appendChild(clearButton);
clearButton.innerText = "Clear";
clearButton.addEventListener("click", () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cursor.lines.length = 0;
        }
    }
});

const redoStack: MarkerLine[] = [];

// Undo button 
const undoButton = document.createElement('button');
buttonsContainer.appendChild(undoButton);
undoButton.innerText = "Undo";
undoButton.addEventListener("click", () => {
    if (cursor.lines.length > 0) {
        const lastStroke = cursor.lines.pop();
        if (lastStroke) {
            redoStack.push(lastStroke);
            drawingChanged();
        }
    }
});

// Redo button
const redoButton = document.createElement('button');
buttonsContainer.appendChild(redoButton);
redoButton.innerText = "Redo";
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const markerLine = redoStack.pop();
        if (markerLine) {
            cursor.lines.push(markerLine);
            drawingChanged();
        }
    }
});

const thinButton = document.createElement('button');
thinButton.innerText = "Thin Marker";
thinButton.addEventListener("click", () => {
    cursor.tool.thickness = 2;
    thinButton.classList.add("selectedTool");
    thickButton.classList.remove("selectedTool");
});
buttonsContainer.appendChild(thinButton);

// Thick marker button
const thickButton = document.createElement('button');
thickButton.innerText = "Thick Marker";
thickButton.addEventListener("click", () => {
    cursor.tool.thickness = 6;
    thickButton.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");
});
buttonsContainer.appendChild(thickButton);


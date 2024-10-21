import "./style.css";

const APP_NAME = "Sticker SketchPad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

interface Point {
    x: number;
    y: number;
}

const cursor = { isDrawing: false, points: [] as Point[] };

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
canvas.addEventListener('mousedown', (event) => startDrawing(event, canvas));
canvas.addEventListener('mousemove', (event) => draw(event, canvas));
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener("drawing-changed", drawingChanged);

// Dispatch drawing changed event on canvas 
function dispatchDrawingChanged() {
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
}

function addPoint(x: number, y: number) {
    const newPoint: Point = { x, y };
    cursor.points.push(newPoint);
    dispatchDrawingChanged();
}

function startDrawing(event: MouseEvent, canvas: HTMLCanvasElement) {
    cursor.isDrawing = true;
    cursor.points = [];
    addPoint(event.offsetX, event.offsetY);
}

function draw(event: MouseEvent, canvas: HTMLCanvasElement) {
    if (!cursor.isDrawing) return;

    addPoint(event.offsetX, event.offsetY);
}

function stopDrawing() {
    cursor.isDrawing = false;
}

function drawingChanged() {
    if (!ctx) return;

    ctx.strokeStyle = 'black'; 
    ctx.lineWidth = 2; 
    ctx.lineCap = 'round';

    if (cursor.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(cursor.points[0].x, cursor.points[0].y);
        for (const point of cursor.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}

// Add clear button
const clearButton = document.createElement('button');
app.appendChild(clearButton);
clearButton.innerText = "Clear";
clearButton.addEventListener("click", () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
});
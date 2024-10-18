import "./style.css";

const APP_NAME = "Sticker SketchPad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

let isDrawing = false;
let X = 0;
let Y = 0;

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

// Add mouse event listeners for drawing
canvas.addEventListener('mousedown', (event) => startDrawing(event, canvas));
canvas.addEventListener('mousemove', (event) => draw(event, canvas));
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(event: MouseEvent, canvas: HTMLCanvasElement) {
    isDrawing = true;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.strokeStyle = 'black'; //color
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        X = event.offsetX;
        Y = event.offsetY;
    }
}

function draw(event: MouseEvent, canvas: HTMLCanvasElement) {
    if (!isDrawing) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(X, Y);
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();

        X = event.offsetX;
        Y = event.offsetY;
    }
}

function stopDrawing() {
    isDrawing = false;
}

// Add clear 
const clearButton = document.createElement('button');
app.appendChild(clearButton);
clearButton.innerText = "Clear";
clearButton.addEventListener("click", () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
});
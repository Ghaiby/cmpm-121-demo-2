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
        thickness: cursor.marker.thickness,
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
        thickness ,
        x: 0,
        y: 0,
        draw(ctx: CanvasRenderingContext2D) {
            if(!cursor.isDrawing){
                ctx.lineWidth = this.thickness;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.thickness, 0, Math.PI * 2);
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        },
    };
}

interface Sticker {
    style: string,
    x: number,
    y: number,
    drag(x: number, y: number) : void,
    display(ctx: CanvasRenderingContext2D): void;
}

function createSticker(x: number, y: number, style: string){
    return {
        style,
        x,
        y,
        drag(x: number, y: number){
            this.x = x,
            this.y = y 
        },
        display(ctx: CanvasRenderingContext2D){
            ctx.font = "30px Arial";
            ctx.fillText(this.style, this.x, this.y);
        }
    }
}

interface StickerTool {
    style: string;
    x: number;
    y: number;
    mode: "on" | "off";
    draw(ctx: CanvasRenderingContext2D): void;
}

function createStickerTool(style: string): StickerTool {
    return {
        style,
        mode: "off",
        x: 0,
        y: 0,
        draw(ctx: CanvasRenderingContext2D) {
            if(!cursor.isDrawing){
                ctx.font = "30px Arial";
                ctx.globalAlpha = 0.5;
                ctx.fillText(this.style, this.x, this.y);
                ctx.globalAlpha = 1;
            }
        },
    };
}

const cursor = { 
    isDrawing: false,
    lines: [] as MarkerLine[],
    marker: createMarkerTool(2) as MarkerTool,
    sticker: createStickerTool("") as StickerTool,
    stickerList: [] as Sticker[],
};

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
    if(cursor.sticker.mode == "on"){
        const newSticker = createSticker(  event.offsetX, event.offsetY, cursor.sticker.style);
        cursor.stickerList.push(newSticker);
    }else{
        const newLine = createMarkerLine({ x: event.offsetX, y: event.offsetY });
        cursor.lines.push(newLine);
    }
}

function draw(event: MouseEvent) {
    if (!cursor.isDrawing) return;
    if(cursor.sticker.mode == "on"){
        const currentSticker = cursor.stickerList[cursor.stickerList.length - 1];
        currentSticker.drag(event.offsetX, event.offsetY)
    }else{
        const currentLine = cursor.lines[cursor.lines.length - 1];
        currentLine.drag(event.offsetX, event.offsetY);
    }

    drawingChanged()
}

function stopDrawing() {
    cursor.isDrawing = false;
    drawingChanged()
}
function showPreview(ctx: CanvasRenderingContext2D){
    if (cursor.sticker.mode === "off"){
        cursor.marker.draw(ctx)
    }else{
        cursor.sticker.draw(ctx)
    }
}

function drawingChanged() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';

    for (const stroke of cursor.lines) {
        stroke.display(ctx);
    }

    for(const sticker of cursor.stickerList){
        sticker.display(ctx);
    }

    showPreview(ctx)
}

function toolMoved(event: MouseEvent) {
    if (!cursor.isDrawing) {
        cursor.marker.x = event.offsetX;
        cursor.marker.y = event.offsetY;
        cursor.sticker.x = event.offsetX;
        cursor.sticker.y = event.offsetY;
        drawingChanged()
    }
}

function changeSticker(style: string){
    cursor.sticker.mode = "on";
    cursor.sticker.style = style; 
}
// change thickness of marker and which button is shown as selected
// select: button that becomes selcted
// unselect: button that is unselected
function changeMarker(thickness: number, selected: HTMLButtonElement, unselected: HTMLButtonElement){
    cursor.sticker.mode = "off";
    cursor.marker.thickness = thickness;
    selected.classList.add("selectedTool");
    unselected.classList.remove("selectedTool");
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
            for (const line of cursor.lines){
                redoStack.push(line);
            }
            cursor.lines.length = 0;
            cursor.stickerList.length = 0;
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
thinButton.addEventListener("click",() => changeMarker(2, thinButton, thickButton));
buttonsContainer.appendChild(thinButton);

// Thick marker button
const thickButton = document.createElement('button');
thickButton.innerText = "Thick Marker";
thickButton.addEventListener("click",() => changeMarker(6, thickButton, thinButton));
buttonsContainer.appendChild(thickButton);

const stickersContainer = document.createElement('div');
stickersContainer.id = "stickers-container";
app.appendChild(stickersContainer);

const stickers = ["🏈","🏀","⚽"]

function getCustomSticker(): string | null {
    const text = prompt("Custom sticker text","");
    return text; 
}
function createStickerButton(image: string | null){
    if (!image){ return }
    const button = document.createElement('button');
    button.innerText = image;
    button.addEventListener("click", (event) => {
        changeSticker(image),
        toolMoved(event)
    });
    stickersContainer.appendChild(button);
}

const customButton = document.createElement('button'); 
customButton.innerText = "Custom";
customButton.addEventListener("click", (event) => {
    createStickerButton(getCustomSticker()),
    toolMoved(event)
});
stickersContainer.appendChild(customButton);

for(const image of stickers){
    createStickerButton(image);
}

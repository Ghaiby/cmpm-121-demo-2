import "./style.css";

const APP_NAME = "Sticker SketchPad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
// app.innerHTML = APP_NAME;

const title = document.createElement('h1');
title.textContent = "Sticker SketchPad";
app.appendChild(title);

const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
canvas.id = "canvas";
app.appendChild(canvas);

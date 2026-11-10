// TEACHER-OWNED: grabs the canvas and 2D drawing context used by every scene.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 640;

console.log("Canvas ready.");

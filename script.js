
let trajectoriesCanvas = [];
let animationIdCanvas = null;
let d3Svg = null; 


window.onload = () => {
    initCanvas();
    initD3();
};

function getParams() {
    const x0 = parseFloat(document.getElementById('x0').value);
    const y0 = parseFloat(document.getElementById('y0').value);
    const v0 = parseFloat(document.getElementById('v0').value);
    const a = parseFloat(document.getElementById('a').value);
    const angleDeg = parseFloat(document.getElementById('angle').value);
    const color = document.getElementById('color').value;

    const angleRad = angleDeg * Math.PI / 180;
    const v0x = v0 * Math.cos(angleRad);
    const v0y = v0 * Math.sin(angleRad);
    const ax = a * Math.cos(angleRad);
    const ay = a * Math.sin(angleRad);

    return { x0, y0, v0x, v0y, ax, ay, color };
}


function initCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    drawAxesAndGrid(ctx, canvas.width, canvas.height);
}

function drawAxesAndGrid(ctx, width, height) {
    ctx.strokeStyle = "#e0e0e0";
    ctx.setLineDash([5, 5]); 
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#666";

    for (let x = 0; x <= width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        ctx.fillText(x, x + 5, height - 5);
    }
    for (let y = 0; y <= height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        if (y !== height) ctx.fillText(height - y, 5, y - 5);
    }
    ctx.setLineDash([]); 
}

function launchCanvas() {
    const params = getParams();
    
 
    trajectoriesCanvas.push({
        params: params,
        points: [],
        x: params.x0,
        y: params.y0,
        t: 0,
        isActive: true
    });

    
    if (!animationIdCanvas) {
        animateCanvas();
    }
}

function animateCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const dt = 0.05; 
    let isAnyActive = false;

   
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxesAndGrid(ctx, canvas.width, canvas.height);
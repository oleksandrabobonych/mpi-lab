let trajectoriesCanvas = [];
let animationIdCanvas = null;

window.onload = () => { initCanvas(); };

function getParams() {
    const x0 = parseFloat(document.getElementById('x0').value);
    const y0 = parseFloat(document.getElementById('y0').value);
    const v0 = parseFloat(document.getElementById('v0').value);
    const a = parseFloat(document.getElementById('a').value);
    const angleRad = parseFloat(document.getElementById('angle').value) * Math.PI / 180;
    
    return { 
        x0, y0, color: document.getElementById('color').value,
        v0x: v0 * Math.cos(angleRad), v0y: v0 * Math.sin(angleRad),
        ax: a * Math.cos(angleRad), ay: a * Math.sin(angleRad)
    };
}

function initCanvas() {
    const canvas = document.getElementById('myCanvas');
    drawAxesAndGrid(canvas.getContext('2d'), canvas.width, canvas.height);
}

function drawAxesAndGrid(ctx, width, height) {
    ctx.strokeStyle = "#e0e0e0"; ctx.setLineDash([5, 5]); 
    ctx.fillStyle = "#666"; ctx.font = "12px Arial";
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
    trajectoriesCanvas.push({ params, points: [], x: params.x0, y: params.y0, t: 0, isActive: true });
    if (!animationIdCanvas) animateCanvas();
}

function animateCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxesAndGrid(ctx, canvas.width, canvas.height);

    let isAnyActive = false;
    trajectoriesCanvas.forEach(traj => {
        if (traj.isActive) {
            traj.t += 0.05;
            traj.x = traj.params.x0 + traj.params.v0x * traj.t + (traj.params.ax * traj.t * traj.t) / 2;
            traj.y = traj.params.y0 + traj.params.v0y * traj.t + (traj.params.ay * traj.t * traj.t) / 2;
            traj.points.push({ x: traj.x, y: traj.y });
            if (traj.x > canvas.width || traj.y > canvas.height || traj.y < 0) traj.isActive = false;
            else isAnyActive = true;
        }
        if (traj.points.length > 0) {
            ctx.beginPath(); ctx.moveTo(traj.params.x0, canvas.height - traj.params.y0);
            traj.points.forEach(p => ctx.lineTo(p.x, canvas.height - p.y));
            ctx.strokeStyle = traj.params.color; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(traj.x, canvas.height - traj.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = traj.params.color; ctx.fill(); ctx.stroke();
    });

    animationIdCanvas = isAnyActive ? requestAnimationFrame(animateCanvas) : null;
}

function clearAll() {
    if (animationIdCanvas) cancelAnimationFrame(animationIdCanvas);
    animationIdCanvas = null; trajectoriesCanvas = [];
    const canvas = document.getElementById('myCanvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
}

function launchD3() { alert("D3 ще не реалізовано!"); }
let d3Svg = null;

function initD3() {
    d3Svg = d3.select("#d3-container").append("svg").attr("width", 600).attr("height", 400);
    const xScale = d3.scaleLinear().domain([0, 600]).range([0, 600]);
    const yScale = d3.scaleLinear().domain([0, 400]).range([400, 0]);
    
    d3Svg.append("g").attr("class", "grid").attr("transform", `translate(0, 400)`).call(d3.axisBottom(xScale).ticks(12).tickSize(-400).tickFormat(""));
    d3Svg.append("g").attr("class", "grid").call(d3.axisLeft(yScale).ticks(8).tickSize(-600).tickFormat(""));
    d3Svg.selectAll(".grid line").style("stroke", "#e0e0e0").style("stroke-dasharray", "5,5");

    d3Svg.append("g").attr("transform", `translate(0, 399)`).call(d3.axisBottom(xScale).ticks(12));
    d3Svg.append("g").attr("transform", "translate(1, 0)").call(d3.axisLeft(yScale).ticks(8));
}

function launchD3() {
    const params = getParams();
    const data = [];
    let t = 0, x = params.x0, y = params.y0;

    while(x <= 600 && y >= 0 && y <= 400 && t < 20) {
        data.push({x, y});
        t += 0.05;
        x = params.x0 + params.v0x * t + (params.ax * t * t) / 2;
        y = params.y0 + params.v0y * t + (params.ay * t * t) / 2;
    }

    const xScale = d3.scaleLinear().domain([0, 600]).range([0, 600]);
    const yScale = d3.scaleLinear().domain([0, 400]).range([400, 0]);
    const trajectoryGroup = d3Svg.append("g");

    const path = trajectoryGroup.append("path")
       .datum(data).attr("fill", "none").attr("stroke", params.color)
       .attr("stroke-width", 2).attr("d", d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)));

    const circle = trajectoryGroup.append("circle")
        .attr("r", 6).attr("fill", params.color).attr("stroke", "#000")
        .attr("cx", xScale(data[0].x)).attr("cy", yScale(data[0].y));

    const len = path.node().getTotalLength();
    path.attr("stroke-dasharray", len + " " + len).attr("stroke-dashoffset", len)
        .transition().duration(data.length * 20).ease(d3.easeLinear).attr("stroke-dashoffset", 0);

    circle.transition().duration(data.length * 20).ease(d3.easeLinear)
        .attrTween("transform", () => t => {
            const p = path.node().getPointAtLength(t * len);
            return `translate(${p.x - xScale(data[0].x)}, ${p.y - yScale(data[0].y)})`;
        });
}
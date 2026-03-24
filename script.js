
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
      trajectoriesCanvas.forEach(traj => {
        if (traj.isActive) {
            traj.t += dt;
            
            traj.x = traj.params.x0 + traj.params.v0x * traj.t + (traj.params.ax * traj.t * traj.t) / 2;
            traj.y = traj.params.y0 + traj.params.v0y * traj.t + (traj.params.ay * traj.t * traj.t) / 2;
            
            traj.points.push({ x: traj.x, y: traj.y });

            
            if (traj.x > canvas.width || traj.y > canvas.height || traj.y < 0) {
                traj.isActive = false;
            } else {
                isAnyActive = true;
            }
        }

        
        if (traj.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(traj.params.x0, canvas.height - traj.params.y0);
            traj.points.forEach(p => {
                ctx.lineTo(p.x, canvas.height - p.y);
            });
            ctx.strokeStyle = traj.params.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        
        ctx.beginPath();
        ctx.arc(traj.x, canvas.height - traj.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = traj.params.color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    
    if (isAnyActive) {
        animationIdCanvas = requestAnimationFrame(animateCanvas);
    } else {
        animationIdCanvas = null; 
    }
}


function initD3() {
    const width = 600;
    const height = 400;

    d3Svg = d3.select("#d3-container")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

   
    const xScale = d3.scaleLinear().domain([0, width]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, height]).range([height, 0]);

    
    const xAxis = d3.axisBottom(xScale).ticks(12);
    const yAxis = d3.axisLeft(yScale).ticks(8);

    
    d3Svg.append("g")
       .attr("class", "grid")
       .attr("transform", `translate(0, ${height})`)
       .call(xAxis.tickSize(-height).tickFormat(""));
       
    d3Svg.append("g")
       .attr("class", "grid")
       .call(yAxis.tickSize(-width).tickFormat(""));

    
    d3Svg.selectAll(".grid line").style("stroke", "#e0e0e0").style("stroke-dasharray", "5,5");

    
    d3Svg.append("g").attr("transform", `translate(0, ${height - 1})`).call(xAxis);
    d3Svg.append("g").attr("transform", "translate(1, 0)").call(yAxis);
}

function launchD3() {
    const params = getParams();
    const width = 600;
    const height = 400;
    
    
    const data = [];
    let t = 0;
    let dt = 0.05;
    let x = params.x0;
    let y = params.y0;

    while(x <= width && y >= 0 && y <= height && t < 20) {
        data.push({x: x, y: y});
        t += dt;
        x = params.x0 + params.v0x * t + (params.ax * t * t) / 2;
        y = params.y0 + params.v0y * t + (params.ay * t * t) / 2;
    }

    const xScale = d3.scaleLinear().domain([0, width]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, height]).range([height, 0]);

    const line = d3.line()
                   .x(d => xScale(d.x))
                   .y(d => yScale(d.y));

    
    const trajectoryGroup = d3Svg.append("g");

    
    const path = trajectoryGroup.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", params.color)
       .attr("stroke-width", 2)
       .attr("d", line);

    
    const circle = trajectoryGroup.append("circle")
        .attr("r", 6)
        .attr("fill", params.color)
        .attr("stroke", "#000")
        .attr("cx", xScale(data[0].x))
        .attr("cy", yScale(data[0].y));

    
    const totalLength = path.node().getTotalLength();
    
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(data.length * 20) 
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    
    circle.transition()
        .duration(data.length * 20)
        .ease(d3.easeLinear)
        .attrTween("transform", function() {
            return function(t) {
                const p = path.node().getPointAtLength(t * totalLength);
            
                return `translate(${p.x - xScale(data[0].x)}, ${p.y - yScale(data[0].y)})`;
            };
        });
}

function clearAll() {
    
    if (animationIdCanvas) cancelAnimationFrame(animationIdCanvas);
    animationIdCanvas = null;
    trajectoriesCanvas = [];
    
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxesAndGrid(ctx, canvas.width, canvas.height);

    d3.select("#d3-container").selectAll("*").remove();
    initD3();
}
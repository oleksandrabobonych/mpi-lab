const canvas = document.getElementById('trajectoryLayer');
const ctx = canvas.getContext('2d');
const svg = d3.select("#axesLayer");
const g = 9.81;

function startSimulation() {
    // 1. Отримання даних
    const v0 = parseFloat(document.getElementById('v0').value);
    const angleDeg = parseFloat(document.getElementById('angle').value);
    const x0 = parseFloat(document.getElementById('x0').value);
    const y0 = parseFloat(document.getElementById('y0').value);
    const color = document.getElementById('color').value;

    const angleRad = angleDeg * Math.PI / 180;
    const vx = v0 * Math.cos(angleRad);
    const vy0 = v0 * Math.sin(angleRad);

    // 2. Розрахунок результатів
    const t_flight = (vy0 + Math.sqrt(vy0**2 + 2 * g * y0)) / g;
    const L = vx * t_flight;
    const H = y0 + (vy0**2) / (2 * g);

    document.getElementById('resL').innerText = L.toFixed(2);
    document.getElementById('resH').innerText = H.toFixed(2);
    document.getElementById('resT').innerText = t_flight.toFixed(2);

    // 3. Налаштування розмірів та D3 Scales
    const width = canvas.parentElement.clientWidth - 120;
    const height = canvas.parentElement.clientHeight - 120;
    canvas.width = width;
    canvas.height = height;

    // Створюємо розумні масштаби: вхід (метри) -> вихід (пікселі)
    const scaleX = d3.scaleLinear().domain([0, L * 1.1]).range([0, width]);
    const scaleY = d3.scaleLinear().domain([0, H * 1.1]).range([height, 0]);

    // 4. Малюємо осі через D3
    svg.selectAll("*").remove();
    const margin = 60;

    svg.append("g")
        .attr("transform", `translate(${margin}, ${height + margin})`)
        .call(d3.axisBottom(scaleX).tickSize(-height));

    svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)
        .call(d3.axisLeft(scaleY).tickSize(-width));

    // 5. Анімація польоту
    let t = 0;
    const dt = 0.03;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    function frame() {
        let x = x0 + vx * t;
        let y = y0 + vy0 * t - 0.5 * g * t**2;

        let px = scaleX(x);
        let py = scaleY(y);

        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        
        ctx.stroke();

        if (y >= 0 && px <= width) {
            t += dt;
            requestAnimationFrame(frame);
        }
    }
    frame();
}

function resetProject() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    svg.selectAll("*").remove();
    document.getElementById('resL').innerText = "0";
    document.getElementById('resH').innerText = "0";
    document.getElementById('resT').innerText = "0";
}

// Ініціалізація при завантаженні
window.onload = () => {
    canvas.width = canvas.parentElement.clientWidth - 120;
    canvas.height = canvas.parentElement.clientHeight - 120;
};
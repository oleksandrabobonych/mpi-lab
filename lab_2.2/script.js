const canvas = document.getElementById('trajectoryLayer');
const ctx = canvas.getContext('2d');
const svg = d3.select("#axesLayer");
const g = 9.81;


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
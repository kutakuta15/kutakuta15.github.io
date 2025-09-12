const content = document.getElementById("content");
const canvas = document.getElementById("game-canvas");
const aspect = canvas.width / canvas.height;

window.addEventListener("resize", () => {
    const availableWidth = content.clientWidth;
    const displayWidth = availableWidth;
    const displayHeight = displayWidth / aspect;
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
});
window.dispatchEvent(new Event("resize"));
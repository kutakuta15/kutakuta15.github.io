(() => {
    let startTime = null;
    let updInterval = null;
    let timer = document.getElementById("timer");

    document.addEventListener("__unity_trigger_gamestart_event__", e => {
        startTime = Date.now();
        updInterval = setInterval(updateTimer, 200);
    });

    document.addEventListener("__unity_trigger_gameclear_event__", e => {
        clearInterval(updInterval);
    });

    function updateTimer() {
        let elapsedTime = Date.now() - startTime;
        let seconds = Math.floor(elapsedTime / 1000 % 60);
        let minutes = Math.floor(elapsedTime / 1000 / 60 % 60);
        let hours = Math.floor(elapsedTime / 1000 / 60 / 60 % 24);
        let days = Math.floor(elapsedTime / 1000 / 60 / 60 / 24 % 365);
        let years = Math.floor(elapsedTime / 1000 / 60 / 60 / 24 / 365)

        const parts = [[years, 'y'], [days, 'd'], [hours, 'h'], [minutes, 'm'], [seconds, 's']];
        let i = parts.findIndex(([v]) => v > 0);
        let text = parts.slice(i).map(([v, l]) => `${v + l}`).join(' ');

        timer.textContent = text;
    }
})();
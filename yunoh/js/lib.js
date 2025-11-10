// 読み込み順番調整
async function loadHTML(selector, url) {
    window.addEventListener('load', () => {
        load(selector, url)
    });
}

// Scriptがそのままだと使えないので、中で作り直してくれる関数
async function load(selector, url) {
    const container = document.querySelector(selector);
    const html = await fetch(url).then(res => res.text());

    const parse = document.createElement('div');
    parse.innerHTML = html;

    const scripts = parse.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    container.insertAdjacentHTML('beforeend', parse.innerHTML);

    scripts.forEach(script => {
        const createScript = document.createElement('script');
        if (script.src) {
            createScript.src = script.src;
            createScript.async = false;
        } else {
            createScript.textContent = script.textContent;
        }

        container.appendChild(createScript);
    });
}

function rand(min, max) { return Math.random() * (max - min) + min; }
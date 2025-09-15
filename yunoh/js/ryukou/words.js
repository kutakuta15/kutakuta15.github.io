(() => {
    const wordsList = {
        d1: "あいうえお",
        d2: "かきくけこ",
        d3: "さしすせそ",
        d4: "たちつてと",
        d5: "なにぬねの"
    }

    for (let name in wordsList) {
        let elements = document.getElementsByName(name);
        for (let element of elements) {
            element.innerHTML = wordsList[name];
            element.setAttribute('class', 'word');
            element.setAttribute('for', 'popup-flag');
        }
    }
})();
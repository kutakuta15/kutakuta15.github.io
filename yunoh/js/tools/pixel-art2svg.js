document.getElementById('imageInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const width = img.width;
        const height = img.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height).data;

        let svg = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

        for (let y = 0; y < height; y++) {
            let x = 0;
            while (x < width) {
                const i = (y * width + x) * 4;
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];

                const color = `rgb(${r},${g},${b})`;
                let runLength = 1;

                // 連続する同じ色のピクセルを検出
                while (
                    x + runLength < width
                ) {
                    const j = (y * width + x + runLength) * 4;
                    const rr = imageData[j];
                    const gg = imageData[j + 1];
                    const bb = imageData[j + 2];
                    const nextColor = `rgb(${rr},${gg},${bb})`;
                    if (nextColor !== color) break;
                    runLength++;
                }

                svg += `<rect x="${x}" y="${y}" width="${runLength}" height="1" fill="${color}"/>`;
                x += runLength;
            }
        }

        svg += `</svg>`;

        document.getElementById('svgDisplay').innerHTML = svg;
        document.getElementById('svgOutput').value = svg;

        let fileName = file.name;
        fileName = fileName.substr(0, fileName.lastIndexOf("."));
        let DLlink = document.createElement('a');
        DLlink.href = window.URL.createObjectURL(new Blob([svg]));
        DLlink.download = `${fileName}.svg`;
        DLlink.click();
    };

    img.src = URL.createObjectURL(file);
});
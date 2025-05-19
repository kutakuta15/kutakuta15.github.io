const gridSize = 16;
const canvasSize = 1024;
const cellSize = canvasSize / gridSize;

const toHex2 = n => n.toString(16).padStart(2, '0').toUpperCase();

async function createFontFace(name, data) {
    const font = new FontFace(name, data);
    await font.load();
    document.fonts.add(font);
}

// 文字が半角かどうかを判定する関数
function isHalfWidth(char) {
    return char.match(/[\x20-\x7E]/);  // 半角文字はASCII範囲内
}

// 簡易ZIPバイナリエンコーダ
function createSimpleZip(files) {
    const encoder = new TextEncoder();
    const fileEntries = [];
    const fileData = [];
    let offset = 0;

    function crc32(buf) {
        let table = crc32.table || (crc32.table = Array.from({ length: 256 }, (_, n) => {
            let c = n;  // ここで c を宣言
            for (let k = 0; k < 8; k++) {
                c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
            }
            return c >>> 0;
        }));

        let crc = 0xFFFFFFFF;
        for (let i = 0; i < buf.length; i++) {
            crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function toLE(n, bytes) {
        const out = [];
        for (let i = 0; i < bytes; i++) out.push(n >> (i * 8) & 0xFF);
        return out;
    }

    for (const file of files) {
        const { name, data } = file;
        const nameBytes = encoder.encode(name);
        const crc = crc32(data);
        const localHeader = [
            0x50, 0x4b, 0x03, 0x04,  // Local file header signature
            0x14, 0x00,              // Version needed to extract (2.0)
            0x00, 0x00,              // General purpose bit flag
            0x00, 0x00,              // Compression method: no compression
            0x00, 0x00,              // Last mod time
            0x00, 0x00,              // Last mod date
            ...toLE(crc, 4),         // CRC-32
            ...toLE(data.length, 4), // Compressed size
            ...toLE(data.length, 4), // Uncompressed size
            ...toLE(nameBytes.length, 2), // File name length
            0x00, 0x00               // Extra field length
        ];

        fileData.push(new Uint8Array(localHeader));
        fileData.push(nameBytes);
        fileData.push(new Uint8Array(data));

        fileEntries.push({
            nameBytes,
            offset,
            size: data.length,
            crc
        });

        offset += localHeader.length + nameBytes.length + data.length;
    }

    const centralDir = [];
    let centralDirSize = 0;

    for (const file of fileEntries) {
        const { nameBytes, offset: relOffset, size, crc } = file;
        const header = [
            0x50, 0x4b, 0x01, 0x02,  // Central directory file header
            0x14, 0x00,              // Version made by
            0x14, 0x00,              // Version needed to extract
            0x00, 0x00,              // General purpose bit flag
            0x00, 0x00,              // Compression method
            0x00, 0x00,              // Last mod time
            0x00, 0x00,              // Last mod date
            ...toLE(crc, 4),         // CRC-32
            ...toLE(size, 4),        // Compressed size
            ...toLE(size, 4),        // Uncompressed size
            ...toLE(nameBytes.length, 2), // File name length
            0x00, 0x00,              // Extra field length
            0x00, 0x00,              // File comment length
            0x00, 0x00,              // Disk number start
            0x00, 0x00,              // Internal file attributes
            0x00, 0x00, 0x00, 0x00,  // External file attributes
            ...toLE(relOffset, 4)    // Relative offset of local header
        ];
        centralDir.push(new Uint8Array(header));
        centralDir.push(nameBytes);
        centralDirSize += header.length + nameBytes.length;
    }

    const end = [
        0x50, 0x4b, 0x05, 0x06,      // End of central directory signature
        0x00, 0x00, 0x00, 0x00,      // Number of this disk / central dir start
        ...toLE(fileEntries.length, 2),
        ...toLE(fileEntries.length, 2),
        ...toLE(centralDirSize, 4),
        ...toLE(offset, 4),
        0x00, 0x00                   // Comment length
    ];

    return new Blob([...fileData, ...centralDir, new Uint8Array(end)], { type: 'application/zip' });
}


document.getElementById('generate').onclick = async () => {
    const files = document.getElementById('fontFile').files;
    const useFonts = [];

    for (const file of files) {
        const buffer = await file.arrayBuffer();
        const name = file.name.replace(/\W/g, "_");
        await createFontFace(name, buffer);
        useFonts.push(name);
    }

    const fontCSS = [...useFonts, 'consola_ttf', 'sans-serif'].join(', ');
    const progress = document.getElementById('progress');
    const status = document.getElementById('status');
    progress.value = 0;
    status.textContent = '開始中...';

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.font = `${cellSize * 0.8}px ${fontCSS}`;
    ctx.fillStyle = "#FFF";

    const pngFiles = [];

    for (let high = 0; high <= 0xFF; high++) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        ctx.textBaseline = "middle"; // 垂直方向の中央揃え

        for (let low = 0; low <= 0xFF; low++) {
            const codePoint = (high << 8) | low;
            const char = String.fromCharCode(codePoint);

            // 半角文字か全角文字かを判定して、textAlignを設定
            if (isHalfWidth(char)) {
                ctx.textAlign = "left";   // 半角文字は左揃え
            } else {
                ctx.textAlign = "center"; // 全角文字は中央揃え
            }

            const x = (low % gridSize) * cellSize + (isHalfWidth(char) ? 0 : cellSize / 2);  // 半角文字の場合は左揃え
            const y = Math.floor(low / gridSize) * cellSize + (cellSize / 2);  // セルの中央

            ctx.fillText(char, x, y);
        }

        const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
        const arrayBuffer = await blob.arrayBuffer();
        pngFiles.push({
            name: `Glyph_${toHex2(high)}.png`,
            data: new Uint8Array(arrayBuffer)
        });

        progress.value = high + 1;
        status.textContent = `作成中: Glyph_${toHex2(high)}.png (${high + 1}/256)`;

        await new Promise(r => setTimeout(r, 0));
    }

    status.textContent = 'ZIP作成中...';
    const zipBlob = createSimpleZip(pngFiles);
    const url = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "glyphs.zip";
    a.click();

    status.textContent = '完了！';
};
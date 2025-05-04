const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const gitUrl = "https://kutakuta15.github.io/yunoh/";
const localUrl = "http://127.0.0.1:8080/yunoh/";

function replaceUrlInFolder(dir, mode) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            replaceUrlInFolder(fullPath, mode);
        } else if (entry.name.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            content = mode ? content.replace(new RegExp(gitUrl, 'g'), localUrl) : content.replace(new RegExp(localUrl, 'g'), gitUrl);
            fs.writeFileSync(fullPath, content, 'utf-8');
            console.log(`🔄 Replace URL in: ${fullPath}`);
        }
    });
}

replaceUrlInFolder(__dirname, true);
const server = exec('npx http-server');
server.stdout.on('data', data => process.stdout.write(data));
server.stderr.on('data', data => process.stderr.write(data));
process.on('SIGINT', () => {
    console.log('http-server stopped');
    replaceUrlInFolder(__dirname, false);
    process.exit(0);
});
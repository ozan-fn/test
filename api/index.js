const { createServer, request } = require('http');
const { spawn } = require('child_process');
const { chmodSync } = require('fs'); // Panggil modul File System
const path = require('path');

// Ini akan selalu menunjuk ke file frankenphp di folder utama
const binPath = path.join(process.cwd(), 'frankenphp');
    
// Beri izin eksekusi (setara dengan chmod +x atau chmod 755)
chmodSync(binPath, '755');

// 1. Jalankan FrankenPHP (tambahkan --root jika beda folder)
spawn(binPath, ['php-server', '--listen', ':11365', '--root', './phpMyAdmin-5.2.3-english'], { stdio: 'inherit' });

// 2. Buat Reverse Proxy Super Singkat
createServer((req, res) => {
    req.pipe(request({
        hostname: '127.0.0.1',
        port: 11365,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    })).on('error', () => res.writeHead(502).end('FrankenPHP mati.'));
}).listen(3000, () => console.log('Web siap dibuka di http://localhost:3000\n'));
import http from 'http';
import fs from 'fs';
import path from 'path';
import { request } from 'http';

const server = http.createServer((req, res) => {
  // 处理API代理
  if (req.url.startsWith('/api/')) {
    // 代理到后端服务器
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('代理请求失败:', error);
      res.writeHead(500);
      res.end('代理服务器错误');
    });

    req.pipe(proxyReq);
    return;
  }

  // 解析请求路径
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // 确定文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // MIME类型映射
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.vue': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  // 设置Content-Type
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        // 文件未找到
        fs.readFile('./404.html', (error, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
        res.end();
      }
    } else {
      // 文件读取成功
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001; // 前端服务器运行在3001端口
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`API proxy enabled for /api/ routes to http://localhost:3000`);
});

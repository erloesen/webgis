const http = require('node:http');
const hostname = '127.0.0.1';
const port = 1680;
const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.end('<h2>HelloWorld!</h2>\n<h3>测试成功！</h3>\n')
});
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
});


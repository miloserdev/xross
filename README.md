# xross

<img src="https://user-images.githubusercontent.com/37951044/213450433-c6e17053-5fd9-40e6-8cbc-c7baf09c8ab1.gif"/>
<h3 align="left">A simple NodeJS HTTP/HTTPS web router</h3>

```js
const http = require("http");
const Xross = require("xross");
const app = Xross({ body_parser: true, debug: true });

app.route("/*", { method: "ANY" }, (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	res.writeHead(200);
	res.end( JSON.stringify({ "response": "working" }) );
	next();
});

const server = http.createServer(app);
server.listen(port, host, () => {
	console.log(`Server is running`);
});
```

## Install
```console
npm install xross
```

## Features
 * Scalable 🌐
 * Lightweight 🪶
 * High performance 🚀
 * Fast URL match 🏷️
 * Full RexExp support 📜

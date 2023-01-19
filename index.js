module.exports = function(options) {
    this._routes = [];
    this._log = () => {};

    this.route = (path, options, cb) => {
        let _path = path;
        _path = _path.replaceAll("/", "\/");
        _path = _path.replace(/\((.*?)\)/g, "(?<$1>.*)");
        _path = _path.replaceAll("*", `(.*)`);
        _path = new RegExp(_path);
        this._routes.push({
            path: _path,
            options,
            cb
        });
    }

    this.body_parser = async (req, res, next) => {
        if (req.method == "POST") {
            try {

                let no_data = true;
                let body = "";

                setTimeout(() => {
                    if (no_data) {
                        req.connection.destroy();
                        //res.setHeader('Content-Type', 'application/json');
                        //res.writeHead(200);
                        //res.end( JSON.stringify({ "connection": "timeout" }) );
                        this._log("TIMEOUT!");
                        return;
                    }
                }, 100);

                req.on('data', async (data) => {
                    try {
                        no_data = false;
                        body += data;
                        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                        if (body.length > 1e6) {
                            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                            req.connection.destroy();
                        }

                        req.on('end', async () => {
                            try {
                                req.body = body;
                                next();
                                //var obj = JSON.parse(body);

                            } catch (e) {
                                this._log("at req.on(end) ", e);
                            }
                        });

                    } catch (e) {
                        this._log("at req.on(data) ", e)
                    }
                });

                //next();
            } catch (e) {
                this._log("at body_parser ", e);
            }
        }
    }

    this.listen = async (req, res) => {
	
	console.log("req")

        let route = this._routes.filter(route => {
            //reg = new RegExp(route.path);
            if (route.options.method == "ANY" ? true :
                route.options.method == req.method) {
                let match = req.url.match(route.path);
                if (match) {
                    this._log("checking", match);
                    if (match[0] == match.input) {
                        req.groups = match.groups;
                        return route;
                    }
                }
            }
        });

        for (let i = 0; i < route.length; i++) {
            let nf = route[i + 1];
            route[i].next = nf ?
                () => {
                    nf.cb(req, res, nf.next);
                } :
                () => {
                    this._log("nothing is next")
                };
        }

        this._log(route);

        if (route.length > 0) route[0].cb(req, res, route[0].next);
        this._log(`${req.socket.remoteAddress}:${req.socket.remotePort} -> ${req.method} '${req.url}'`);
    }
    
    //console.log(this.request_listener,"\n", this);


    if (options) {
        if (options.body_parser)
            this.route("*", {
                method: "POST"
            }, this.body_parser);

        this._log = options.debug ? console.log : () => {};
    }
    
    this.listen.route = this.route;
    this.listen.body_parser = this.body_parser;
    
    //this.request_listener.__proto__ = this;
    //Object.setPrototypeOf(this.request_listener, this);
    
    return this.listen;

};
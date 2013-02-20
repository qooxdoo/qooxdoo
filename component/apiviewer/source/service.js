var http = require('http'),
    sys = require('util'),
    url = require('url'),
    fs = require('fs');

http.createServer(function (req, res) {

  if (req.method === "GET") {
    // get the params
    var params = url.parse(req.url, true).query;

    if (params && params.classname && params.callback) {
      var uri = 'script/' + params.classname + '.json';

       // load the file
      fs.readFile(uri, function (err, data) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(params.callback + '({"error":"File not found."});');
        }
        var jsonp = params.callback + '(' + data + ')';
        // return file
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(jsonp);
      });
    } else {
      // return error
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end('Please add callback and classname as parameter.');
    }
  }

}).listen(8124, "127.0.0.1");

console.log('Server running at http://127.0.0.1:8124/');
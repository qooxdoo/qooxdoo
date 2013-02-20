var http = require('http');
var url = require('url');
var fs = require("fs");

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/javascript'});
  var parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname == "/save") {

    var now = new Date();
    parsedUrl.query.date = now.getTime();
    var filename = "perf-data-" + now.toISOString().substr(0, 10) + ".json";

    updateJson(filename, parsedUrl.query);
  }

  res.end("");
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');


function updateJson(filename, row) {
  if (fs.existsSync(filename)) {
    var data = JSON.parse(fs.readFileSync(filename, "utf8"));
  } else {
    var data = [];
  }
  data.push(row);
  fs.writeFileSync(filename, JSON.stringify(data), "utf8");
  console.log("writing JSON file: " + filename);
}
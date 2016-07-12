/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

var http = require('http');
var url = require('url');
var fs = require("fs");

var port = process.argv[2] || 8800;
var hostname = process.argv[3] || undefined;

http.createServer(function (req, res) {
  var parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname == "/save") {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    var now = new Date();
    parsedUrl.query.date = now.getTime();
    var filename = "data/perf-data-" + now.toISOString().substr(0, 10) + ".json";

    updateJson(filename, parsedUrl.query);
  }
  else if (parsedUrl.pathname == "/graphs") {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    var files = fs.readdirSync("./graphs");
    files = files.filter(function(file) {
      return !!file.match(/\.png$/);
    });
    res.write('callback(' + JSON.stringify(files) + ');');
  }

  res.end("");
}).listen(port, hostname);
console.log('Server listening on port', port);


function updateJson(filename, row) {
  var data;
  if (fs.existsSync(filename)) {
    data = JSON.parse(fs.readFileSync(filename, "utf8"));
  } else {
    data = [];
  }
  data.push(row);
  fs.writeFileSync(filename, JSON.stringify(data), "utf8");
  console.log("writing JSON file: " + filename);
}

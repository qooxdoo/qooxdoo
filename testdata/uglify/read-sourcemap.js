require("../../lib/qxcompiler");
const fs = qxcompiler.utils.Promisify.fs;
const sourceMap = require("source-map");

const DIR = "../../../demoapp/build-output/abc/demoapp/";

var map;
fs.readFileAsync(DIR + "part-0.js.map", "utf8")
  .then((data) => {
    map = new sourceMap.SourceMapConsumer(data);
    map.eachMapping(map => {
      if (map.source.endsWith("demoapp/skeleton/Application.js")) {
        console.log(JSON.stringify(map));
      }
    });
  });
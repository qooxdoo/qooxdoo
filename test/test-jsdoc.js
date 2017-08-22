var test = require('tape');
var fs = require("fs");
var async = require("async");
const {promisify, promisifyThis} = require("../lib/util");
const readFile = promisify(fs.readFile);
require("../lib/qxcompiler");

test('Checks jsdoc @param parser', (assert) => {

  var parser = new qxcompiler.jsdoc.ParamParser();
  var pdoc = { name: "@param", body: "value {Boolean}, the new value of the widget" };
  parser.parseCommand(pdoc, "abc.def.Ghi", null);
  delete pdoc.name;
  delete pdoc.body;
  assert.deepEqual(pdoc, {
    "paramName": "value",
    "type": "Boolean",
    "description": ", the new value of the widget"
  });
  
  var pdoc = { name: "@param", body: "cellInfo {Map}\nInformation about the cell being renderered, including:\n<ul>\n<li>state</li>\n<li>rowDiv</li>\n<li>stylesheet</li>\n<li>element</li>\n<li>dataIndex</li>\n<li>cellData</li>\n<li>height</li>\n</ul>" };
  parser.parseCommand(pdoc, "abc.def.Ghi", null);
  delete pdoc.name;
  delete pdoc.body;
  assert.deepEqual(pdoc, {
    "paramName": "cellInfo",
    "type": "Map",
    "description": "\nInformation about the cell being renderered, including:\n<ul>\n<li>state</li>\n<li>rowDiv</li>\n<li>stylesheet</li>\n<li>element</li>\n<li>dataIndex</li>\n<li>cellData</li>\n<li>height</li>\n</ul>"
  });
  
  assert.end();
});


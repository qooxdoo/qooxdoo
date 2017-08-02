var fs = require("fs");

var data = fs.readFileSync("source-output/db.json");
data = JSON.parse(data);
for (var name in data.classInfo) {
  var ci = data.classInfo[name];
  var match = false;
  for (var depName in ci.dependsOn) {
    var di = ci.dependsOn[depName];
    if (depName == "qx.Interface" || depName == "qx.Class" || depName == "qx.Mixin" || depName == "qx.Theme" || 
        depName == "qx.Bootstrap" || depName == "qx.core.Environment" || depName == "qx.event.GlobalError")
      continue;
    if (di.load && di.usage === "dynamic") {
      if (!match) {
        console.log(name);
        match = true;
      }
      console.log("    " + depName);
    }
  }
}
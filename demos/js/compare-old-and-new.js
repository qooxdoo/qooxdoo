#!/usr/bin/node
var fs = require("fs");

function main(cb) {
  fs.readFile("../../testdata/qxt/compiled/source/db.json", {encoding: "utf8"}, function (err, newData) {
    if (err)
      return cb(err);
    newData = JSON.parse(newData);
    fs.readFile("../../qxcompiler-old/testdata/db.json", {encoding: "utf8"}, function (err, oldData) {
      if (err)
        return cb(err);
      oldData = JSON.parse(oldData);

      for (var className in newData.classInfo) {
        var newInfo = newData.classInfo[className];
        var oldInfo = oldData.classInfo[className];
        if (!oldInfo) {
          console.log("New class: " + className);
          continue;
        }
        for (var depName in newInfo.dependsOn) {
          if (depName == className)
            continue;
          var newDep = newInfo.dependsOn[depName];
          var oldDep = oldInfo.dependsOn ? oldInfo.dependsOn[depName] : null;
          if (!oldDep) {
            console.log(className + " has new dependency on " + depName);
            continue;
          }
          for (var name in newDep)
            if (newDep[name] !== oldDep[name]) {
              if (!(name == "defer" && newDep.defer === "load" && oldDep.defer === "runtime"))
                console.log(className + " >> " + depName + ": " + name + ": was " + oldDep[name] + " now " + newDep[name]);
            }
          for (var name in oldDep)
            if (newDep[name] === undefined) {
              if (oldDep[name] !== false)
                console.log(className + " >> " + depName + ": " + name + ": was " + oldDep[name] + " (now missing)");
            }
        }
      }
    });
  });
}

main(function(err) {
  if (err)
    console.log("Error: " + err);
  else
    console.log("Done");
});

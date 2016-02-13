(function() {

  var tree = [];
  var classNames = [ "qx.html.Image", "qx.html.Element" ];
  var classIndexes = [ -1, -1 ];
  var scanned = {};
  var stack = [];
  
  function isComplete() {
    for (var i = 0; i < classIndexes.length; i++)
      if (classIndexes[i] == -1)
        return false;
    return true;
  }
  
  function scan(name) {
    if (scanned[name])
      return;
    var def = db.classInfo[name];
    if (!def || !def.dependsOn)
      return;
    scanned[name] = true;
    
    var str = "";
    for (var i = 0; i < stack.length; i++)
      str += " ";
    console.log(str + name);
    stack.push(name);
    
    var pos = classNames.indexOf(name);
    if (pos > -1) {
      classIndexes[pos] = stack.length;
      if (isComplete()) {
        console.log(JSON.stringify(stack, null, 2));
      }
    }
    for (var depName in def.dependsOn) {
      if (def.dependsOn[depName].load === true)
        scan(depName);
    }
    stack.pop();
  }
  
  scan("skeleton.Application");
  
})();



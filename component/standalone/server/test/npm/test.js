if (typeof environment !== "undefined") {
  // for Rhino
  console = {
    log : print
  }
}
console.log("Testing on", qx.core.Environment.get("runtime.name"));
console.log(qx.Class != undefined ? "ok" : "fail");
console.log(qx.Interface != undefined ? "ok" : "fail");
console.log(qx.Mixin != undefined ? "ok" : "fail");
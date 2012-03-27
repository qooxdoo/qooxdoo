// fake class
qx.Bootstrap.define("q", {});

(function() {
  q = function(selector, context) {
    var arr = qx.bom.Selector.query(selector, context);
    var col = qx.lang.Array.cast(arr, qx.Collection);

    return col;
  }

  q.attach = function(module) {
    for (var name in module) {
      if (qx.core.Environment.get("qx.debug")) {
        if (qx.Collection.prototype[name] != undefined) {
          throw new Error("Method '" + name * "' already available.");
        }
      }
      qx.Collection.prototype[name] = module[name];
    };
  }

  q.attachStatic = function(module) {
    for (var name in module) {
      if (qx.core.Environment.get("qx.debug")) {
        if (qx.Collection.prototype[name] != undefined) {
          throw new Error("Method '" + name * "' already available as static method.");
        }
      }
      q[name] = module[name];
    }
  }
})();
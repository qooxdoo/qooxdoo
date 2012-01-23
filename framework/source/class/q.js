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
      qx.Collection.prototype[name] = module[name];
    };
  }

  q.attachStatic = function(module) {
    for (var name in module) {
      q[name] = module[name];
    }
  }
})();
// fake class
qx.Bootstrap.define("qx.q", {});

(function() {
  qx.q = function(selector, context) {
    var arr = qx.bom.Selector.query(selector, context);
    var col = qx.lang.Array.cast(arr, qx.Collection);

    return col;
  }

  qx.q.attach = function(module) {
    for (var name in module) {
      qx.Collection.prototype[name] = module[name];
    };
  }

  qx.q.attachStatic = function(module) {
    for (var name in module) {
      qx.q[name] = module[name];
    }
  }
})();
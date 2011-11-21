// fake class
qx.Bootstrap.define("qx.q", {});

(function() {
  var Collection = qx.Bootstrap.define("Collection", {
    extend : qx.type.BaseArray,
    members : {}
  });
  delete window.Collection;

  qx.q = function(selector, context) {
    var arr = qx.bom.Selector.query(selector, context);
    var col = qx.lang.Array.cast(arr, Collection);

    return col;
  }

  qx.q.attach = function(module) {
    for (var name in module) {
      Collection.prototype[name] = module[name];
    };
  }
})();
// fake class
qx.Bootstrap.define("q", {});

(function() {
  q = function(selector, context) {
    return q.init(qx.bom.Selector.query(selector, context));
  }

  q.__init = [];

  q.init = function(arg) {
    var col = qx.lang.Array.cast(arg, qx.Collection);
    for (var i=0; i < q.__init.length; i++) {
      q.__init[i].call(col);
    };
    return col;
  };

  q.attach = function(module) {
    for (var name in module) {
      if (qx.core.Environment.get("qx.debug")) {
        if (qx.Collection.prototype[name] != undefined) {
          throw new Error("Method '" + name + "' already available.");
        }
      }
      qx.Collection.prototype[name] = module[name];
    };
  }

  q.attachStatic = function(module) {
    for (var name in module) {
      if (qx.core.Environment.get("qx.debug")) {
        if (qx.Collection.prototype[name] != undefined) {
          throw new Error("Method '" + name + "' already available as static method.");
        }
      }
      q[name] = module[name];
    }
  }

  q.attachInit = function(init) {
    this.__init.push(init);
  }
})();
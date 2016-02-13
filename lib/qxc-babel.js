module.exports = function (babel) {
  var t = babel.types;
  
  function describe(node) {
    var str = "";
    function recurse(node) {
      if (node.object)
        recurse(node.object);
      if (node.type == "ThisExpression")
        str += "this";
      else if (node.name)
        str += node.name;
      else if (node.property) {
        str +="." + node.property.name;
      }
    }
    recurse(node);
    return str;
  }
  
  function onNext(type, fn) {
    
  }
  
  return new babel.Transformer("qxc-babel", {
    CallExpression: function (node, parent) {
      var callee = describe(node.callee);
      console.log("CallExpression: " + callee);
      
      if (callee == "qx.Class.define" || callee == "qx.Mixin.define" || callee == "qx.Theme.define"
        || callee == "qx.Interface.define" || callee == "qx.Bootstrap.define") {

        var className = node.arguments[0].value;
        var classDef = node.arguments[1];
        console.log("className=" + className);
      }
      
      return;
    },
    
    ObjectExpression: function(node, parent) {
      console.log("ObjectExpression: ");
    }
  });
};

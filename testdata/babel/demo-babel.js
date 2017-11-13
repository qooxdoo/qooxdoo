var fs = require("fs");
var babelCore = require("babel-core");
var types = require("babel-types");
var babylon = require("babylon");

var src = `
var x = (site) => true;
`;

var INNER_VISITOR = {
    ArrowFunctionExpression(path) {
      console.log("INNER: ArrowFunctionExpression");
    },
    VariableDeclaration(path) {
      console.log("INNER: VariableDeclaration");
    }
};
var TOP_VISITOR = {
    ArrowFunctionExpression(path) {
      console.log("TOP: ArrowFunctionExpression");
    },
    FunctionExpression(path) {
      console.log("TOP: FunctionExpression");
    },
    FunctionDeclaration(path) {
      console.log("TOP: FunctionDeclaration");
    },
    VariableDeclaration: { 
      enter(path) {
        console.log("TOP: VariableDeclaration");
        //sp.push(INNER_VISITOR);
        path.traverse(INNER_VISITOR);
        path.skip();
      },
      exit(path) {
        sp.pop();
      }
    }
};

class StatefulPlugin {
  
  constructor(...visitors) {
    var createVisitorCallback = (callbackName, typeName) => new Function("path", "return this." + callbackName + "(\"" + typeName + "\", path);").bind(this);
    
    this.visitor = {};
    visitors.forEach((visitor) => {
      for (var name in visitor) {
        if (this.visitor[name] === undefined) {
          var type = this.visitor[name] = {
              enter: createVisitorCallback("enter", name),
              exit: createVisitorCallback("exit", name)
          };
        }
      }
    });
    
    this.__visitorStack = [];
  }
  
  push(visitor) {
    this.__visitorStack.push(visitor);
  }
  
  pop() {
    this.__visitorStack.pop();
  }
  
  peek() {
    return this.__visitorStack[this.__visitorStack.length - 1];
  }
  
  enter(typeName, path) {
    console.log("SP: Enter: " + typeName);
    var visitor = this.peek();
    var type = visitor[typeName];
    if (typeof type == "function")
      return type(path);
    else if (type && typeof type.enter == "function")
      return type.enter(path);
  }
  
  exit(typeName, path) {
    console.log("SP: Exit: " + typeName);
    var visitor = this.peek();
    var type = visitor[typeName];
    if (type && typeof type.exit == "function")
      return type.exit(path);
  }
}

var sp = new StatefulPlugin(TOP_VISITOR, INNER_VISITOR);
sp.push(TOP_VISITOR);
var result = babelCore.transform(src, {
  babelrc: false,
  filename: "demo-babel.in.js",
  presets: [ "es2015" ],
  plugins: [
    {
      visitor: TOP_VISITOR//sp.visitor
    }
  ],
  passPerPreset: true
});
console.log(result.code);
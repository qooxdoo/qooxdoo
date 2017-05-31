var fs = require("fs");
var babelCore = require("babel-core");
var types = require("babel-types");
var babylon = require("babylon");


/**
 * Helper method that collapses the MemberExpression into a string
 * @param node
 * @returns {string}
 */
function collapseMemberExpression(node) {
  if (!node)
    debugger;
  if (node.type == "ThisExpression")
    return "this";
  if (node.type == "Identifier")
    return node.name;
  if (node.type != "MemberExpression")
    return "(" + node.type + ")";
  if (node.object === undefined)
    debugger;
  if (types.isIdentifier(node.object))
    return node.object.name + "." + node.property.name;
  return collapseMemberExpression(node.object) + "." + node.property.name;
}


var VISITOR = {
  CallExpression: {
    enter(path) {
      if (types.isMemberExpression(path.node.callee)) {
        var name = collapseMemberExpression(path.node.callee);
        if (name == "qx.Class.define") {
          console.log("qx.Class.define: enter");
          var node = path.node;
          var className = node.arguments[0].value;
          var classDef = node.arguments[1];

          // We can only parse objects (eg qx.data.marshal.Json.__toClass creates objects on the fly that we cannot scan)
          if (classDef.type != "ObjectExpression") {
            return;
          }

          console.log("Visitor: Call enter traversing");
          path.skip();
          path.traverse(CLASS_DEF_VISITOR, {classDefPath: path});
          console.log("Visitor: Call enter traversed");
        }
      }
    },
    exit(path) {
      if (types.isMemberExpression(path.node.callee)) {
        var name = collapseMemberExpression(path.node.callee);
        if (name == "qx.Class.define") {
          console.log("qx.Class.define: exit");
          path.skip();
        }
      }
    }
  },

  FunctionDeclaration: {
    enter(path) {
      var node = path.node;
      console.log("Visitor: FuncDecl enter " + node.id.name);
    },
    exit(path) {
      var node = path.node;
      console.log("Visitor: FuncDecl exit " + node.id.name);
    }
  },
  FunctionExpression: {
    enter(path) {
      var node = path.node;
      console.log("Visitor: FuncExpr enter " + node.id.name);
    },
    exit(path) {
      var node = path.node;
      console.log("Visitor: FuncExpr exit " + node.id.name);
    }
  }
};

var PROPERTY_VISITOR = {
  FunctionDeclaration: {
    enter(path) {
      var node = path.node;
      console.log("Property: FuncDecl enter " + node.id.name);
    },
    exit(path) {
      var node = path.node;
      console.log("Property: FuncDecl exit " + node.id.name);
    }
  },
  FunctionExpression: {
    enter(path) {
      var node = path.node;
      console.log("Property: FuncExpr enter " + node.id.name);
    },
    exit(path) {
      var node = path.node;
      console.log("Property: FuncExpr exit " + node.id.name);
    }
  }

};

var CLASS_DEF_VISITOR = {
  Property: {
    enter(path) {
      if (path.parentPath.parentPath != this.classDefPath)
        return;
      var prop = path.node;

      if (prop.key.name == "members") {
        console.log("ClassDef: Property enter (members) traversing");
        path.skip();
        path.traverse(PROPERTY_VISITOR);
        console.log("ClassDef: Property enter (members) traversed");
      }
    },
    exit(path) {
      if (path.parentPath.parentPath != this.classDefPath)
        return;
      var prop = path.node;

      if (prop.key.name == "members") {
        console.log("ClassDef: Property exit (members)");
      }
    }
  },

  FunctionDeclaration: {
    enter(path) {
      var node = path.node;
      console.log("ClassDef: FuncDecl enter " + node.id.name);
    },
    exit(path) {
      var node = path.node;
      console.log("ClassDef: FuncDecl exit " + node.id.name);
    }
  },
  FunctionExpression: {
    enter(path) {
      var node = path.node;
      console.log("ClassDef: FuncExpr enter " + node.id.name);
    },
    exit(path) {
      var node = path.node;
      console.log("ClassDef: FuncExpr exit " + node.id.name);
    }
  }
};

function run(callback) {
  var SOURCE = "babel-demo.src.js";
  fs.readFile(SOURCE, {encoding: "utf-8"}, function (err, src) {
    if (err)
      return callback(err);

    var result = babelCore.transform(src, {
      babelrc: false,
      filename: SOURCE,
      //sourceMaps: "both",
      plugins: [
        { visitor: VISITOR },
        require("babel-plugin-transform-es2015-template-literals"),
        require("babel-plugin-transform-es2015-literals"),
        require("babel-plugin-transform-es2015-function-name"),
        require("babel-plugin-transform-es2015-arrow-functions"),
        require("babel-plugin-transform-es2015-block-scoped-functions"),
        require("babel-plugin-transform-es2015-classes"),
        require("babel-plugin-transform-es2015-object-super"),
        require("babel-plugin-transform-es2015-shorthand-properties"),
        require("babel-plugin-transform-es2015-computed-properties"),
        require("babel-plugin-transform-es2015-for-of"),
        require("babel-plugin-transform-es2015-sticky-regex"),
        require("babel-plugin-transform-es2015-unicode-regex"),
        require("babel-plugin-check-es2015-constants"),
        require("babel-plugin-transform-es2015-spread"),
        require("babel-plugin-transform-es2015-parameters"),
        require("babel-plugin-transform-es2015-destructuring"),
        require("babel-plugin-transform-es2015-block-scoping"),
        require("babel-plugin-transform-es2015-typeof-symbol"),
        require("babel-plugin-transform-es2015-modules-commonjs"),
        [require("babel-plugin-transform-regenerator"), {async: false, asyncGenerators: false}]
      ]
    });
  });
}

run(function(err) {
  console.log("Done, err=" + err);
});


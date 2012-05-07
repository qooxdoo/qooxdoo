var listData = {};
var qLoaded = false;
var collectionLoaded = false;

q.io.xhr("script/q.json").send().on("loadend", function(xhr) {
  if (xhr.readyState == 4) {
    var ast = JSON.parse(xhr.responseText);
    qLoaded = true;
    saveContent(ast);
    createListData(ast);
  } else {
    console.log("ERROR!"); // TODO
  }
});

q.io.xhr("script/qx.Collection.json").send().on("loadend", function(xhr) {
  if (xhr.readyState == 4) {
    var ast = JSON.parse(xhr.responseText);
    collectionLoaded = true;
    saveContent(ast);
    createListData(ast);
  } else {
    console.log("ERROR!"); // TODO
  }
});


var getModuleName = function(attach) {
  var name = attach || "Core";
  if (name.indexOf("#") != -1) {
    name = /\.(\w*)#/.exec(name)[1];
  }
  return name;
};

var createListData = function(ast) {
  attachToListData(getByType(ast, "methods-static"), "static");
  attachToListData(getByType(ast, "methods"), "member");
  if (qLoaded && collectionLoaded) {
    renderList(listData);
  }
};

var attachToListData = function(ast, type) {
  ast && ast.children.forEach(function(item) {
    var name = item.attributes.name;
    var module = getModuleName(item.attributes.attach);
    if (!listData[module]) {
      listData[module] = {"static": [], "member": []};
    }
    listData[module][type].push(name);
  });
}


var renderList = function(data) {
  var list = q("#list");
  var keys = Object.keys(data);
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    var module = keys[i];
    list.append(q.create("<h2>" + module + "</h2>"));
    var ul = q.create("<ul></ul>").appendTo(list);
    data[module]["static"].sort();
    data[module]["static"].forEach(function(name) {
      name = "q." + name;
      q.template.get("list-item", {name: name + "()", link: name}).appendTo(ul);
    });
    data[module]["member"].sort();
    data[module]["member"].forEach(function(name) {
      name = "." + name;
      q.template.get("list-item", {name: name + "()", link: name}).appendTo(ul);
    });
  }
  // after the list has been rendered, also render the content
  sortMethods();
  methods.forEach(parseMethod);
};


var methods = [];
var saveContent = function(ast) {
  methods = methods.concat(getByType(ast, "methods-static").children);
  methods = methods.concat(getByType(ast, "methods").children);
};


var sortMethods = function() {
  methods.sort(function(a, b) {
    var moduleA = getModuleName(a.attributes.attach);
    var moduleB = getModuleName(b.attributes.attach);
    if (moduleA == moduleB) {
      return a.attributes.name > b.attributes.name ? 1 : -1;
    }
    return moduleA > moduleB ? 1 : -1;
  });
};

var __lastModule = "";
var parseMethod = function(method) {
  var isStatic = method.attributes.isStatic;
  // add the name
  var data = {name: (isStatic ? "q." : ".") + method.attributes.name};

  // module
  data.module = getModuleName(method.attributes.attach)

  // add the description
  data.desc = getByType(method, "desc").attributes.text;

  // add the return type
  var returnType = getByType(method, "return");
  if (returnType) {
    data.returns = {desc: getByType(returnType, "desc").attributes.text};
    data.returns.types = [];
    getByType(returnType, "types").children.forEach(function(item) {
      data.returns.types.push(item.attributes.type);
    });
  }
  // add the parameters
  data.params = [];
  var params = getByType(method, "params");
  for (var j=0; j < params.children.length; j++) {
    var param = params.children[j];
    var paramData = {name: param.attributes.name};
    paramData.desc = getByType(param, "desc").attributes.text;
    paramData.types = [];
    var types = getByType(param, "types");
    for (var k=0; k < types.children.length; k++) {
      var type = types.children[k];
      paramData.types.push(type.attributes.type);
    };
    data.params.push(paramData);
  };
  data.printParams = printParams;

  // render data
  if (__lastModule != data.module) {
    q("#content").append(q.create("<h1>" + data.module + "</h1>"));
    __lastModule = data.module;
  }
  q("#content").append(q.template.get("method", data));
}


var printParams = function() {
  var params = "";
  for (var i = 0; i < this.params.length; i++) {
    params += this.params[i].types.join(" | ") + " ";
    params += "<span class='monotype'>" + this.params[i].name + "</span>";
    if (i < this.params.length - 1) {
      params += ", ";
    }
  }
  return params;
};


var getByType = function(ast, type) {
  for (var i=0; i < ast.children.length; i++) {
    var item = ast.children[i];
    if (item.type == type) {
      return item;
    }
  };
  return {attributes: {}, children: []};
};
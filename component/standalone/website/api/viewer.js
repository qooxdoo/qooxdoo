var listData = {};

q.io.xhr("script/q.json").send().on("loadend", function(xhr) {
  if (xhr.readyState == 4) {
    var ast = JSON.parse(xhr.responseText);
    createListData(ast);
    renderList(listData);
    // renderContent(data);
  } else {
    console.log("ERROR!"); // TODO
  }
});


var createListData = function(ast) {
  for (var i=0; i < ast.children.length; i++) {
    if (ast.children[i].type == "methods-static") {
      var statics = ast.children[i];
      statics.children.forEach(function(item, i) {

        var name = item.attributes.name;
        var module = item.attributes.attach || "Core";
        if (module.indexOf("#") != -1) {
          module = /\.(\w*)#/.exec(module)[1];
        }
        if (!listData[module]) {
          listData[module] = {static: [], member: []};
        }
        listData[module].static.push(name);
      });
    }
  };
};


var renderList = function(data) {
  var list = q("#list");
  for (var module in data) {
    list.append(q.create("<h2>" + module + "</h2>"));
    var ul = q.create("<ul></ul>").appendTo(list);
    data[module].static.forEach(function(name) {
      name = "q." + name + "()";
      q.template.get("list-item", {name: name}).appendTo(ul);
    });
  }
};


var renderContent = function(data) {
  
};
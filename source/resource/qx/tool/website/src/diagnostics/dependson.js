$(function () {
  var db;
  var appDb;
  var CLASSES = {};
  var expanded = {};

  function expand(parent) {
    var $parent = $(parent);
    var className = $parent.attr("data-classname");
    var $ul = $("ul", parent);

    expanded[className] = true;
    if ($ul.length) {
      $ul.remove();
      return;
    }
    var $ul = $("<ul>");
    $parent.append($ul);
    show(className, $ul);
    updateDisplay();
  }

  function show(name, $list) {
    var def = db.classInfo[name];
    if (!def || !def.dependsOn) return;
    for (var depName in def.dependsOn) {
      if (!CLASSES[depName]) {
        continue;
      }
      var isLoad = def.dependsOn[depName].load;
      var $li = $("<li>").text(depName).attr("data-classname", depName);
      if (isLoad) {
        $li.addClass("load");
      } else {
        $li.addClass("runtime");
      }
      $li.click(function (e) {
        e.stopPropagation();
        expand(this);
      });
      $list.append($li);
    }
  }

  function showAll($list) {
    if (!$list) {
      $list = $("#root ul");
    }
    $list.children("li").each(function () {
      let $li = $(this);
      if ($li.children("li").length != 0) {
        return;
      }
      let classname = $li.attr("data-classname");
      if (expanded[classname]) {
        return;
      }
      expand($li);
      showAll($("ul", $li));
    });
  }
  window.showAll = showAll;

  function selectClass(name) {
    $("#root").append($("<h3>").text(name + " Depends On"));
    var $root = $("<ul>");
    $("#root").append($root);
    show(name, $root);
  }

  function updateDisplay() {
    var value = $("#show").val();
    switch (value) {
      case "runtime":
        $(".load").hide();
        $(".runtime").show();
        break;

      case "load":
        $(".load").show();
        $(".runtime").hide();
        break;

      default:
        $(".load").show();
        $(".runtime").show();
        break;
    }
  }

  var query = $.qxcli.query;
  $.qxcli
    .get(query.targetDir + "/db.json")
    .then(function (tmp) {
      db = tmp;
      return $.qxcli.get(
        query.targetDir + "/" + query.appDir + "/compile-info.json"
      );
    })
    .then(function (tmp) {
      appDb = tmp;
      appDb.parts.forEach(function (part) {
        part.classes.forEach(classname => (CLASSES[classname] = true));
      });
      selectClass($.qxcli.query.appClass);
      $("#show").change(updateDisplay);
    });
});

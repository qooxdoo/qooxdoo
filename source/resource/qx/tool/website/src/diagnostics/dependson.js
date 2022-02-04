$(function () {
  var db;
  var appDb;
  var CLASSES = {};

  function show(name, $list) {
    var def = db.classInfo[name];
    if (!def || !def.dependsOn) return;
    for (var depName in def.dependsOn) {
      if (!CLASSES[depName]) continue;
      var isLoad = def.dependsOn[depName].load;
      var $li = $("<li>").text(depName).attr("data-classname", depName);
      if (isLoad) $li.addClass("load");
      else $li.addClass("runtime");
      $li.click(function (e) {
        e.stopPropagation();
        var $this = $(this),
          className = $this.attr("data-classname"),
          $ul = $("ul", this);
        if ($ul.length) {
          $ul.remove();
          return;
        }
        var $ul = $("<ul>");
        $this.append($ul);
        show(className, $ul);
        updateDisplay();
      });
      $list.append($li);
    }
  }

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

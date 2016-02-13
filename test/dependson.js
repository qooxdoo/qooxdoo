
$(function() {
  
  function show(name, $list) {
    var def = db.classInfo[name];
    if (!def || !def.dependsOn)
      return;
    for (var depName in def.dependsOn) {
      var isLoad = def.dependsOn[depName].load;
      var $li = $("<li>").text(depName).attr("data-classname", depName);
      if (isLoad)
        $li.addClass("load");
      else
        $li.addClass("runtime");
      $li.click(function(e) {
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
    $(document.body).append($("<h1>").text(name + " Depends On"));
    var $root = $("<ul>");
    $(document.body).append($root);
    show(name, $root);
  }
  
  var topLevel = [];
  selectClass("qxt.Application");
  /*
  for (var name in db.classInfo) {
    selectClass(name);
  }*/

  function updateDisplay() {
    var value = $("#show").val();
    switch(value) {
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
  $("#show").change(updateDisplay);
});

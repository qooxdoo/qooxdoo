
$(function() {
  
  function createLi(depName, depData) {
    var $li = $("<li>")
      .text(depName)
      .attr("data-classname", depName)
      .attr("data-depdata", JSON.stringify(depData));
    if (depData) {
      if (depData.load)
        $li.append($("<span class='load'>load</span>"))
      if (depData.require)
        $li.append($("<span class='load'>require</span>"))
      if (depData.construct)
        $li.append($("<span class='construct'>construct</span>"))
      if (depData.defer)
        $li.append($("<span class='defer'>defer</span>"))
      if (depData.usage)
        $li.append($("<span class='usage'>" + depData.usage + "</span>"))
    }
    return $li;
  }
  
  function show(name, $list) {
    var def = db.classInfo[name];
    if (!def || !def.dependsOn)
      return;
    for (var depName in def.dependsOn) {
      var depData = def.dependsOn[depName];
      var $li = createLi(depName, depData);
      
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
  
  function selectClass(startClassName, targetClassName) {
    $(document.body).append($("<h1>").text(startClassName + " Depends On"));
    var $root = $("<ul>");
    $(document.body).append($root);
    show(startClassName, $root);
    
    var scannedClassNames = {};
    function scan(name, parentDepData) {
      var $resultLi = null;
      var $resultUl = null;
      function addResult($li) {
        if ($resultLi === null) {
          $resultUl = $("<ul>"); 
          $resultLi = createLi(name, parentDepData);
          $resultLi.append($resultUl);
        }
        $resultUl.append($li);
      }
      if (scannedClassNames[name])
        return;
      scannedClassNames[name] = true;
      var def = db.classInfo[name];
      if (!def || !def.dependsOn)
        return;
      for (var depName in def.dependsOn) {
        var dd = def.dependsOn[depName];
        if (true || dd.load || dd.require) {
          if (depName == targetClassName) {
            addResult(createLi(depName, dd));
            continue;
          }
          var $childLi = scan(depName, dd);
          if ($childLi) {
            addResult($childLi);
          }
        }
      }
      return $resultLi;
    }
    
    if (targetClassName) {
      var $li = scan(startClassName, null);
      if ($li !== null) {
        $(document.body).append("<h2>Load Dependency Path to " + targetClassName + "</h2>");
        var $pathTo = $("<ul class='path-to'>");
        $(document.body).append($pathTo);
        $pathTo.append($li);
      }
    }
  }
  
  var topLevel = [];
  var startClasses = [ "uk.co.spar.srv.Skin", "grasshopper.srv.SmartSite" ]; 
  for (var name in db.classInfo)
    if (name.startsWith("grasshopper.srv.") || name.startsWith("grasshopper.utils."))
      startClasses.push(name);
  startClasses.forEach((name) => selectClass(name, "qx.bom.Style"));
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

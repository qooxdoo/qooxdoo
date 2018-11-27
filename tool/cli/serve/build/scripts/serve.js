$(function() {
  
  function get(uri) {
    return new Promise((resolve, reject) => {
      $.ajax("/serve.api/apps.json", {
        cache: false,
        dataType: "json",
        
        error: function(jqXHR, textStatus, errorThrown) {
          reject(textStatus || errorThrown);
        },
        
        success: resolve
      });
    });
  }
  
  $.qxcli = {};
  $.qxcli.serve = {
      apps: get("/serve-api/apps")
  };
  
  $.qxcli.pages = {
    homepage() {
      $.qxcli.serve.apps
        .then((data) => {
          console.log(JSON.stringify(data, null, 2));
          var $ul = $("<ul>");
          data.apps.forEach((appData) => {
            var $li = $("<li>");
            var $a = $("<a>");
            $a.text(appData.title||appData.name);
            $a.attr("href", data.target.outputDir + appData.outputPath + "index.html");
            $li.append($a);
            $ul.append($li);
          });
          $apps = $("#applications");
          $apps.empty();
          $(".home h1").text("Applications built using " + (data.target.type == "build" ? "Build" : "Source") + " Target");
          $apps.append($ul);
        });
    }
  };
  
});


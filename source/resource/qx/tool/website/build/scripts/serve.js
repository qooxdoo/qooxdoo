$(function () {
  var query = {};
  (document.location.search.substring(1) || "")
    .split("&")
    .forEach(function (seg) {
      var pos = seg.indexOf("=");
      if (pos > -1) {
        query[seg.substring(0, pos)] = seg.substring(pos + 1);
      } else {
        query[seg] = true;
      }
    });

  $.qxcli = {
    query: query,

    get(uri) {
      return new Promise(function (resolve, reject) {
        $.ajax(uri, {
          cache: false,
          dataType: "json",

          error(jqXHR, textStatus, errorThrown) {
            reject(textStatus || errorThrown);
          },

          success: resolve
        });
      });
    }
  };

  $.qxcli.serve = {
    apps: $.qxcli.get("/serve.api/apps.json")
  };

  $.qxcli.pages = {
    homepage() {
      $.qxcli.serve.apps.then(function (data) {
        console.log(JSON.stringify(data, null, 2));
        let $root = $("#applications");
        $root.empty();
        data.forEach(targetData => {
          $root.append(
            $("<h2>").text(
              (targetData.target.type == "build" ? "Build" : "Source") +
                " Target in " +
                targetData.target.outputDir
            )
          );

          var $ul = $("<ul>");
          targetData.apps.sort(function (l, r) {
            l = l.title || l.name;
            r = r.title || r.name;
            return l < r ? -1 : l > r ? 1 : 0;
          });
          targetData.apps.forEach(function (appData) {
            var $li = $("<li>");
            if (appData.isBrowser) {
              var $a = $("<a>");
              $a.text(appData.title || appData.name);
              $a.attr(
                "href",
                targetData.target.outputDir + appData.outputPath + "/index.html"
              );

              $li.append($a);
            } else {
              var $p = $("<p>");
              $p.text(appData.title || appData.name);
              $li.append($p);
            }
            if (appData.description)
              $li.append($("<p>").text(appData.description));
            $li.append(
              "<p class='tools'>" +
                "<a href='diagnostics/dependson.html?targetDir=" +
                targetData.target.outputDir +
                "&appDir=" +
                appData.outputPath +
                "&appClass=" +
                appData.appClass +
                "'>Depends-On Analysis</a>, " +
                "<a href='diagnostics/requiredby.html?targetDir=" +
                targetData.target.outputDir +
                "&appDir=" +
                appData.outputPath +
                "&appClass=" +
                appData.appClass +
                "'>Required-By Analysis</a>" +
                "</p>"
            );

            $ul.append($li);
          });
          $root.append($ul);
        });
        $root.append(
          "<p style='font-size: 10px'><input type='checkbox' id='cbxShowTools'>Show Tools</p>"
        );

        $("#cbxShowTools").change(function () {
          if (this.checked) $(".tools").show();
          else $(".tools").hide();
        });
      });
    }
  };
});

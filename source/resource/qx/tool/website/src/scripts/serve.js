document.addEventListener('DOMContentLoaded', function () {
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

  window.qxcli = {
    query: query,

    get(uri) {
      return fetch(uri, {
        cache: 'no-cache'
      }).then(response => {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      });
    }
  };

  window.qxcli.serve = {
    apps: window.qxcli.get("/serve.api/apps.json")
  };

  window.qxcli.pages = {
    homepage() {
      window.qxcli.serve.apps.then(function (data) {
        console.log(JSON.stringify(data, null, 2));
        let root = document.getElementById("applications");
        root.innerHTML = '';
        data.forEach(targetData => {
          let h2 = document.createElement('h2');
          h2.textContent = (targetData.target.type == "build" ? "Build" : "Source") +
            " Target in " +
            targetData.target.outputDir;
          root.appendChild(h2);

          var ul = document.createElement('ul');
          targetData.apps.sort(function (l, r) {
            l = l.title || l.name;
            r = r.title || r.name;
            return l < r ? -1 : l > r ? 1 : 0;
          });
          targetData.apps.forEach(function (appData) {
            var li = document.createElement('li');
            if (appData.isBrowser) {
              var a = document.createElement('a');
              a.textContent = appData.title || appData.name;
              a.setAttribute('href',
                targetData.target.outputDir + appData.outputPath + "/index.html"
              );
              li.appendChild(a);
            } else {
              var p = document.createElement('p');
              p.textContent = appData.title || appData.name;
              li.appendChild(p);
            }
            if (appData.description) {
              let p = document.createElement('p');
              p.textContent = appData.description;
              li.appendChild(p);
            }
            let toolsP = document.createElement('p');
            toolsP.className = 'tools';
            toolsP.innerHTML =
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
              "'>Required-By Analysis</a>";
            li.appendChild(toolsP);

            ul.appendChild(li);
          });
          root.appendChild(ul);
        });
        let p = document.createElement('p');
        p.style.fontSize = '10px';
        <!-- tools needs to be reworked -->
        p.style.display = 'none';
        p.innerHTML = "<input type='checkbox' id='cbxShowTools'>Show Tools";
        root.appendChild(p);

        document.getElementById('cbxShowTools').addEventListener('change', function () {
          let tools = document.querySelectorAll('.tools');
          tools.forEach(function (tool) {
            tool.style.display = this.checked ? 'inherit' : 'none';
          }.bind(this));
        });
      });
    }
  };
});

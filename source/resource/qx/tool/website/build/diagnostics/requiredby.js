document.addEventListener('DOMContentLoaded', function () {
  var db;
  var classesLookup = {};

  let infoByClass = {};

  function show(name, list) {
    var def = infoByClass[name];
    if (!def || !def.requiredBy) return;
    for (var depName in def.requiredBy) {
      if (!classesLookup[depName]) continue;
      var li = document.createElement('li');
      li.textContent = depName;
      li.setAttribute("data-classname", depName);
      if (def.requiredBy[depName].load) li.classList.add("load");
      else li.classList.add("runtime");
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        var className = this.getAttribute("data-classname");
        var ul = this.querySelector("ul");
        if (ul) {
          ul.remove();
          return;
        }
        ul = document.createElement('ul');
        this.appendChild(ul);
        show(className, ul);
        updateDisplay();
      });
      list.appendChild(li);
    }
  }

  function selectClass(name) {
    let root = document.getElementById("root");
    let h3 = document.createElement('h3');
    h3.textContent = name + " Required By";
    root.appendChild(h3);
    var ul = document.createElement('ul');
    root.appendChild(ul);
    show(name, ul);
  }

  function updateDisplay() {
    var value = document.getElementById("show").value;
    let loadElems = document.querySelectorAll(".load");
    let runtimeElems = document.querySelectorAll(".runtime");

    switch (value) {
      case "runtime":
        loadElems.forEach(el => el.style.display = 'none');
        runtimeElems.forEach(el => el.style.display = '');
        break;

      case "load":
        loadElems.forEach(el => el.style.display = '');
        runtimeElems.forEach(el => el.style.display = 'none');
        break;

      default:
        loadElems.forEach(el => el.style.display = '');
        runtimeElems.forEach(el => el.style.display = '');
        break;
    }
  }

  /**
   * 
   * @param {string} name 
   * @returns {Promise<Object>}
   */
  function getClassInfo(name) {
    const doit = async () => {
      let classPath = name.replace(/\./g, "/") + ".json";
      let def = await window.qxcli.get(query.targetDir + "/transpiled/" + classPath);
      return def;
    }
    if (infoByClass[name] === undefined) {
      infoByClass[name] = doit().then(info => (infoByClass[name] = info));
    }
    return infoByClass[name];
  }

  /**
   * 
   * @param {string} name 
   * @returns {Promise<Object>}
   */
  function getClassInfo(name) {
    const doit = async () => {
      let classPath = name.replace(/\./g, "/") + ".json";
      let def = await window.qxcli.get(query.targetDir + "/transpiled/" + classPath);
      return def;
    }
    if (infoByClass[name] === undefined) {
      infoByClass[name] = doit().then(info => (infoByClass[name] = info));
    }
    return infoByClass[name];
  }

  var query = window.qxcli.query;
  window.qxcli
    .get(query.targetDir + "/db.json")
    .then(function (tmp) {
      db = tmp;
      return window.qxcli.get(
        query.targetDir + "/" + query.appDir + "/compile-info.json"
      );
    })
    .then(async function (tmp) {
      appDb = tmp;
      appDb.parts.forEach(function (part) {
        part.classes.forEach(classname => (classesLookup[classname] = true));
      });

      for (var name in classesLookup) {
        var def = await getClassInfo(name);
        if (def.dependsOn) {
          for (var depName in def.dependsOn) {
            var depDef = await getClassInfo(depName);
            if (!depDef.requiredBy) depDef.requiredBy = {};
            depDef.requiredBy[name] = {
              load: def.dependsOn[depName].load
            };
          }
        }
      }

      selectClass(window.qxcli.query.appClass);

      document.getElementById("show").addEventListener('change', updateDisplay);
    });
});

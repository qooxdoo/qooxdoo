document.addEventListener('DOMContentLoaded', function () {
  var db;
  var appDb;
  var clasesLookup = {};
  var expanded = {};

  let infoByClass = {};

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

  async function expand(parent) {
    var className = parent.getAttribute("data-classname");
    var ul = parent.querySelector("ul");

    expanded[className] = true;
    if (ul) {
      ul.remove();
      return;
    }
    ul = document.createElement('ul');
    parent.appendChild(ul);
    await show(className, ul);
    updateDisplay();
  }

  async function show(name, list) {
    var def = await getClassInfo(name);
    if (!def || !def.dependsOn) return;
    for (var depName in def.dependsOn) {
      if (!clasesLookup[depName]) {
        continue;
      }
      var isLoad = def.dependsOn[depName].load;
      var li = document.createElement('li');
      li.textContent = depName;
      li.setAttribute("data-classname", depName);
      if (isLoad) {
        li.classList.add("load");
      } else {
        li.classList.add("runtime");
      }
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        expand(this);
      });
      list.appendChild(li);
    }
  }

  function showAll(list) {
    if (!list) {
      list = document.querySelector("#root ul");
    }
    Array.from(list.children).forEach(function (li) {
      if (li.querySelectorAll("li").length != 0) {
        return;
      }
      let classname = li.getAttribute("data-classname");
      if (expanded[classname]) {
        return;
      }
      expand(li).then(() => {
        let childUl = li.querySelector("ul");
        if (childUl) {
          showAll(childUl);
        }
      });
    });
  }
  window.showAll = showAll;

  async function selectClass(name) {
    let root = document.getElementById("root");
    let h3 = document.createElement('h3');
    h3.textContent = name + " Depends On";
    root.appendChild(h3);
    var ul = document.createElement('ul');
    root.appendChild(ul);
    await show(name, ul);
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

  var query = window.qxcli.query;
  window.qxcli
    .get(query.targetDir + "/db.json")
    .then(function (tmp) {
      db = tmp;
      return window.qxcli.get(
        query.targetDir + "/" + query.appDir + "/compile-info.json"
      );
    })
    .then(function (tmp) {
      appDb = tmp;
      appDb.parts.forEach(function (part) {
        part.classes.forEach(classname => (clasesLookup[classname] = true));
      });
      selectClass(window.qxcli.query.appClass);
      document.getElementById("show").addEventListener('change', updateDisplay);
    });
});

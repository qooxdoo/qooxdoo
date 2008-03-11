(function()
{
  function init()
  {
    detachEvents();
    insertSourceLink();
  }

  function insertSourceLink()
  {
    // if the current frame is the top frame
    if(window.top != window) {
      return;
    }

    // extract category and file
    var splits = location.href.split("/");
    var length = splits.length;
    var div = " " + String.fromCharCode(187) + " ";
    var category = splits[length-2];
    var file = splits[length-1].replace(".html", "");

    // create a dvi
    var div = document.createElement("div");
    var style = div.style;
    style.position = "absolute";
    style.top = "0";
    style.right = "0";
    style.zIndex = "absolute";
    style.padding = "5px";

    // create the URI to the source script
    var jsFileURL = "../../script/demobrowser.demo." + category + "." + file + ".src.js";

    // set the link
    div.innerHTML ="<a href='" + jsFileURL + "' target='_blank'>Show Javascript Source</a>";

    // append the div to the document
    document.body.appendChild(div);
  }

  function updateTitle()
  {
    var splits = location.href.split("/");
    var length = splits.length;
    var div = " " + String.fromCharCode(187) + " ";
    var category = splits[length-2].toUpperCase();
    var file = splits[length-1].replace(".html", "").replace("_", " ");

    document.title = "qooxdoo" + div + "Demo Browser" + div + category + div + file;
  }

  function attachEvents()
  {
    if (window.attachEvent) {
      window.attachEvent("onload", init);
    } else if (window.addEventListener) {
      window.addEventListener("load", init, false);
    }
  }

  function detachEvents()
  {
    if (window.detachEvent) {
      window.detachEvent("onload", init);
    } else if (window.removeEventListener) {
      window.removeEventListener("load", init, false);
    }
  }

  attachEvents();
  updateTitle();
})();



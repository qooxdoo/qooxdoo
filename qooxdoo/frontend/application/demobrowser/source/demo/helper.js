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
    var file = splits[splits.length - 1].split("?")[0].replace(".html", "");

    // create a dvi
    var div = document.createElement("div");
    var style = div.style;
    style.position = "absolute";
    style.top = "6px";
    style.right = "6px";
    style.zIndex = "5000";
    style.padding = "4px 6px";
    style.font = "11px verdana,sans-serif bold";
    style.background = "white";
    style.border = "1px solid black";

    // create the URI to the source script
    var jsFileURL = "../../script/demobrowser.demo." + category + "." + file + ".src.js";

    // set the link
    div.innerHTML ="<a style='color:black;text-decoration:none' href='" + jsFileURL + "' target='_blank'>Show Javascript Source</a>";

    // append the div to the document
    document.body.appendChild(div);
  }

  function updateTitle()
  {
    var splits = location.href.split("/");
    var length = splits.length;
    var div = " " + String.fromCharCode(187) + " ";
    var category = splits[length-2].toUpperCase();
    var file = splits[length-1].split("?")[0].replace(".html", "").replace("_", " ");

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



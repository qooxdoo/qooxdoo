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
    if(window.top == window)
    {
      // create a dvi
      div = qx.bom.Element.create("div");
      // set the css
      qx.bom.element.Style.setCss(div, "position: absolute; top: 0; right: 0; z-index: 5000; padding: 5px");
      // create the URI to the source script
      var jsFileURL = "../../script/" + this.constructor.classname + ".src.js";
      // set the link
      div.innerHTML ="<a href='" + jsFileURL + "' target='_blank'>Show Javascript Source</a>";
      // append the div to the document
      document.body.appendChild(div);
    }
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



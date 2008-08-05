(function()
{
  var jsFileURL;
  var jsSourceURL;

  function init()
  {
    detachEvents();
    insertSourceLink();
  }

  function getDataFromLocation()
  {

    var defaultParameters =
    {
      "aspects" : "off",
      "theme" : "qx.theme.Modern"
    };

    // extract category and file
    var splits = location.href.split("/");
    var length = splits.length;
    var div = " " + String.fromCharCode(187) + " ";
    var category = splits[length-2];
    var filevar = "";  // variable part of .js file name
    var i;

    // 'tmp' mirror line: "Atom.html?qxvariant:qx.aspects:off&theme_qx.theme.Classic"
    var tmp = splits[splits.length - 1];
    var fileAndParms = tmp.split("?");
    var base = fileAndParms[0].replace(".html", "");  // "Atom"

    var parametes;
    if (fileAndParms.length < 2) // no url parameters
    {
      parameters = ['','',''];
    }
    else
    {
      parameters = fileAndParms[1].split("&");  // the url parameters "?...&..&.."
    }

    // add theme part of filename
    tmp = parameters[1].split("_");   // read this from "theme_qx.theme..."

    filevar += "-theme_";
    if(tmp[0] && tmp[0] == "theme"){
      filevar += tmp[1];
    }else{
      filevar += defaultParameters.theme;
    }

    // create the URI to the source script
    jsFileURL = "../../script/demobrowser.demo." + category + "." + base + filevar + ".js";
    jsSourceURL = "../../script/demobrowser.demo." + category + "." + base + ".src.js";
  }

  function emit(text)
  {
    var body = document.getElementsByTagName("body")[0];
    if (!body)
    {
      body = document.createElement('body');
      var html = document.getElementsByTagName("html")[0];
      html.appendChild(body);
    }
    var textNode = document.createTextNode(text);
    body.appendChild(textNode);
  }

  function insertSourceLink()
  {
    // if the current frame is the top frame
    if(window.top != window) {
      return;
    }

    // create a div element
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


    // set the link
    div.innerHTML ="<a style='color:black;text-decoration:none' href='" + jsSourceURL + "' target='_blank'>Show Javascript Source</a>";

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

  function loadScript()
  {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = jsFileURL;
    head.appendChild(script);
  }

  getDataFromLocation();
  loadScript();
  attachEvents();
  updateTitle();
})();

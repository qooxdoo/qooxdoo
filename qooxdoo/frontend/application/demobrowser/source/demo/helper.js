(function()
{
  
  var jsFileURL;
  
  function init()
  {
    detachEvents();
    insertSourceLink();
  }

  function getDataFromLocation()
  {

    var defaultParameters = {
      "aspects" : "off",
      "theme" : "Classic"
    };
    
    // extract category and file
    var splits = location.href.split("/");
    var length = splits.length;
    var div = " " + String.fromCharCode(187) + " ";
    var category = splits[length-2];
    var filevar = "";  // variable part of .js file name
    var i;
    
    // 'tmp' mirror line: "Atom.html?qxvariant:qx.aspects:off&qx.enableAspect:false&theme_qx.theme.Classic"
    var tmp = splits[splits.length - 1];
    var fileAndParms = tmp.split("?");
    if (fileAndParms.length < 2)
    {
      emit("No URL parameters given! (try: \"?qxvariant:qx.aspects:off&qx.enableAspect:false&theme_qx.theme.Classic\")");
      return
    }
    var base = fileAndParms[0].replace(".html", "");  // "Atom"
    
    var parameters = fileAndParms[1].split("&");  // the url parameters "?...&..&.."
    if (parameters.length < 3)
    {
      emit("Insufficient URL parameters given! (try: \"?qxvariant:qx.aspects:off&qx.enableAspect:false&theme_qx.theme.Classic\")");
      return
    }
    
    // add aspect part of filename
    tmp = parameters[0].split(":");  // read this from "qxvariant:qx.aspects:..."

    filevar += "-aspects_";
    if(tmp[1] == "qx.aspects"){
      filevar += tmp[2];
    }else{
      filevar += defaultParameters.aspects;
    }

    // add theme part of filename
    tmp = parameters[2].split("_");   // read this from "theme_qx.theme..."
    
    filevar += "-theme_";
    if(tmp[0] == "theme"){
      filevar += tmp[1];
    }else{
      filevar += defaultParameters.theme;
    }

    // create the URI to the source script
    jsFileURL = "../../script/demobrowser.demo." + category + "." + base + filevar + ".js";

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
  
  function loadScript()
  {
    function createXHRObject()
    {
      if (typeof XMLHttpRequest != "undefined") {
        return new XMLHttpRequest();
      } else if (typeof ActiveXObject != "undefined") {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } else {
        return null;
      }
    }

    var req = createXHRObject();
    var scriptData = "";
    var url = jsFileURL;

    if(req === null)
    {
      emit("Could not create XMLHttpRequest object!\nDemo can not be loaded.");
      return;
    }

    req.open("GET", url, false);
    
    try{
      req.send("");
    }catch(e)
    {
      emit("Could not open demo!\nTechnical information:\n" + e)
    }

    if (req.readyState == 4 && (req.status === 0 || req.status === 304 || (req.status >= 200 && req.status < 300)) )
    {
      if (req.responseText) {
        scriptData = req.responseText;
      } else {
        emit("Cold not load demo!");
        return;
      }
    }
    eval(scriptData);

  }
  
  getDataFromLocation();
  loadScript();
  attachEvents();
  updateTitle();

})();



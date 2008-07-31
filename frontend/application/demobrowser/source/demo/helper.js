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
    var s = "";
    var i;
    
    var tmp = splits[splits.length - 1];
    var file = tmp.split("?")[0].replace(".html", "");
    
    
    var parameters = tmp.split("?")[1].split("&");
    
    var aspect = "off";
    var theme = "Classic";

    tmp = parameters[0].split(":");

    if(tmp[1] == "qx.aspects"){
      s += "-aspects_" + tmp[2];
    }else{
      // default
    }

    tmp = parameters[2].split(":");
    
    if(tmp[0] == "theme"){
      s += "-" + tmp[0] + "_" + tmp[1];
    }else{
      //default
    }

    // create the URI to the source script
    jsFileURL = "../../script/demobrowser.demo." + category + "." + file + s + ".js";

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
      alert("Could not create XMLHttpRequest object!\nDemo can not be loaded.");
      return;
    }

    req.open("GET", url, false);
    
    try{
      req.send("");
    }catch(e)
    {
      debugger;
      alert("Could not open demo!\nTechnical information:\n" + e)
    }

    if (req.readyState == 4 && (req.status === 0 || req.status === 304 || (req.status >= 200 && req.status < 300)) )
    {
      if (req.responseText) {
        scriptData = req.responseText;
      } else {
        alert("Cold not load demo!");
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



/** qooxdoo v2.2 | (c) 2013 1&1 Internet AG, http://1und1.de | http://qooxdoo.org/license */
// Active reload support
// Content will be injected into index.html when run through source-server.
var CheckUrl = "{{check_url}}";
var TimeOut = {{check_interval}};
var ScriptTag = null;

function AR_script_callback(data) {
  var request = {status:200};
  if (data.changed == true) {
    doReloadIf(request);
  } else {
    document.body.removeChild(ScriptTag);
  }
}

function doReloadIf(request) {
  if (request.status == 200) {  // alternatively, 304 will be returned
    //console.log("reloading page...");
    window.document.location.reload();
  }
}

// cf. Wenz, JavaScript Phrasebook, p.206
function getXHR() {
  var request = null;
  if (window.XMLHttpRequest) {
    try {
      request = new XMLHttpRequest();
    } catch (ex) {}
  } else if (window.ActiveXObject) {
    try {
      request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (ex) {
      try {
        request = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (ex) {}
    }
  }
  return request;
}

function fetchSentinel_stag() {
  var stag = document.createElement("script");
  stag.charset = "utf-8";
  stag.src = CheckUrl;
  ScriptTag = stag;
  document.body.appendChild(stag);
}

function fetchSentinel() {
  var request = getXHR();
  if (request!=null) {
    request.onreadystatechange = function (){
      if (request.readyState == 4 ) {
        doReloadIf(request);
      }
    }
    request.open("GET", CheckUrl);
    request.send(null);
  }
}

function startTimer() {
  return setInterval(fetchSentinel_stag, TimeOut);
}

var tid = startTimer();

/** qooxdoo v2.2 | (c) 2013 1&1 Internet AG, http://1und1.de | http://qooxdoo.org/license */
// Active reload support
if (typeof(qx_AR) === "undefined" ) {
  qx_AR = {
    CheckUrl : "{{check_url}}",
    TimeOut  : {{check_interval}},
    ScriptTags : [],  // should only ever be length 1
    tid : null,       // timer id

    script_callback : function script_callback(data) {
      var request = {status:200};
      if (data.changed == true) {
        qx_AR.doReloadIf(request);
      } else {
        if (console) {
          console.log(qx_AR.ScriptTags.length);
        }
        while (qx_AR.ScriptTags.length) {
          var el = qx_AR.ScriptTags.shift();
          el.parentNode.removeChild(el);
        }
      }
    },

    doReloadIf : function doReloadIf(request) {
      if (request.status == 200) {  // alternatively, 304 will be returned
        //console.log("reloading page...");
        window.document.location.reload();
      }
    },

    // cf. Wenz, JavaScript Phrasebook, p.206
    getXHR : function getXHR() {
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
    },

    fetchSentinel_stag : function fetchSentinel_stag() {
      var stag = document.createElement("script");
      stag.charset = "utf-8";
      stag.src = qx_AR.CheckUrl;
      qx_AR.ScriptTags.push(stag);
      document.body.appendChild(stag);
    },

    fetchSentinel : function fetchSentinel() {
      var request = qx_AR.getXHR();
      if (request!=null) {
        request.onreadystatechange = function (){
          if (request.readyState == 4 ) {
            qx_AR.doReloadIf(request);
          }
        }
        request.open("GET", qx_AR.CheckUrl);
        request.send(null);
      }
    },

    startTimer : function startTimer() {
       qx_AR.tid = setInterval(qx_AR.fetchSentinel_stag, qx_AR.TimeOut);
    }
  };

  qx_AR.startTimer();
}

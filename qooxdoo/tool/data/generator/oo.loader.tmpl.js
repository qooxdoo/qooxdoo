(function(){ 

if (!this.window) window = this;

if (!window.navigator) window.navigator = {
  userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; de; rv:1.9.0.19) Gecko/2010031218 Firefox/3.0.19", 
  product: "", 
  cpuClass: ""
}; 

if (!window.qx) window.qx = {};
  
if (!this.qxsettings) qxsettings = {};
var settings = %{Settings};
for (var k in settings) qxsettings[k] = settings[k];

qx.$$packageData = {};
qx.$$loader = {};
})();

%{BootPart}

if (typeof exports != "undefined") {for (var key in qx) {exports[key] = qx[key];}}
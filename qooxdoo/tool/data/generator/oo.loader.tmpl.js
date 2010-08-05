(function(){ 

if (!this.window) window = this;

if (!window.navigator) window.navigator = {userAgent: "", product: "", cpuClass: ""}; 

if (!window.qx) window.qx = {};
  
if (!this.qxsettings) qxsettings = {};
var settings = %{Settings};
for (var k in settings) qxsettings[k] = settings[k];

qx.$$packageData = {};
qx.$$loader = {};
})();

%{BootPart}
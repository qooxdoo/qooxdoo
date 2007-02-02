(function() {
var agent = navigator.userAgent;
var product = navigator.product;
if (window.opera && /Opera[\s\/]([0-9\.]*)/.test(agent)) {
	var client = "opera";
} else if (agent.indexOf("AppleWebKit") != -1 && /AppleWebKit\/([0-9-\.]*)/.test(agent)) {
	client = "webkit";
} else if (window.controllers && typeof product==="string" && product==="Gecko" && /rv\:([^\);]+)(\)|;)/.test(agent)) {
	client = "gecko";
} else if (/MSIE\s+([^\);]+)(\)|;)/.test(agent)) {
	client = "mshtml"
} else {
	client = "all"
}
document.write('<script type="text/javascript" src="%(path)s/%(name)s_'+ client +'.js"></script>');
})()
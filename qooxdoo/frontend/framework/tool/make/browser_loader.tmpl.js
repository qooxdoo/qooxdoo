(function() {
var agent = navigator.userAgent;
if (window.opera) {
	var client = "opera";
} else if (agent.indexOf("AppleWebKit") != -1) {
	client = "webkit";
} else if (agent.indexOf("Gecko/") != -1) {
	client = "gecko";
} else if (agent.indexOf("MSIE") != -1) {
	client = "mshtml"
} else {
	client = "all"
}
document.write('<script type="text/javascript" src="%(path)s/%(name)s_'+ client +'.js"></script>');
})();

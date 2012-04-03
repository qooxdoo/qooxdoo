/*
 * This is mock content and will be overwritten with the first 'generate.py source'.
 */
function inform(){
  var message = 
    "<div style='font-family: Verdana'>" + 
    "<h2>Application not yet ready!</h2>" + 
    "<div>Please use the generator to build this application, i.e. run <i>'generate.py'</i> in an OS shell, in the application folder; then reload this page.</div>" + 
    "</div>";

  window.setTimeout(function() {
    document.body.innerHTML = message;  
  }, 0);
}

if (window.attachEvent) {
  window.attachEvent("onload", inform);
} else {
  window.addEventListener("load", inform, false);
}

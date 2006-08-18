/**
 * Sample 3
 */
qx.OO.defineClass("custom.Application3", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);
});

qx.Proto.main = function(e)
{
  var r = new qx.io.remote.RemoteRequest("test.xml", "GET", "text/plain");

  r.addEventListener("completed", function(e) {
    alert("Loaded: \n\n" + e.getData().getContent());
  });

  r.send();
};

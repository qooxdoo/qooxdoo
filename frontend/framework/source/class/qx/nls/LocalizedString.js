/**
 * Create a new instance of qx.nls.LocalizedString
 */
qx.OO.defineClass("qx.nls.LocalizedString", qx.core.Object,
function(id, args) {
  qx.core.Object.call(this);

  this.setId(id);
  
  var storedArguments = [];
  for (var i=0; i<args.length; args++) {
    var arg = args[i];
    if (arg instanceof qx.nls.LocalizedString) {
      // defer conversion to string
      storedArguments.push(arg);
    } else {
      // force converstion to string
      storedArguments.push(arg + "");
    }
  }
  this.setArgs(storedArguments);
});


qx.OO.addProperty({ name: "id"});
qx.OO.addProperty({ name: "args"});


qx.Proto.toString = function () {
  return qx.nls.Manager.getInstance().translate(this.getId(), this.getArgs());
}


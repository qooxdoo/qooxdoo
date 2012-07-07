/*
 * This is mock content and will be overwritten with the first 'generate.py source'.
 */

if (typeof console == "undefined") console = {};
if (!console.log) console.log = function() {
    var out = java.lang.System.out;
    for (var i = 0; i < arguments.length; i++)
    out.print(arguments[i]);
    out.println();
};

var message = [];
message.push("\n");
message.push("Application not yet ready!\n");
message.push("  Please use the generator to build this application, i.e. run\n");
message.push("  'generate.py' in an OS shell, in the application folder; then\n");
message.push("  re-run this script.\n");

console.log.apply(null, message);

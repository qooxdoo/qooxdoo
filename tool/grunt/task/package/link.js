var exec  = require('child_process').exec;

var order = [
  "cd dependency; npm link; cd ..",
  "cd library; npm link; cd ..",
  "cd locale; npm link; cd ..",
  "cd resource; npm link; cd ..",
  "cd translation; npm link; cd ..",
  ];

child = exec(order.join(";"),
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
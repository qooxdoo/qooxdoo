var exec  = require('child_process').exec;

var order = [
  "cd dependency; npm install; cd ..",
  "cd library; npm install; cd ..",
  "cd locale; npm install; cd ..",
  "cd resource; npm install; cd ..",
  "cd translation; npm install; cd ..",
  ];

child = exec(order.join(";"),
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
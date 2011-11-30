/*
  Go through the test task numbering in the table and set it straight. 
  For this to work, table cells with a number need the 'name="number"'
  attribute, i.e. section headings and task entries. But then you can put in
  any suitable number, e.g. "2" for the section header and "2.1" for every
  task, and the script will transform it into proper ascending numbering
  over the whole table.
 */
function autonumbering() {
  var outer = 0;
  var inner = 1;
  var numbertags = document.getElementsByName("number");
  for (var i=0, l=numbertags.length; i<l; i++){
    var currtag = numbertags[i];
    var currval = currtag.firstChild.nodeValue;
    var num = parseFloat(currval);
    if (!isNaN(num)){
      var intpart = parseInt(currval);
      if (num == intpart){
        currtag.firstChild.nodeValue = ++outer
        inner = 1;
      } else {
        currtag.firstChild.nodeValue = outer + "." + inner++;
      }
    }
  }
}

function minitests(columns) {
  var slice = Array.prototype.slice;
  var minis = [];
  slice.call(document.querySelectorAll("tr.full"), 0).forEach(function(tr) {
    columns.forEach(function(column) {
      minis.push(tr.querySelector("td:nth-child(" + column + ")"));
    });
  });
  minis.forEach(function(mini) {
    if (mini !== null) {
      mini.textContent = "N/A";
    }
  });
}

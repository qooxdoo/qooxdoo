addSample("Array.every", {
  javascript: function() {
var a = [1, 2, 3, 4, 5];
a.every(function(item) {
  console.log(item);
  return item !== 3; // break the loop after 3
});
  },
  executable: true
});

addSample("Array.some", {
  javascript: function() {
var a = [1, 2, 3, 4, 5];
a.some(function(item) {
  console.log(item);
  return item == 3; // break the loop after 3
});
  },
  executable: true
});

addSample("Array.forEach", {
  javascript: function() {
var a = [1, 2, 3, 4, 5];
a.forEach(function(item) {
  console.log(item);
});
  },
  executable: true
});
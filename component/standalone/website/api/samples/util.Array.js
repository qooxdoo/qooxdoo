addSample("q.array.removeAll", function() {
  var array = ["foo", "bar"];
  q.array.removeAll(array);
});

addSample("q.array.equals", {
  javascript: function() {
    var a = [1,2,3];
    var b = [1,2,3];
    var c = [3,2,1];
    console.log(q.array.equals(a, b)); // true
    console.log(q.array.equals(a, c)); // false
  },
  executable: true
});

addSample("q.array.exclude", {
  javascript: function() {
    var a = [1,2,3,4];
    var b = [2,4];
    console.log(q.array.exclude(a, b)); // [1,3]
  },
  executable: true
});


addSample("q.array.max", {
  javascript: function() {
    var a = [1,2,4,3];
    console.log(q.array.max(a)); // 4
  },
  executable: true
});
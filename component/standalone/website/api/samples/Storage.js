addSample("q.localStorage.setItem", {
  javascript: function() {
    q.localStorage.setItem("myItem", 123);
    console.log(q.localStorage.getItem("myItem"));
  },
  executable: true
});

addSample("q.localStorage.getItem", {
  javascript: function() {
    q.localStorage.setItem("myItem", 123);
    console.log(q.localStorage.getItem("myItem"));
  },
  executable: true
});
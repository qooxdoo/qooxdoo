addSample("q.cookie.set", function() {
  q.cookie.set("someKey", "someValue", 365);
});

addSample("q.cookie.get", function() {
  var cookieValue = q.cookie.get("someKey");
});

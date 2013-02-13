addSample("q.messaging.on", function() {
  q.messaging.on("get", "/address/{id}", function(data) {
    var id = data.params.id; // 1234
    // do something with the id...
  },this);
});

addSample("q.messaging.onAny", function() {
  q.messaging.onAny("/address/{id}", function(data) {
    var id = data.params.id; // 1234
    // do something with the id...
  },this);
});

addSample("q.messaging.emit", function() {
  q.messaging.emit("get", "/address/1234"); // emit a message on the 'get' channel
});

addSample("q.messaging.remove", function() {
  q.messaging.remove(id); // id must be the return of an 'on' call
});

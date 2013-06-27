addSample("q.rest.resource", function() {
  // init
  // ----
  var resourceDesc = {
    "get": { method: "GET", url: "/photo/{id}" },
    "put": { method: "PUT", url: "/photo/{id}"}
  };
  var resource = q.rest.resource(resourceDesc);
  resource.setBaseUrl("http://example.org");

  // add listener (GET/PUT)
  // ----------------------
  resource.on("getSuccess", function(e) {
    // the response of a successful GET request
    console.log(e.response);
  });
  resource.on("getError", function(e) {
    // the response of a failing GET request
    console.log(e.response);
  });
  resource.on("putSuccess", function(e) {
    // the response of a successful PUT request
    console.log(e.response);
  });
  resource.on("putError", function(e) {
    // the response of a failing PUT request
    console.log(e.response);
  });

  // finally interact with resource
  // ------------------------------
  photo.get({id: 1});  // also possible: photo.invoke("get", {id: 1});

  // additionally sets request data (provide it as string or set the content type)
  // - in a RESTful environment this creates a new resource with the given 'id'
  photo.configureRequest(function(req) {
    req.setRequestHeader("Content-Type", "application/json");
  });
  photo.put({id: 1}, {title: "Monkey"});
});



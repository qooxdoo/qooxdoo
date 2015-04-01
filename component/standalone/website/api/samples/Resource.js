addSample("Resource", function () {
  var description = {
    "get": {method: "GET", url: "/photo/{id}"},
    "put": {method: "PUT", url: "/photo/{id}"},
    "post": {method: "POST", url: "/photos/"}
  };
  var photo = new qx.bom.rest.Resource(description);
// Can also be written: photo.invoke("get", {id: 1});
  photo.get({id: 1});

// Additionally sets request data (provide it as string or set the content type)
// In a RESTful environment this creates a new resource with the given 'id'
  photo.configureRequest(function (req) {
    req.setRequestHeader("Content-Type", "application/json");
  });
  photo.put({id: 1}, {title: "Monkey"});

// Additionally sets request data (provide it as string or set the content type)
// In a RESTful environment this adds a new resource to the resource collection 'photos'
  photo.configureRequest(function (req) {
    req.setRequestHeader("Content-Type", "application/json");
  });
  photo.post(null, {title: "Monkey"});
  // To check for existence of URL parameters or constrain them to a certain format, you can add a check property to the description. See .map() for details.

  var description = {
    "get": {method: "GET", url: "/photo/{id}", check: {id: /\d+/}}
  };
  var photo = new qx.bom.rest.Resource(description);
// photo.get({id: "FAIL"});
// -- Error: "Parameter 'id' is invalid"

//  If your description happens to use the same action more than once, consider defining another resource.

  var description = {
    "get": {method: "GET", url: "/photos"}
  };
// Distinguish "photo" (singular) and "photos" (plural) resource
  var photos = new qx.bom.rest.Resource(description);
  photos.get();
  //Basically, all routes of a resource should point to the same URL (resource in terms of HTTP). One acceptable exception of this constraint are resources where required parameters are part of the URL (/photos/1/) or filter resources. For instance:

  var description = {
    "get": {method: "GET", url: "/photos/{tag}"}
  };
  var photos = new qx.bom.rest.Resource(description);
  photos.get();
  photos.get({tag: "wildlife"})
});

addSample("resource.configureRequest", function () {
  res.configureRequest(function (req, action, params, data) {
    if (action === "index") {
      req.setRequestHeader("Accept", "application/json");
    }
  });
});

addSample("resource.map", function () {
  res.map("get", "GET", "/photos/{id}", {id: /\d+/});

  // GET /photos/123
  res.get({id: "123"});
});

addSample("resource.abort", function () {
  // Abort all invocations of action
  res.get({id: 1});
  res.get({id: 2});
  res.abort("get");

  // Abort specific invocation of action (by id)
  var actionId = res.get({id: 1});
  res.abort(actionId);
});
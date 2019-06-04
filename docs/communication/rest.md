REST (Representational State Transfer)
======================================

`qx.io.rest.Resource` allows to encapsulate the specifics of a REST interface. Rather than requesting URLs with a specific HTTP method manually, a resource representing the remote resource is instantiated and **actions** are invoked on this resource. A resource with its actions can be configured declaratively or programmatically.

> **note**
>
> When to use `qx.bom.rest.Resource`? Mostly `qx.io.rest.Resource` delegates to `qx.bom.rest.Resource` and adds some features on top. For **qx.Desktop** apps you probably want to use `qx.io.rest.Resource` but when developing an app/website with **qx.Website** only `qx.bom.rest.Resource` is available (i.e. exposed as website module).
>
> See the package description for a detailed comparison: [qx.bom.rest](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.rest) .

Configuring actions
-------------------

Given a REST-like interface with URLs that comply to the following pattern.

    GET      /photo/{id}
    PUT      /photo/{id}
    DELETE   /photo/{id}

    GET      /photos
    POST     /photos

Note `{id}` stands for a placeholder.

This interface comprises of two resources: `photo` and `photos`.

To declare the specifics of the REST interface declaratively, pass a description to the constructor.

    // Singular resource
    var photo = new qx.io.rest.Resource({
      // Retrieve photo
      get: {
       method: "GET",
       url: "/photo/{id}"
      },

      // Update photo
      put: {
        method: "POST",
        url: "/photo/{id}"
      },

      // Delete photo
      del: {
        method: "DELETE",
        url: "/photo/{id}"
      }
    });

    // Plural resource
    var photos = new qx.io.rest.Resource({
      // Retrieve list of photos
      get: {
       method: "GET",
       url: "/photos"
      },

      // Create photo
      post: {
        method: "POST",
        url: "/photos"
      }
    });

Or programmatically, for each action.

    var photo = new qx.io.rest.Resource();
    photo.map("get", "GET", "/photo/{id}");

Invoking actions
----------------

Once configured, actions can be invoked. They are invoked by calling a method that is dynamically added to the resource on configuration of the action.

    photo.get({id: 1});
    // Alternatively: photo.invoke("get", {id: 1});
    // --> GET /photo/1

    photos.get();
    // Alternatively: photos.invoke("get");
    // --> GET /photos

When an action is invoked, an appropriate request is configured and send automatically.

Parameters
----------

If the URL contains parameters, the position where the parameters should be inserted can be specified by using [URI templates](http://tools.ietf.org/html/draft-gregorio-uritemplate-07). Parameters are optional unless a check is defined. A default value can be provided.

    var photo = new qx.io.rest.Resource();
    photo.map("get", "GET", "/photo/{id}/{size=medium}", {id:  qx.io.rest.Resource.REQUIRED});

    photo.get({id: 1, size: "large"});
    // --> GET /photo/1/large

    photo.get({id: 1});
    // --> GET /photo/1/medium

    photo.get();
    // --> Error: Missing parameter 'id'

Data
----

Data that should be included in the request's body can be given as second parameter. All types accepted by [qx.io.request.AbstractRequest\#requestData](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.io.request.AbstractRequest~requestData) are supported.

    photo.put({id: 1}, {title: "Monkey"}); // URL encoded
    photo.put({id: 1}, "title=monkey"); // Raw

Note that the behavior changes when the request body content type is switched to `application/json`.

    photos.configureRequest(function(req) {
      req.setRequestHeader("Content-Type", "application/json");
    });

    photos.map("post", "POST", "/photos/{id}");
    photos.post({id: 1}, {location: "Karlsruhe"}); // JSON.stringify

Events
------

Events are fired by the resource when the request was successful or any kind of error occurred. There are general resource events and action specific events. Handlers receive a `qx.event.type.Rest` event that, among other properties, includes the response.

    photo.get({id: 1});
    photo.put({id: 1});

    // "success" is fired when any request associated to resource receives a response
    photos.addListener("success", function(e) {
      e.getAction();
      // --> "get" or "put"
    });

    // "getSuccess" is fired when the request associated to the get action receives a response
    photos.addListener("getSuccess", function(e) {
      e.getAction();
      // --> "get"
    });

If the same action should be invoked multiple times and the events fired for each request be handled differently, it is possible to remember the id of the action's invocation. The `Rest` event includes this id.

    var getPhotoId = photo.get({id: 1});
    var getLargePhotoId = photo.get({id: 1, size: "large"});
    photo.addListener("getSuccess", function(e) {
      if (e.getId() === getLargePhotoId) {
        // Handle large photo
      }
    });

Helpers
-------

Helpers make it easy to accomplish common tasks when working with requests.

-   **refresh(action)** Resend request associated to action. Uses parameters given before.
-   **poll(action, params)** Periodically invoke action.
-   **longPoll(action)** Use Ajax long-polling to update whenever new data is available.

Data binding
------------

A `qx.data.store.Rest` store can be attached to an action. Whenever a response is received, the model property of the store is updated with the marshaled response.

    var store = new qx.data.store.Rest(photos, "get");
    var list = new qx.ui.form.List();
    var controller = new qx.data.controller.List(null, list);
    store.bind("model", controller, "model");
    photos.longPoll("get");

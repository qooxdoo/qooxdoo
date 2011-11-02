REST (Representational State Transfer)
**************************************

.. note::

  This is an experimental feature.

``qx.io.rest.Resource`` allows to encapsulate the specifics of a REST interface. Rather than requesting URLs with a specific HTTP method manually, a resource representing the remote resource is instantiated and **actions** are invoked on this resource. A resource with its actions can be configured declaratively or programatically.

Configuring actions
===================

Given a REST-like interface with URLs that comply to the following pattern.

::

  GET      /photos           index       display a list of all photos
  POST     /photos           create      create a new photo
  GET      /photos/:id       show        display a specific photo
  PUT      /photos/:id       update      update a specific photo
  DELETE   /photos/:id       destroy     delete a specific photo

Note ``:id`` stands for a placeholder replaced by

The specifics of the REST interface can be expressed declaratively.

::

  var description = {
    index: {
     method: "GET",
     url: "/photos"
    },

    create: {
      method: "POST",
      url: "/photos"
    },

    show: {
      method: "GET",
      url: "/photos/:id"
    },

    update: {
      method: "PUT",
      url: "/photos/:id"
    },

    destroy: {
      method: "DELETE",
      url: "/photos/:id"
    }
  }

  var photos = new qx.io.rest.Resource(description);


Or programatically.

::

  var photos = new qx.io.rest.Resource();
  photos.map("index", "GET", "/photos");


Invoking actions
================

Once configured, actions can be invoked. They are invoked by calling a method that is dynamically added to the resource on configuration of the action.

::

  photos.index();
  // --> GET /photos

  photos.show({id: 1});
  // --> GET /photos/1

When an action is invoked, an appropriate request is configured and send automatically.

Events
======

Events are fired by the resource when the request was sucessful or any kind of error occured. There are general resource events and action specific events. Handlers receive a ``qx.event.type.Rest`` event that, among other properties, includes the response.

::

  photos.index();
  photos.show({id: 1});

  // "success" is fired when any request associated to resource receives a response
  photos.addListener("success", function(e) {
    e.getAction();
    // --> "index" or "show"
  });

  // "indexSuccess" is fired when the request associated to the index action receives a response
  photos.addListener("indexSuccess", function(e) {
    e.getAction();
    // --> "index"
  });

Helpers
=======

Helpers make it easy to accomplish common tasks when working with requests.

* **refresh(action)** Resend request associated to action. Uses parameters given before.
* **poll(action, params)** Periodically invoke action.
* **longPoll(action)** Use Ajax long-polling to update whenever new data is available.

Data binding
============

A ``qx.data.store.Rest`` store can be attached to an action. Whenever a response is received, the model property of the store is updated with the marshaled response.

::

  var store = new qx.data.store.Rest(photos, "index");
  var controller = new qx.data.controller.List();
  store.bind("model", controller, "model");
  photos.longPoll("index");

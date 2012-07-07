.. _pages/back-button_and_bookmark_support#back-button_and_bookmark_support:

Back-Button and Bookmark Support
********************************


.. note::

    This document is outdated and does not reflect the proposed way of working with %{Website}. The history module is still under development. As soon as the module is ready, this document will be updated as well.


.. _pages/back-button_and_bookmark_support#overview:

Overview
========

Many Ajax applications break the browser back button and bookmarking support. Since the main page is never reloaded, the URL of the application never changes and no new entries are added to the browser history.

Fortunately it is possible to restore the expected behavior with a JavaScript history manager like the one included with qooxdoo (`qx.bom.History <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.History>`_).

.. _pages/back-button_and_bookmark_support#adding_history_support_to_an_application:

Adding History support to an Application
========================================

To add history support to an application four basic steps are required:

  - identify application states
  - retrieve initial application state
  - add event listener to history changes
  - update history on application state changes

.. _pages/back-button_and_bookmark_support#identify_application_states:

Identify Application States
===========================

The first step to add history support to an Ajax application is to identify the application states, which should be added to the history. This state must be encoded into a string, which will be set as the fragment identifier of the URL (the part after the '#' sign).

What exactly the application state is depends on the application. It can range from coarse grained states for basic application navigation to fine grained undo/redo steps. The API viewer uses e.g. the currently displayed class as its state. 

.. _pages/back-button_and_bookmark_support#retrieve_initial_application_state:

Retrieve Initial Application State
==================================

At application startup the initial state should be read from the history manager. This enables bookmarks to specific states of the application, since the state is encoded into the URL. The URL ``http://api.qooxdoo.org#qx.bom.History`` would for example open the API viewer with the initial state of ``qx.client.History``.

This is the code to read the initial state (`getState API documentation <http://api.qooxdoo.org/#qx.bom.History~getState>`_):

::

    var state = qx.bom.History.getInstance().getState();

.. _pages/back-button_and_bookmark_support#add_event_listener_to_history_changes:

Add Event Listener to History Changes
=====================================

Each time the history changes by hitting the browser's back or forward button, the history manager dispatches a ``request`` event. The event object holds information about the new state. The application must add an event listener to this event and update the application state (`request API documentation <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.History~request>`_):

::

    // 'this' is a reference to your application instance
    qx.bom.History.getInstance().addListener("request", function(e) 
    {
      var state = e.getData();

      // application specific state update (= application code)
      this.setApplicationState(state);
    }, this);

.. _pages/back-button_and_bookmark_support#update_history_on_application_state_changes:

Update History on Application State Changes
===========================================

Every time the application state changes, the history manager must be informed about the new state. A state change in the API viewer would for example occur if the user selects another class (`addToHistory API documentation <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.History~addToHistory>`_).

::

    qx.bom.History.getInstance().addToHistory(state, title);

The first parameter is the state encoded as a string, which will be set as the URL fragment identifier. The second parameter is optional and may contain a string, which is set as the title of the browser window for this state.


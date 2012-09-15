.. _pages/tutorial_web_developers#Low-level_tutorial_for_web_developers:

Tutorial: Building Notifications
********************************

.. _pages/tutorial_web_developers#Introduction:

Introduction
============

In this tutorial we show some basic steps of using %{Website}. To do so, we build a simple notification system for web pages. The system should expose one method which brings up a bubble on the screen containing the notification message. The bubble should go away after a period of time. You might be familiar with `Growl for OSX <http://growl.info/>`__ which offers similar functionality.


.. _pages/tutorial_web_developers#Basics:

Basics
======

Let's get started! As %{Website} is a simple %{JS} file, we first need to `download the script file <http://demo.qooxdoo.org/%{version}/framework/q-%{version}.min.js>`__. After that, we're going to create a simple HTML file in the same directory as the downloaded script and include it:

.. code-block:: html

  <!DOCTYPE html>
  <html>
    <head>
      <title>%{Website} tutorial</title>
      <script type="text/javascript" src="q-%{version}.min.js"></script>
    </head>
    <body>
    </body>
  </html>

Having done that, you can load the page in your favorite browser and check if the title is there and the %{Website} library has been loaded. For instance, simply open a JavaScript console in your browser and see if ``q`` is defined. If so, we've completed the first step and can start building the application. 

Next, we need a script tag to place our code into. To keep it simple, we'll just put it in the head of the HTML page, right below the existing script tag.

.. code-block:: html

  <script type="text/javascript" charset="utf-8">
    // your code here...
    console.log("it works");
  </script>

The ``console.log`` statement in the script will show us if it works. Reloading the page should bring up the log message in the browser's console. Now it's time to formulate a simple plan covering the next steps. We should first create the popup we want to show, then we can implement the notify method and finally, we can add some demo code to showcase our work. The following code should be placed in the script tag to replace the previous content.

::

  // create the notification popup
  var popup;

  // create the notification API
  var notify = function(message, delay, callback) {
   // do the notifying
  }

  // DEMO
  notify("This is ...", 1000, function() {
   notify("... a %{Website} notification demo.", 2000);
  });

As you see, we've defined three arguments for the ``notify`` method:. First, the ``message`` to display, second a ``delay`` in milliseconds and finally a ``callback`` function, which will be executed as soon as the popup is gone. The demo code at the bottom shows how it should be used and should trigger two messages in sequence.

.. _pages/tutorial_web_developers#Popup:

Popup
=====

Let's take care of the popup now. This is where the %{Website} library comes in handy. The popup is going to be a simple div which can be added to the document's body. So we can do something like the following:

::

  var popup = q.create("<div>").appendTo(document.body);

This line line of code uses two essential methods of %{Website}. First, we create a new DOM element, which is wrapped in a collection. On that object, we call the ``appendTo`` method, which adds the newly created element to ``document.body``. Now, reloading the page... brings up an error!?! Sure, we added our script in the head of the HTML document, which means ``document.body`` is not yet ready when our code gets executed. We need to wait until the document is ready until we can start. %{Website} offers a convenient way to do that. We just wrap the code we've written in a function and give that to ``q.ready``:

::

  q.ready(function() {
    // ...
  });

Reloading the page, the error is gone but nothing else happens. How can we tell if it worked? Simple enough, we'll just style the div using CSS and make it visible. We won't go into any detail about the CSS here, so just copy and paste the following CSS rule into the HTML file's head section.

.. code-block:: css

  <style type="text/css" media="screen">
    .popup {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 150px;
      background-color: #aaa;
      color: white;
      padding: 10px;
      font-family: "Lucida Grande", "DejaVu Sans", "Verdana", sans-serif;
      font-size: 14px;
      border: solid 1px #000000;
    }
  </style>

Now, the only thing missing is to set the CSS class for the popup div. That's as easy as calling another method in our previous code.

::

  var popup = q.create("<div>").appendTo(document.body).addClass("popup");

Now reload and you should see the popup in the upper right corner. Hm, but the styling is not done, right? A real popup has rounded corners! But wasn't that one of the newer CSS keys which is usually vendor prefixed? Yes! That means, we need to add a declaration for every known browser. No, wait a second. IE and Opera don't use the vendor prefix which means we only need to add the unprefixed key and one additional key each for WebKit and Mozilla.

.. code-block:: css

  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;

That was a lot of work for something as simple as a border radius! But we could have achieved that far more easily. Using %{Website} to set the style will take care of all the vendor prefix stuff! Just set the style on the newly created popup and you're done.

::

  var popup = q.create("<div>").appendTo(document.body).addClass("popup").setStyle("border-radius", "5px");

That's about it for the popup. Looks good enough for the first prototype.

.. _pages/tutorial_web_developers#notify:

notify
======

Next, let's implement the notify method. We already added the function and only need to fill in the implementation. First, we want to set the message and show the popup. But we want to show the popup with some style and fade it in.

::

  var notify = function(message, delay, callback) {
    popup.setHtml(message);
    popup.fadeIn();
  };

That was easy. The first line simply applies the message as inner HTML of the popup. The second line fades in the popup. This simple fadeIn applies a CSS animation in all browsers supporting CSS animations. If the browser doesn't support CSS animations, the fade in is done using %{JS} so you don't need to worry about that either! Reload the page and see your message in the popup fading in.
As soon as the message is faded in, we should start a timer to trigger the fade out. But when does the animation end? Specifically for that, %{Website} offers an event named ``animationEnd`` which we can react to.

::

  popup.fadeIn().once("animationEnd", function() {
    console.log("end");
  });

Again, we used the native ``console`` API to check if our code works. Running the code now should show the "end" message in the console as soon as the popup is faded in. A little hint: Make sure you add the listener only once using the ``once`` method. We don't want to keep piling up listeners on the popup. Now we can start the timer which will be a simple ``setTimeout`` offered by the browser. As soon as the time is over, we can fade out.

::

  popup.fadeIn().once("animationEnd", function() {
    window.setTimeout(function() {
       popup.fadeOut();
    }, delay);
  });

Now we are almost there. The only thing missing is to execute the ``callback`` as soon as the fade out has ended. Again, we listen to the ``animationEnd`` event and call the callback. But as this should be an optional parameter, we should check its availability before executing.

::

  popup.fadeIn().once("animationEnd", function() {
    window.setTimeout(function() {
       popup.fadeOut().once("animationEnd", function() {
         callback && callback.call();
       });
    }, delay);
  });

Giving it a try should show both notification messages in sequence. Well done! We have implemented a (very) simple notification mechanism for web pages.


.. _pages/tutorial_web_developers#Summary:

Summary
-------
In this tutorial, we used a small part of the `%{Website} API <http://demo.qooxdoo.org/%{version}/website-api>`__. First, we saw parts of the Manipulating module with ``q.create`` and ``.appendTo``. After that, we used the CSS module with ``.setStyle`` and ``.addClass`` and the Attributes module with ``.setHtml``. ``.fadeIn`` and ``.fadeOut`` are part of the Animation module and ``.once`` is part of the Event module. There are more methods in the named modules and there are additional modules you can experiment with.

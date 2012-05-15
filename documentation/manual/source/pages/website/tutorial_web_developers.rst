.. _pages/tutorial_web_developers#Low-level_tutorial_for_web_developers:

Tutorial: Building Notifications
********************************

.. _pages/tutorial_web_developers#Introduction:

Introduction
============

In this tutorial, we want to show the basic steps using %{Website}. For that, we build a simple notification system for web pages. The system should offer one method which then brings up a bubble on the screen containing the notification message. The bubble should go away after a period of time. Some of you might know `growl for OSX <http://growl.info/>`__ which offer similar functionality for OSX.


.. _pages/tutorial_web_developers#Basics:

Basics
======

Let's get started! As %{Website} is a simple %{JS} file, we first need to download the script `here <http://demo.qooxdoo.org/devel/framework/q.min.js>`__. After that, we should create a simple HTML file next to the script file and include the script file:

.. code-block:: html

  <!DOCTYPE html>
  <html>
    <head>
      <title>%{Website} tutorial</title>
      <script type="text/javascript" src="q.min.js"></script>
    </head>
    <body>
    </body>
  </html>

Having that, you can load the page in your favorite browser and check if the title is there and the %{Website} library has been loaded. Simply open a console in your browser and see if ``q`` is defined. If so, we do have the first step done and can start building the application. Next, we need a script tag to place our code in. To keep it simple, we just put it in the head of the html page, right below the already added script tag.

.. code-block:: html

  <script type="text/javascript" charset="utf-8">
    // your code here...
    console.log("it works");
  </script>

I put a ``console.log`` statement in the script to see if its working. Reloading the page in the browser should bring up the log message in your browsers console. Now its time to set up a simple plan what we want to do. In general, we should first create the popup we want to show, then we can implement the notify method and at the end, we can put in some demo code to showcase our work. The following code should be placed in the script tag and can replace the former content.

::

  // create the notification popup
  var popup;

  // create the notification API
  var notify = function(message, delay, callback) {
   // do the notify
  }

  // DEMO
  notify("This is ...", 1000, function() {
   notify("... a %{Website} notification demo.", 2000);
  });

As you see, I have given the ``notify`` method three arguments. First, the ``message`` to display, second a ``delay`` in milliseconds and as last argument a ``callback`` method, which will be executed as soon as the popup is gone. The demo code at the bottom shows how it should be used and should trigger two messages in sequence.

.. _pages/tutorial_web_developers#Popup:

Popup
=====

Lets take care of the popup. Thats there the %{Website} library comes in handy. The popup should be a simple div which can be added to the documents body. So we can do something like the following:

::

  var popup = q.create("<div>").appendTo(document.body);

In this line of code, two essential methods of %{Website} has been used. First, we create a new DOM element, which is wrapped in a collection. On that object, we called the ``applyTo`` method which adds the newly created element to ``document.body``. Now reloading the page... brings up an error!?! Sure, we added our script in the head which means, ``document.body`` is not ready yet. We need to wait until the document is ready until we can start and %{Website} offers a way to do that. We just put the code we have written into a function and give that to ``q.ready``:

::

  q.ready(function() {
    // ...
  });

Reloading the page now does not show an error but nothing more. How can we tell if it worked? I suggest to simply style the div using CSS and make it visible. As I won't go into detail about the CSS, just copy and past the following CSS class into the HTML files head tag.

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

Now, the only thing missing is to set the CSS class for the popup div. Thats as easy as calling another method.

::

  var popup = q.create("<div>").appendTo(document.body).addClass("popup");

Now reload and see the popup in the upper right corner. Hm, but the styling is not done, right? A real popup has rounded corners! But wasn't that one of the newer CSS keys which is usually vendor prefixed? Yes! That means, we need to add a key for every known browser. No, wait a second. IE and Opera don't use the vendor prefix which means we only need to add the unprefixed key and additionally one key for webkit and mozilla.

.. code-block:: css

  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;

That was a lot of work for something simple as a border radius! But we could have achieved that more easy. Using %{Website} to set the style will take care of all the vendor prefix stuff! Just add the setting of the style to the popup creation and were done.

::

  var popup = q.create("<div>").appendTo(document.body).addClass("popup").setStyle("border-radius", "5px");

Thats about it with the popup. I think thats good enough for the first prototype.

.. _pages/tutorial_web_developers#notify:

notify
======

Next, lets implement the notify method. We already added the function and only need to fill in the implementation. First, we want to set the message and show the popup. But we want to show the popup with some style and fade it in.

::

  var notify = function(message, delay, callback) {
    popup.setHtml(message);
    popup.fadeIn();
  };

That was easy. The first line simply applies the message as inner HTML of the popup. The second line fades in the popup. This simple fadeIn applies a CSS animation in all browsers supporting CSS animations. If the browser doesn't support CSS animations, the fade in is done using %{JS} so you don't need to bother about that either! Reload the page and see your message in the popup fading in.
As soon as the message is faded in, we should start a timer to trigger the fade out. But when does the animation end? Especially for that, %{Website} offers an event named ``animationEnd`` on which we can react.

::

  popup.fadeIn().once("animationEnd", function() {
    console.log("end");
  });

Again, we used the ``console`` API to check if our code is working. Running the code now should show the end message in the console as soon as the popup is faded in. A little hint: Make sure you add the listener only once using the ``once`` method. We don't want to pile up all the listeners on the popup. Now we can start the timer which will be a simple ``setTimeout`` offered by the browser. As soon as the time is over, we can fade out.

::

  popup.fadeIn().once("animationEnd", function() {
    window.setTimeout(function() {
       popup.fadeOut();
    }, delay);
  });

Now we are already there. The only thing missing is to call the ``callback`` as soon as the fade out ended. Again, we listen to the ``animationEnd`` event and call the callback. But as this should be an optional parameter, we should check its availability before executing.

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
In this tutorial, we have used a small part of the %{Website} API. First, we have seen parts of the Manipulating module with ``q.create`` and ``.appendTo``. After that, we used the CSS module with ``.setStyle`` and ``.addClass`` and the Attributes module with ``.setHtml``. ``.fadeIn`` and ``.fadeOut`` are part of the Animation module and ``.once`` is part of the Event module. There are more method in the named modules as there are a lot of more modules you can experiment with.

.. _pages/widget/flash#flash:

Flash
******

Container widget for Flash. 


Control of Flash by JavaScript
------------------------------

A flash movie can be controlled in a certain extent directly from JavaScript with a `number of commands <http://www.adobe.com/support/flash/publishexport/scriptingwithflash/scriptingwithflash_03.html>`_.

These commands do not cover all Flash commands, so if you need more functionality you have to fuse an ActionScript with the Flash movie and start using the ExternalInterface to communicate.

To be able to use the JavaScript commands, three conditions must be full-filled:

1. the flash object must have been loaded to the DOM tree
2. the flash object must have received an id
3. the flash movie or document must have been enough loaded

To implement this functionality in Qooxdoo we have added two events listening on the loading process; "loading" and "loaded". While the event "loading" is firing the three conditions have not been full-filled, and therefore the commands can not be used. When "loaded" has fired, all three conditions are met and you can start communicating directly with the Flash object.

To know if it is possible to start using the commands, you have to test if it has been fully loaded; isLoaded(), else you get an error with a flashFE = null.

Here's an example that shows how you can control changing to previous frame of a flash movie.

::

    if(flashWidget.isLoaded())
    {
      var flashFE = flashWidget.getFlashElement();
      
      var currentFrame = flashFE.CurrentFrame();
      var totalFrames = flashFE.TotalFrames();
      
      var newFrame = parseInt(currentFrame) - 1;
      
      if(totalFrames > 0 && newFrame >= 0)
      {
        flashFE.GotoFrame(newFrame);
      }
    }

.. _pages/widget/flash#demos:

Demos
-----

Here's a `Flash demo <http://demo.qooxdoo.org/%{version}/demobrowser/index.html#widget-Flash.html>`_ of the widget.

.. _pages/widget/flash#api:

API
---

`API of the Flash Widget <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.ui.embed.Flash>`_

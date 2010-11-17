.. _pages/snippets#user_snippets:

User Snippets
*************

These code snippets have come mainly from the `mailing list <http://lists.sourceforge.net/lists/listinfo/qooxdoo-devel>`_. If you find a mistake in any of the snippets, or have an improvement, or have a snippet of your own, please ``Login`` to this wiki and edit these pages.

.. _pages/snippets#general:

General
=======

.. _pages/snippets#demo_browser:

Demo Browser
------------
The **Demo Browser** has a large number of simple examples. You can use the `online version <http://demo.qooxdoo.org/%{version}/demobrowser>`_ or if you've downloaded and :doc:`built the SDK <tool/generator_usage>`, you can use your local copy in ``application/demobrowser/build`` subdirectory of your SDK installation.

.. _pages/snippets#show_html_created_by_qooxdoo:

Show HTML created by qooxdoo
----------------------------

Sometimes you want to see the HTML created by qooxdoo to solve layout problems or track down bugs in qooxdoo.

In Firefox you can use the `Firebug extension <http://getfirebug.com>`_. "Inspect Element" allows you to click on any part of the page and see the XML and CSS that generated the element.

Otherwise this link will work in all browsers to show the XML tree for the current page:

::

    javascript:if (window.document.body.outerHTML != undefined){'<xmp>'+window.document.body.outerHTML+'</xmp>'} else if (document.getElementsByTagName("html")[0].innerHTML != undefined){'<xmp>'+document.getElementsByTagName("html")[0].innerHTML+'</xmp>'} else if (window.document.documentElement.outerHTML != undefined){'<xmp>'+window.document.documentElement.outerHTML+'</xmp>'} else { alert('Your browser does not support this functionality') };

There is also a simpler form for IE that will open up the XML in a new window:

::

    javascript:void(window.open("javascript:'<xmp>'+opener.window.document.documentElement.outerHTML+'</xmp>'"));

You can create a shortcut for this on the toolbar.

`See this Ajaxian article for the original source <http://ajaxian.com/archives/ie-tip-cheeky-way-to-see-the-current-state-of-the-page>`_.

.. _pages/snippets#running_a_source_version_from_a_web_server:

Running a Source Version from a Web Server
------------------------------------------

The basic programming model of qooxdoo suggests that you develop your application in its ``source`` version, and once you're satisfied create the ``build`` version of it, which is then deployed on a web server. qooxdoo's *build* versions of an application are self-contained, they encompass all script files, resources like images and style sheets, and any helper files that are necessary for the application. You can safely copy the *build* directory to the document forrest of a web server, or zip it up in an archive and send it by mail; the recipient will be able to unpack it and run the application without flaws.

In contrast, the *source* version is run off of the file system most of the time (i.e. opening it with the *file:* protocol in your browser). The source script just references source code and resources with relative paths, wherever they happen to be on your file system. This usually doesn't lend itself well to being run from a web server. Even if you include the *source* directory of your application in an server-accessible path (somewhere down from its DocumentRoot or one of the defined Aliases), chances are that the source script references files which are **outside** the document scope of the web server.

So if you find yourself in the situation where you need to run a *source* version of your app from a web server, mind the following hints:

* Make the *source* directory of your application accessible to the web server, so that it is reachable through a valid URL like *http://your.web.server/path/to/yourapp/source/index.html*.
* Make sure all components that are used by your application, as there are the qooxdoo SDK itself, and any additional qooxdoo library or contribution that you use, are equally accessible by the web server.

  * In the case of contribs referenced through the *contrib://* pseudo protocol in your application configuration, these are downloaded and stored in the download cache directory (config key :ref:`cache/downloads <pages/tool/generator_config_ref#cache>`), so make sure this path is included in your considerations.

* Make sure the relative paths on the web server match those on your file system, e.g. if your app lives on the file system at */a/b/A/myapp* and your qooxdoo installation is at */a/b/Z/qooxdoo-sdk* and the server path to your app is */web/apps/myapp* then make sure the server path to qooxdoo is */web/Z/qooxdoo-sdk* so that relative references like *../Z/qooxdoo-sdk* will work under the web server.

A simple way to achieve this is to map the DocumentRoot or an Alias to a directory in your file system that is *a common parent* to *all* involved qooxdoo components of your app.

.. _pages/snippets#relax_firefox_3_file_uri_restriction:

Relax Firefox 3 File URI Restriction
------------------------------------

Firefox 3 will by default employ a strict `same-origin-policy <http://en.wikipedia.org/wiki/Same_origin_policy>`_ concerning file URIs, ie. URIs loaded with the ``%%file://%%`` protocol. This can lead to errors when you run the *source* version of your app from the file system, particularly when your app uses :doc:`parts <development/parts_overview>`. In order to relax this strict policy for file URIs, enter ``about:config`` in the location bar of your browser and apply the following setting:

::

    security.fileuri.strict_origin_policy : false

.. _pages/snippets#coding:

Coding
======

.. _pages/snippets#center_a_window_on_screen:

Center a window on screen
-------------------------

Here is the solution:

..
  <button onclick="window.open('http://demo.qooxdoo.org/%{version}/playground#{code:\``+encodeURIComponent(this.parentNode.parentNode.getElementsByTagName('pre')[0].innerHTML.replace(/(<[^>]*?>|&amp;nbsp;)/g, ``)) + '\'}')">Run ...</button>

::

    var win = new qx.ui.window.Window();

    // first solution
    win.addListener("resize", function(){
      this.center();
    }, win);

    // second solution
    win.addListener("resize", win.center, win);

    this.getRoot().add(win);
    win.open();

This solution works even if we don't know the real size of the window, because it depends on its content.

Before the window is shown and know its real size, we place it at the center. We use the ``resize`` event instead of the ``appear`` event to prevent any flickering, because when using the ``appear`` event the window is already visible and then moved to the center. With the ``resize`` you can center the window right after the inserting in the DOM (the widget resizes) and avoid any flickering.

.. _pages/snippets#focus_a_widget_inside_a_window:

Focus a widget inside a window
------------------------------

Here is the solution:

::

    var win = new qx.ui.window.Window();
    win.setLayout(new qx.ui.layout.Canvas);
    var field = new qx.ui.form.TextField;
    win.add(field)

    field.focus();
    this.getRoot().add(win);
    win.open();

Setting the focus at the textfield widget is done in a post-process, so you do not have to use any event listener methods to achieve this.

.. _pages/snippets#implement_a_context-menu:

Implement a context-menu
------------------------

Implementing a context-menu is as easy as never before. 

::

    var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
    container.setPadding(20);
    this.getRoot().add(container);

    ...

    var list = new qx.ui.form.List;
    list.setContextMenu(this.getContextMenu());
    container.add(list);

    ...

    getContextMenu : function()
    {
       var menu = new qx.ui.menu.Menu;

       var cutButton = new qx.ui.menu.Button("Cut", "icon/16/actions/edit-cut.png", this._cutCommand);
       var copyButton = new qx.ui.menu.Button("Copy", "icon/16/actions/edit-copy.png", this._copyCommand);
       var pasteButton = new qx.ui.menu.Button("Paste", "icon/16/actions/edit-paste.png", this._pasteCommand);

       cutButton.addListener("execute", this.debugButton);
       copyButton.addListener("execute", this.debugButton);
       pasteButton.addListener("execute", this.debugButton);

       menu.add(cutButton);
       menu.add(copyButton);
       menu.add(pasteButton);

       return menu;
    }

This little code snippet is taken from the `online demo <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Menu.html>`_. Just right-click at the list.

.. _pages/snippets#disable_the_browser_context_menu:

Disable the browser context menu
--------------------------------

qooxdoo does show the default right-click browser menu. How can I disable it?

::

    qx.core.Init.getApplication().getRoot().setNativeContextMenu(false);

.. _pages/snippets#problems_with_this_in_event_handlers:

Problems with "this" in event handlers
--------------------------------------

How do I ensure that the correct "this" is referred to in an event handler? Say you have an event-handler within a custom widget which looks like this:

::

    _someHandler : function(e) {
    	alert(this);
    }

and then later within the same class definition, register a handler with another class instance:

::

    var anotherWidget = new AnotherWidget();
    anotherWidget.addListener("changeSomething", this._someHandler);

When the handler gets triggered by a "changeSomething" event, the alert of the handler is being called. However, there is a problem in that 'this' now refers to an object of class AnotherWidget and not to the instance of MyWidget. To solve this problem, use:

::

    anotherWidget.addListener("changeSomething", this._someHandler, this);

.. _pages/snippets#transparent_colors:

Transparent colors
------------------

To set a transparent color for any widget do the following:

::

    // text color
    myWidget.setTextColor("transparent");

    // background color
    myWidget.setBackgroundColor("transparent");

As the ``transparent`` color is part of every color theme in qooxdoo, you set this color by simply use this string.

.. _pages/snippets#user-defined_data:

User-defined data
-----------------

Storing any arbitrary value in a qooxdoo object.

You can store arbitrary user-defined data in any qooxdoo object using the ``setUserData`` and ``getUserData`` methods. These are guaranteed not to conflict with qooxdoo or javascript properties of the object. Note that as qooxdoo events are derived from ``qx.event.type.Event`` which extends ``qx.core.Object``, you can store user-defined data in events as well.

For example:

::

    MyObject.setUserData("MyData", "123");
    MyObject.debug("MyData = " + MyObject.getUserData("MyData"));

.. _pages/snippets#modal_windows:

Modal windows
-------------

Modal windows are windows which have to be closed (e.g. via it's buttons like "OK" or "Cancel") before any other UI element can be used. In qooxdoo a special blocker element is used to prevent user actions on other elements than the open modal window. The blocker element can be styled (e.g. it can have an semi-transparent background) to accent that the window is a modal one.
The blocker is included in every root widget (`qx.ui.root.Application <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Application>`_, `qx.ui.root.Inline <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Inline>`_, `qx.ui.root.Page <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.root.Page>`_) and in `qx.ui.window.Desktop <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.window.Desktop>`_.

::

    this.getApplicationRoot().set({
      blockerColor: '#bfbfbf',
      blockerOpacity: 1.2
    });

If you want to use this feature not inside a widget based object but inside a qx.application.Standalone, use this.getRoot() instead of this.getApplication.Root().

.. _pages/snippets#add_a_flash_movie_to_a_window:

Add a flash movie to a window
-----------------------------

This short snippet also applies if just want to add a flash movie to your qooxdoo application.

::

    var doc = this.getRoot();

    var win = new qx.ui.window.Window("Window");
    win.setLayout(new qx.ui.layout.Canvas());
    doc.add(win, {top: 20, left: 20});

    var layout = new qx.ui.layout.Basic();
    var container = new qx.ui.container.Composite(layout);
    container.set({ width: 400, height: 400 });
    win.add(container);

    win.addListener("appear", function() 
    {
       var domElement = container.getContentElement().getDomElement();
       var flash = qx.bom.Flash.create(domElement, FLASH_URL, "flashMovie");
    });

    win.open();

.. _pages/snippets#table_celleditors:_stop_editing_on_value_change:

Table Celleditors: Stop editing on value change
-----------------------------------------------

As default behaviour the cell editors of the table widget are stop the editing mode whenever the user clicks at any other cell. Anyway sometimes the users want to be able to stop the editing whenever the value has changed, e.g. if  they pick another item out of the list of a combobox.
To achieve this you can add the following to the cell editor classes

::

    // this snippet targets the ComboBox cell editor
    // this approach should also work for the other cell editors

    createCellEditor : function(cellInfo)
    {
       ...

       cellEditor.addListener("changeValue", function()
      {
         cellInfo.table.stopEditing();
      }, this);

      ...
    }

.. _pages/snippets#enabling_drag_and_drop_in_virtual_widgets:

Enabling drag and drop in virtual widgets
-----------------------------------------

To enable drag and drop features at virtual widgets you currently have to manipulate framework methods directly. The issues with drag and drop in virtual widgets will be addressed with the `Bug #1215 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=1215>`_

::

    // patch the "supportsDrop" method
    qx.ui.core.Widget.prototype.supportsDrop = function(dragCache)
    {
      var supportsDropMethod = this.getSupportsDropMethod();

      if (supportsDropMethod !== null) {
        return supportsDropMethod.call(this, dragCache);
      }

      return true;
    };

    // patch the "getDropTarget" method
    qx.event.handler.DragAndDropHandler.prototype.getDropTarget = qx.core.Variant.select("qx.client",
    {
      "gecko" : function(e)
      {
        var vCurrent = e.getTarget();

        //        if (vCurrent == this.__dragCache.sourceWidget) {
        //          vCurrent = qx.event.handler.EventHandler.getTargetObject(qx.html.ElementFromPoint.getElementFromPoint(e.getPageX(), e.getPageY()));
        //        } else {
        vCurrent = qx.event.handler.EventHandler.getTargetObject(null, vCurrent);

        //        }
        while (vCurrent != null)
        {
          if (!vCurrent.supportsDrop(this.__dragCache)) {
            return null;
          }

          if (this.supportsDrop(vCurrent)) {
            return vCurrent;
          }

          vCurrent = vCurrent.getParent();
        }

        return null;
      },

      "default" : function(e)
      {
        var vCurrent = e.getTarget();

        while (vCurrent != null)
        {
          if (!vCurrent.supportsDrop(this.__dragCache)) {
            return null;
          }

          if (this.supportsDrop(vCurrent)) {
            return vCurrent;
          }

          vCurrent = vCurrent.getParent();
        }

        return null;
      }
    }),

.. _pages/snippets#finding_out_which_qooxdoo_widget_generated_a_given_dom_element:

Finding out which qooxdoo widget generated a given DOM element
--------------------------------------------------------------

I have found this useful for testing with `Selenium <http://seleniumhq.org/>`_. If you have a native DOM element and want to find out which qooxdoo widget it is, use the following code, (I only tried it in qooxdoo 1.2).

::

    getQooxdooClassName: function (domElement)
          {
               if (!qx) return; // this is not a qooxdoo frame
                if (domElement.$$hash)
                {
                      var qxWrapper = qx.core.ObjectRegistry.__registry[domElement.$$hash];
                      if (qxWrapper.__attribValues && qxWrapper.__attribValues["$$widget"])
                      {
                            var wid = qxWrapper.__attribValues["$$widget"]; // widgetId
                            var widget = qx.core.ObjectRegistry.__registry[wid];
                            return widget.classname
                      }
                }
                // the domElement has no qooxdoo counterpart - returns `undefined`
          };

.. _pages/snippets#display_contextual_help_inside_a_tooltip:

Display contextual help inside a toolTip
----------------------------------------

*Contributed by Farid Elyahyaoui*

Suppose you like to display a contextual help inside a toolTip widget by requesting the help contents dynamically with the help of a XMLHttp request. This little snippet could be a good entry point.

::

    this._help = new qx.ui.basic.Image("icon/16/actions/help-contents.png");
    this.getRoot().add(this._help);

    this._helpToolTip = new qx.ui.tooltip.ToolTip('the <b>initial html</b> code');
    this._helpToolTip.set({ rich: true, showTimeout: 200 });
    this._help.setToolTip(this._helpToolTip);

    // only get the help content once
    this._help.addListenerOnce("mouseover", this.onHelpMouseOver, this);

    this.onHelpMouseOver = function(e)
    {
      var req = new qx.io.remote.Request("path/to/help.txt");
      req.addListener("completed", this.onHelpRequestCompleted, this);
      req.send();
    };

    this.onHelpRequestCompleted = function(e)
    {
      var content = e.getContent();
      this._helpToolTip.setLabel(content);
    };

.. _pages/snippets#adding_scrollbars_to_a_desktop_widget:

Adding scrollbars to a Desktop widget
-------------------------------------

By default a Desktop widget does not display scrollbars if a wiget get positioned (partly) outside the visible area of the Desktop. If you want to have scrollbars, you have to configure the Manager of the Desktop:

::

    var windowManager =  new qx.ui.window.Manager().set({
      allowShrinkX : false,
      allowShrinkY : false
    });
    var desktop = new qx.ui.window.Desktop(windowManager);

.. _pages/snippets#activate_the_focus_handler_at_low-level:

Activate the focus handler at low-level
---------------------------------------

Consider the following setup: A low-level widget which tries to listen to key input events at a e.g. native input element. If you develop your low-level application with extending the ``qx.application.Simple`` framework class everything is fine and you're done. However, if you choose to develop a stand-alone low-level widget/application which does **not** extend the simple application class you have to activate the focus handler for yourself.

::

    if (qx.Class.isDefined("qx.event.handler.Focus"))
    {
      qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);
    }

You probably think: so why do you need to do this?

The reason is that the focus handler is not created at startup rather at the
first key events dispatched by the user actions. Since the focus handler is not
available at the time the user focusses the input element at the first time it
cannot set this element as the active one and does not delegate the events to
this element.
The events are fired at the BODY element (which is the fallback if no element
is active).

.. _pages/snippets#keypress_and_keyup_listener_at_input_elements:

keypress and keyup listener at input elements
---------------------------------------------

.. note::

    This snippet is about low-level functionality when adding listener to e.g. *input* elements. The high-level textfield widget does provide the *input* event for monitoring the value changes.

Suppose you like to get informed when the user types into a certain input element you probably dealing with the question: should I use the *keypress* or the *keyup* event listener?

These code snippet should help you with your decision:

::

    var inputEl = document.getElementById("input");

    // suppose the user is inserting the value "a" 
    // into the empty input element

    inputEl.addListener("keypress", function(e){
      // "this" refers to the input element
      this.debug(this.value);

      // -> value == ""
    });

    inputEl.addListener("keyup", function(e){
      // "this" refers to the input element
       this.debug(this.value);

      // -> value == "a"
    });

The interesting thing is that the *keypress* event is fired **before** the input element receives the value, so you can't use the *keypress* event to check for the correct value. You have access to the inserted character by *e.getKeyIdentifier()* but you can't know where the character is inserted.

The *keyUp* event on the other hand does get you the right value because this event is fired **after** the value is inserted.
Drawback for the *keyup* listener: if the user holds the key only **one event** is fired at the end.

.. _pages/snippets#reducing_requests_when_using_the_remote_table_model:

Reducing requests when using the Remote Table Model
---------------------------------------------------

.. note::

    As of r19372, the actions suggested in this snippet are no longer required. The mutex %%__loadRowCountRequestRunning%% has been added within qx.ui.table.model.Remote to prevent multiple concurrent calls to the user’s _loadRowCount() method. To revert to the original behavior, set the remote model's property blockConcurrentLoadRowCount to *false*.

This snippet is assuming you've already read the article about :doc:`/pages/widget/table_remote_model`.

Normally the remote table model does fire several requests when starting up to retrieve the information about the row count. 
Since several table components need this value they are requesting this value on their own resulting in multiple requests to the backend (as long as the value is retrieved and stored).

To omit this behaviour you can only allow one request for the row count to be fired and blocking all other requests.

::

    members : {
      __loadRowCountRequestRunning : false,

      // overloaded - called whenever the table requests the row count
      _loadRowCount : function()
      {
        if (!this.__loadRowCountRequestRunning)
        {
          // Call the backend service (example) - using XmlHttp 
          var url  = "http://localhost/services/getTableCount.php";
          var req = new qx.io.remote.Request(url, "GET", "application/json");

          // Add listener
          req.addListener("completed", this._onRowCountCompleted, this);

          // send request
          req.send();

          // setting the flag
          this.__loadRowCountRequestRunning = true;
        }
      },

      // Listener for request of "_loadRowCount" method
      _onRowCountCompleted : function(response)
      {
         // Resetting the flag
         this.__loadRowCountRequestRunning = false;

         var result = response.getContent();
         if (result != null)
         {
            // Apply it to the model - the method "_onRowCountLoaded" has to be called
            this._onRowCountLoaded(result);
         }
      }
    }

.. _pages/snippets#integrating_maps_google,_yahoo,_openlayers,_...:

Integrating Maps (Google, Yahoo, OpenLayers, ...)
-------------------------------------------------

It should be pretty straightforward to integrate qooxdoo with free map software. Here are some pointers that should get you started for integrating with ...

* `Yahoo maps <http://n2.nabble.com/yahoo-maps-breaks-qooxdoo-tp3271487p3274572.html>`_
* `Google maps <http://old.nabble.com/embedding-google-maps-td24805482.html>`_
* `OpenStreetMap <http://old.nabble.com/Openstreet-map-td24932920.html>`_
* `OpenLayers <http://old.nabble.com/integrating-openlayers-with-qooxdoo-td22417744.html>`_

.. _pages/snippets#using_a_bom_application_inside_a_frameset_in_ie:

Using a BOM application inside a frameset in IE
-----------------------------------------------

If you plan to use a BOM application inside a frameset you have to be aware of some IE-specific behaviour. All versions of IE do fire the ``ready`` event *before* the listener can be attached to the window object.
However below is a solution to deal with this behaviour.

::

    qx.event.Registration.addListener(window, "ready", function() { alert(1); });

    if (qx && qx.event && qx.event.Registration)
    {
      var manager = qx.event.Registration.getManager(window);
      var handler = manager.findHandler(window, "ready");

      if (handler.isApplicationReady()) {
         alert("application ready");
      }
    }
    
.. _pages/snippets#capturing_caps_lock:

Capturing Caps Lock
-----------------------------------------------

If you try to detect a caps lock you can use for example this `algorithm <http://24ways.org/2007/capturing-caps-lock>`_, but keep care the algorithm doesn't work with umlauts etc.

Here the qooxdoo equivalent:

::

  var textField = new qx.ui.form.TextField();
  var capsLock = new qx.ui.form.CheckBox("Caps lock");

  var doc = this.getRoot();
  doc.add(capsLock , {left: 100, top: 25});
  doc.add(textField, {left: 100, top: 50});

  textField.addListener("keyinput", function(e) {
    var charCode = e.getCharCode();
    var shiftPressed = e.isShiftPressed();
  
    // Keep care the algorithm doesn't work with umlauts etc. 
    if (((charCode >= 65 && charCode <= 90) && !shiftPressed) ||
       ((charCode >= 97 && charCode <= 122) && shiftPressed)) {
      capsLock.setValue(true);
    } else {
      capsLock.setValue(false);
    }
  });


.. _pages/snippets#tooling:

Tooling
=======

.. _pages/snippets#create_client-specific_variants_of_your_application:

Create client-specific variants of your application
---------------------------------------------------

Suppose you have a client-detection at your site and you want to serve your visitors a client-specific version of your application. To achieve this goal you can use the powerful generator. You only have to create a custom configuration and you're done.

::

    {
      // normal skeleton configuration
      // left out for simplicity

      /* the "jobs" section is the interesting part */
      "jobs" :
      {
         "build-script" :
        {
          /* adding the variants */
          "variants" :
          {
            "qx.client" : [ "gecko", "mshtml", "webkit", "opera" ]
          },

          "compile-options" : 
          {
            "paths" :
            {
               /* overwrite "file" entry to get client-specific file names */
               "file" : "${BUILD_PATH}/script/${APPLICATION}-{qx.client}.js"
            }  
          }
        }
      }
    }

.. _pages/snippets#support_for_finding_potential_memory_leaks:

Support for finding potential memory leaks
------------------------------------------

You know that :doc:`/pages/development/memory_management` is an important task and you would like to check your application against potential memory leaks? Then read on :)

The best way to achieve this is to create a new job by extend the existing ``source`` job. This lets you easily switch between your normal development and a special version of your application to track down memory issues.

::

    {
      "jobs" :
      {
        // existing jobs ...

        "source-disposerDebug" : 
        {
          "desc" : "source version with 'qx.disposerDebugLevel' for destruct support",

          "extend" : [ "source" ],

          "settings" :
          {
             "qx.disposerDebugLevel" : "1"
          }
        }
      }
    }

That's all.

If you like you can add the ``source-disposerDebug`` to your ``export`` list to make this job public. If you run ``./generate.py ?`` this job will show up in the list with the given description.

When you generated your application with the ``source-disposerDebug`` job all you have to run is

::

    qx.core.ObjectRegistry.shutdown();

at the Firebug console. This starts the destruct mechanism of your application and you can analyze the given messages to improve your application. Usually, there is not much to see because we can not check for some of the critical stuff. So be sure to read :doc:`/pages/development/memory_management` documentation.

.. _pages/snippets#compress_qooxdoo_without_mod_deflate:

Compress qooxdoo without mod_deflate
------------------------------------

This explains how to enable a gzipped qooxdoo.js without having this possibility directly built in to your webserver.

If you have php at the server, you can write in your html file:

::

    <script type="text/javascript" src="<<path>>/qooxdoo.php"></script>

Then you create a file called qooxdoo.php with this content:

::

    <?php
       /**
       * @author     Oliver Vogel <o.vogel@muv.com>
       * @since      05.03.2006
       */
       $encodings = array();
       if (isset($_SERVER['HTTP_ACCEPT_ENCODING']))
       {
           // Get all available encodings
           $encodings = explode(',', strtolower(preg_replace("/\s+/", "", $_SERVER['HTTP_ACCEPT_ENCODING'])));
             // Check for gzip header
           if (in_array('gzip', $encodings))
           {
               // found: send the zip-ed file
               header("Content-Encoding: gzip");
               echo file_get_contents(getenv('DOCUMENT_ROOT') . '<<path>>/qooxdoo.js.gz');
               die;
           }
       }

       // Encoding not found or gzip not accepted -> send "normal" file
       echo file_get_contents(getenv('DOCUMENT_ROOT') . '<<path>>/qooxdoo.js');
       die;
    ?>

This page checks if the browser supports gzip. If this is true, the server sends the gzip file to the client. This solution needs no gzip-support at the server-side!

Also, if you are writing your own webserver it is trivial to include this feature directly.

I know, it is NOT JavaScript but maybe it is a good idea to add this to the qooxdoo distribution (and it may be a good idea if one with Python or Perl or other experience ports this script to another server-side programming language).

`Contributed by Oliver Vogel, here <http://www.nabble.com/speed-up-loading-time-of-qooxdoo-t1234762.html>`_.

.. _pages/snippets#setting_a_different_application_root:

Setting a different application root
------------------------------------

See :doc:`separate document <snippets/setting_a_different_application_root>`.

.. _pages/snippets#setting_a_different_main_application_class:

Setting a different main application class
------------------------------------------

If you want to have a different class as the main class of your application, this is what you have to do:

*(version 0.8.3+)*

In the global *let* section of your config file, add the "APPLICATION_MAIN_CLASS" macro:

::

    {
      "let" : {
        "APPLICATION_MAIN_CLASS" : "<namespace>.<ClassName>",
        ...
      }
    }

*(version <0.8.3)*

You have to tweak two keys in your configuration:

  * you have to override the *include* key of the compile jobs
  * you have to override the *qx.application* setting

In a GUI skeleton you could achieve this like so:

::

    {
      ...
      "jobs" : {
        "common" : {
           "=include" : ["${QXTHEME}", "<namespace>.<ClassName>"],
           "settings" : { "qx.application" : "<namespace>.<ClassName>"}
        }
      }
    }

The ``=`` in front of the *include* key is important, since you need to overrride the whole list of included names.

.. _pages/snippets#adding_non-qooxdoo_code_to_your_application:

Adding non-qooxdoo code to your application
-------------------------------------------

At times you might need to incorporate code into your qooxdoo application that for some reason cannot be clad in qooxdoo class code, e.g. because it is code you don't maintain yourself or which is used across several projects.

As of today, there is no complete integration of foreign code into a qooxdoo application. But here are some hints:

  * You can compress and optimize non-qooxdoo code using the ``tool/bin/compile.py`` frontend of the compiler. compile.py works on individual files. Use ``compile.py --help`` to familiarize yourself with the options. You have to capture the output into a file.
  * You can use the *:ref:`copy-files <pages/tool/generator_config_ref#copy-files>`* config key, to copy JS files between source and build version.
  * To integrate the code in your application, you can use ``<script>`` tags in your index.html. In your qooxdoo class code you can then access the classes and functions provided by the foreign JS code module.
  * Have a look at the code of the `Playground <http://qooxdoo.svn.sourceforge.net/viewvc/qooxdoo/tags/release_0_8_2/qooxdoo/application/playground/>`_ application that uses CodeMirror code.

.. _pages/snippets#using_complex_name_spaces:

Using complex name spaces
-------------------------

Increasingly, people use complex name spaces in their applications, e.g. following the Java style with name spaces like ``org.myorg.webclient.utils``. See this :doc:`separate document <snippets/using_complex_namespaces>` for more details on using complex name spaces.

.. _pages/snippets#creating_an_apiviewer_that_covers_all_used_libraries/contributions:

Creating an Apiviewer that covers all used libraries/contributions
------------------------------------------------------------------

You can create a local version of the `Apiviewer <http://qooxdoo.org/application#api_viewer>`_ application by running ``:ref:`generate.py api <pages/tool/generator_default_jobs#api>``` in your application. By default, though, only your own application classes and the framework classes are taken into account and displayed in the generated Apiviewer. If you are using additional qooxdoo libraries and/or contributions in your application (which requires you to list them in the ``libraries`` job in your config), and want them included in a local Apiviewer, you have to overwrite the :doc:`API_INCLUDE <tool/generator_config_macros>`  macro, to get the lib classes documented in Apiviewer. Add this to your config.json's ``let`` section:

::

    API_INCLUDE : ["qx.*","${APPLICATION}.*", "lib1.*", "contrib2.*"]

The first two, ``"qx.*"`` and ``"${APPLICATION}"``, should always be in; then, add the name spaces of  libs/contribs as desired, to have the data in the generated Apiviewer.

.. _pages/snippets#finding_your_system-wide_tmp_directory:

Finding your System-wide TMP Directory
--------------------------------------

If you are using the default settings, the cache path for your generator runs is under a system-wide TMP directory. The path to this TMP directory is system-dependend (e.g. under Linux, it is usually /tmp, and on some Windows version, it might be under C:\TEMP). To find out which path is used on your particular system, use the following shell command:

::

    python -c "import tempfile; print tempfile.gettempdir()"


Further Individual Snippets
===========================

.. toctree::
   :maxdepth: 1

   snippets/toctree

.. The next section was commented out in the wiki page
..
  * :doc:`snippets/using_gsoap_and_wsdl_with_qooxdoo` 
  * :doc:`snippets/using_cpaint_with_qooxdoo`
  * :doc:`snippets/comboboxex_in_gridlayout`
  * :doc:`snippets/rounded_borders`
  * :doc:`snippets/treevirtual_draganddrop_mixin`
  * :doc:`snippets/simple_jsonrpc_testpage`
  * :doc:`snippets/simple_iframe_progress_bar_for_jsonrpc`
  * :doc:`snippets/communicating_with_the_system_clipboard`
  * :doc:`snippets/multi_window_application`
  * :doc:`snippets/asynchronous_user_interaction`

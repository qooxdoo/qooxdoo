Using themes of contributions in your application
*************************************************

<note>This tutorial assumes you are using the latest GUI skeleton template which contains pre-defined theme classes.</note>

Contributions are a powerful and easy way to enhance your application with e.g. widgets that had not (yet) found the way into the qooxdoo core framework. Nevertheless it is a no-brainer to use them in your application.

But if a contribution is providing its own theme (in most cases its own appearance theme) you have to manage this manually. 

<note>A bug report to make this step superfluous is already filed ( see `#1591 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=1591>`_ ), but in the meantime you can stick with this little tutorial to get things done.</note>

For an easiser understanding this tutorial explains the necessary setup at the example of the `TileView <http://qooxdoo.org/contrib/project#tileview>`_ widget.

Adjust your configuration
=========================

The interesting part of the ``config.json`` looks like this:

::

    ...
    "jobs" :
      {
        "libraries" :
        {
          "library" :
          [
            {
              "manifest" : "contrib://TileView/trunk/Manifest.json"
            },
           // as the tileView uses internally the FlowLayout you have
           // to add this to set it up correctly
           {
              "manifest" : "contrib://FlowLayout/trunk/Manifest.json"
            }
          ]
        }
      }
    ...

Include appearance theme
========================

If you use the latest GUI skeleton template you will get an own appearance theme class (among all other theme classes) already setup for you. All you need to do is to include the appearance class provided by the ``TileView`` widget into your own appearance class.

Include the ``TileView`` appearance:

::

    qx.Theme.define("yourApp.theme.Appearance",
    {
      extend : qx.theme.modern.Appearance,

      // this include key does the magic
      include : tileview.theme.Appearance,

      // overwrite the appearances to customize the look of the modern theme
      // usually not needed
      appearances :
      {
      }
    });

So all you need to add is this little ``include`` key with the corresponding appearance class to include it into your application.

Known issues
------------

The following code which could reside in your ``Application`` class **won't** work:

::

    qx.Theme.include(qx.theme.modern.Appearance, tileview.theme.Appearance);

The reason is that this include above will be resolved at **runtime** which does not work anymore. The first solution is resolved at **loading time**, so the include is already performed at startup.
This issue is already file under `#1604 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=1604>`_.
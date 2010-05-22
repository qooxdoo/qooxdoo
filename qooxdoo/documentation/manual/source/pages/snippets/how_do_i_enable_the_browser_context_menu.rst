How do I disable the browser context menu?
******************************************

qooxdoo does show the default right-click browser menu. How can I disable it?

::

    qx.core.Init.getApplication().getRoot().setNativeContextMenu(false);


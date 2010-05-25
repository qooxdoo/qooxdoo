.. _pages/snippets/how_do_i_enable_the_browser_context_menu#how_do_i_disable_the_browser_context_menu:

How do I disable the browser context menu?
******************************************

qooxdoo does show the default right-click browser menu. How can I disable it?

::

    qx.core.Init.getApplication().getRoot().setNativeContextMenu(false);


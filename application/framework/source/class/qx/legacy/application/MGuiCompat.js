/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

qx.Mixin.define("qx.legacy.application.MGuiCompat",
{
  include : [qx.locale.MTranslation],


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Called in the document.onload event of the browser. This method should
     * be overridden to implement the GUI setup code of the application.
     *
     */
    compat : function()
    {
      this.debug("Enabling 0.7x application compat");

      // this is needed to verify that the application developer has called the
      // overridden main method.
      this._initializedMain = true;

      // Prepare widget
      qx.legacy.ui.core.Widget.initScrollbarWidth();

      // Initialize themes
      qx.legacy.theme.manager.Meta.getInstance().initialize();

      // Force creation of event handler
      qx.legacy.event.handler.EventHandler.getInstance();

      // Force creation of client document
      qx.legacy.ui.core.ClientDocument.getInstance();

      // Call preloader
      qx.event.Timer.once(this._preload, this, 0);
    },


    /**
     * Start pre loading of the initially visible images.
     */
    _preload : function()
    {
      this.debug("preloading visible images...");
      this.__preloader = new qx.legacy.io.image.PreloaderSystem(qx.legacy.io.image.Manager.getInstance().getVisibleImages(), this._preloaderDone, this);
      this.__preloader.start();
    },


    /**
     * Callback which is called once the pre loading of the required images
     * is completed.
     */
    _preloaderDone : function()
    {
      qx.legacy.ui.core.Widget.$$uiReady = true;

      this.__preloader.dispose();
      this.__preloader = null;

      var start = (new Date).valueOf();

      // Show initial widgets
      qx.legacy.ui.core.Widget.flushGlobalQueues();

      this.info("render runtime: " + (new Date - start) + "ms");

      // Finally attach event to make the GUI ready for the user
      qx.legacy.event.handler.EventHandler.getInstance().attachEvents();

      // Call postloader
      qx.event.Timer.once(this._postload, this, 100);
    },


    /**
     * Preload all remaining images.
     */
    _postload : function()
    {
      this.debug("preloading hidden images...");
      this.__postloader = new qx.legacy.io.image.PreloaderSystem(qx.legacy.io.image.Manager.getInstance().getHiddenImages(), this._postloaderDone, this);
      this.__postloader.start();
    },


    /**
     * Callback which is called once the post loading is completed.
     */
    _postloaderDone : function()
    {
      this.__postloader.dispose();
      this.__postloader = null;
    }
  }
});

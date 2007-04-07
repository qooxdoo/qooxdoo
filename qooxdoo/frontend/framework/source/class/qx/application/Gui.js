/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

/**
 * This is the base class for all GUI qooxdoo applications.
 *
 * All applications using qooxdoo widgets should be derived from
 * this class. Normally at least the {@link #main} method will
 * be overridden to define the GUI.
 */
qx.Class.define("qx.application.Gui",
{
  extend : qx.core.Target,
  implement : qx.application.IApplication,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {
    /** Whether the user interfacce has already been rendered */
    uiReady : { init : false }
  },






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
     * @type member
     */
    main : function()
    {
      // Force creation of event handler
      qx.event.handler.EventHandler.getInstance();

      // Force creation of client document
      qx.ui.core.ClientDocument.getInstance();

      // Call preloader
      qx.client.Timer.once(this._preload, this, 0);
    },


    /**
     * Called in the document.beforeunload event of the browser. If the method
     * returns a string value, the user will be asked by the browser, whether
     * he really wants to leave the page. The return string will be displayed in
     * the message box.
     *
     * @type member
     * @return {String?null} message text on unloading the page
     */
    close : function() {},


    /**
     * Called in the document.onunload event of the browser. This method contains the last
     * code which is run inside the page and may contain cleanup code.
     *
     * @type member
     */
    terminate : function() {},


    /**
     * Start pre loading of the initially visible images.
     */
    _preload : function()
    {
      this.debug("preloading visible images...");
      new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPreloadImageList(), this._ready, this);
    },

    /**
     * Callback which is called once the pre loading of the required images
     * is completed.
     */
    _ready : function()
    {
      this.setUiReady(true);

      var start = (new Date).valueOf();

      // Show initial widgets
      qx.ui.core.Widget.flushGlobalQueues();

      this.info("render runtime: " + (new Date - start) + "ms");

      // Finally attach event to make the GUI ready for the user
      qx.event.handler.EventHandler.getInstance().attachEvents();

      // Call postloader
      qx.client.Timer.once(this._postload, this, 100);
    },


    /**
     * Preload all remaining images.
     */
    _postload : function()
    {
      this.debug("preloading hidden images...");
      var loader = new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPostPreloadImageList());
      loader.start();
    }
  }
});

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

qx.Class.define("qx.application.Gui",
{
  extend : qx.core.Object,
  implement : qx.application.IApplication,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties : {
    uiReady : { init : false }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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
     * Terminate this component.
     *
     * @type member
     * @return {void}
     */
    close : function() {},


    /**
     * Terminate this component.
     *
     * @type member
     * @return {void}
     */
    terminate : function() {},


    _preload : function()
    {
      this.debug("preloading visible images...");
      new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPreloadImageList(), this._ready, this);
    },

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

    _postload : function()
    {
      this.debug("preloading hidden images...");
      var loader = new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPostPreloadImageList());
      loader.start();
    }
  }
});

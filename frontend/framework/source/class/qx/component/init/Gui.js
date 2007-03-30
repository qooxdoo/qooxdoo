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

qx.Class.define("qx.component.init.Gui",
{
  extend : qx.component.init.Basic,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      READY STATE
    ---------------------------------------------------------------------------
    */

    _uiReady : false,


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isUiReady : function() {
      return this._uiReady;
    },




    /*
    ---------------------------------------------------------------------------
      STATE MODIFIER
    ---------------------------------------------------------------------------
    */

    initialize : function(e)
    {
      // Force creation of event handler
      qx.event.handler.EventHandler.getInstance();

      // Force creation of client document
      qx.ui.core.ClientDocument.getInstance();

      // Start real initialisation
      var start = (new Date).valueOf();
      this.base(arguments);
      this.info("initialize runtime: " + ((new Date).valueOf() - start) + "ms");
    },


    main : function(e)
    {
      // Start real main process
      var start = (new Date).valueOf();
      this.base(arguments);
      this.info("main runtime: " + ((new Date).valueOf() - start) + "ms");

      this.debug("preloading visible images...");
      new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPreloadImageList(), this.finalize, this);
    },


    finalize : function(e)
    {
      var start = (new Date).valueOf();

      this._printPreloadComplete();
      this._uiReady = true;

      // Show initial widgets
      qx.ui.core.Widget.flushGlobalQueues();

      // Finally attach event to make the GUI ready for the user
      qx.event.handler.EventHandler.getInstance().attachEvents();

      this.base(arguments);

      this.info("finalize runtime: " + ((new Date).valueOf() - start) + "ms");
    },


    close : function(e)
    {
      var start = (new Date).valueOf();
      this.base(arguments);

      this.info("close runtime: " + ((new Date).valueOf() - start) + "ms");
    },


    terminate : function(e)
    {
      var start = (new Date).valueOf();
      this.base(arguments);

      this.info("terminate runtime: " + ((new Date).valueOf() - start) + "ms");
    },




    /*
    ---------------------------------------------------------------------------
      PRELOAD UTILITIES
    ---------------------------------------------------------------------------
    */

    preload : function()
    {
      if (!this._preloadDone)
      {
        this.debug("preloading hidden images...");
        new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPostPreloadImageList(), this._printPreloadComplete, this);
        this._preloadDone = true;
      }
    },


    _printPreloadComplete : function() {
      this.debug("preloading complete");
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    _onload : function(e)
    {
      this.initialize();
      this.main();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_preloadDone", "_uiReady");
  }
});

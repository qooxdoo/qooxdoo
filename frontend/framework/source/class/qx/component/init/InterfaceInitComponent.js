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

qx.Class.define("qx.component.init.InterfaceInitComponent",
{
  extend : qx.component.init.BasicInitComponent,

  construct : function() {
    this.base(arguments);
  },




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

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    initialize : function()
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      // Start real main process
      var start = (new Date).valueOf();
      this.base(arguments);
      this.info("main runtime: " + ((new Date).valueOf() - start) + "ms");

      this.debug("preloading visible images...");
      new qx.io.image.PreloaderSystem(qx.manager.object.ImageManager.getInstance().getPreloadImageList(), this.finalize, this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    finalize : function()
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    close : function()
    {
      var start = (new Date).valueOf();
      this.base(arguments);

      this.info("close runtime: " + ((new Date).valueOf() - start) + "ms");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    terminate : function()
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

    /**
     * TODOC
     *
     * @type member
     * @return {void}
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _printPreloadComplete : function() {
      this.debug("preloading complete");
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onload : function(e)
    {
      this.initialize();
      this.main();
    },

    // Note: finalize will be called through image preloader

    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      this._preloadDone = null;
      this._uiReady = null;

      return this.base(arguments);
    }
  }
});

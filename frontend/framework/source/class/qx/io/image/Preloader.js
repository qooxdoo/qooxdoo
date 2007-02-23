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
 * This is the preloader used from qx.ui.basic.Image instances.
 */
qx.Clazz.define("qx.io.image.Preloader",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSource)
  {
    if (qx.manager.object.ImagePreloaderManager.getInstance().has(vSource))
    {
      this.debug("Reuse qx.io.image.Preloader in old-style!");
      this.debug("Please use qx.manager.object.ImagePreloaderManager.getInstance().create(source) instead!");

      return qx.manager.object.ImagePreloaderManager.getInstance().get(vSource);
    }

    qx.core.Target.call(this);

    // Create Image-Node
    // Does not work with document.createElement("img") in Webkit. Interesting.
    // Compare this to the bug in qx.ui.basic.Image.
    this._element = new Image;

    // This is needed for wrapping event to the object
    this._element.qx_ImagePreloader = this;

    // Define handler if image events occurs
    if (qx.core.Variant.isSet("qx.client", "webkit"))
    {
      // Webkit as of version 41xxx
      // does not get the target right. We need to help out a bit
      // ugly closure!
      var self = this;

      this._element.onload = function(e) {
        return self._onload(e);
      };

      this._element.onerror = function(e) {
        return self._onerror(e);
      };
    }
    else
    {
      this._element.onload = qx.io.image.Preloader.__onload;
      this._element.onerror = qx.io.image.Preloader.__onerror;
    }

    // Set Source
    this._source = vSource;
    this._element.src = vSource;

    // Set PNG State
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      this._isPng = /\.png$/i.test(this._element.nameProp);
    }

    qx.manager.object.ImagePreloaderManager.getInstance().add(this);
  },





  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  
  events: {
   "load" : "qx.event.type.Event",
   "error" : "qx.event.type.Event"
  },
  
  
  
  
  
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT MAPPING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @param e {Event} TODOC
     * @return {void}
     */
    __onload : function(e) {
      this.qx_ImagePreloader._onload();
    },


    /**
     * TODOC
     *
     * @type static
     * @param e {Event} TODOC
     * @return {void}
     */
    __onerror : function(e) {
      this.qx_ImagePreloader._onerror();
    }
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
      STATE MANAGERS
    ---------------------------------------------------------------------------
    */

    _source : null,
    _isLoaded : false,
    _isErroneous : false,




    /*
    ---------------------------------------------------------------------------
      CROSSBROWSER GETTERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getUri : function() {
      return this._source;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getSource : function() {
      return this._source;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isLoaded : function() {
      return this._isLoaded;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isErroneous : function() {
      return this._isErroneous;
    },

    // only used in mshtml: true when the image format is in png
    _isPng : false,


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIsPng : function() {
      return this._isPng;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getWidth : qx.core.Variant.select("qx.client",
    {
      "gecko" : function() {
        return this._element.naturalWidth;
      },

      "default" : function() {
        return this._element.width;
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getHeight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function() {
        return this._element.naturalHeight;
      },

      "default" : function() {
        return this._element.height;
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onload : function()
    {
      if (this._isLoaded || this._isErroneous) {
        return;
      }

      this._isLoaded = true;
      this._isErroneous = false;

      if (this.hasEventListeners("load")) {
        this.dispatchEvent(new qx.event.type.Event("load"), true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onerror : function()
    {
      if (this._isLoaded || this._isErroneous) {
        return;
      }

      this.debug("Could not load: " + this._source);

      this._isLoaded = false;
      this._isErroneous = true;

      if (this.hasEventListeners("error")) {
        this.dispatchEvent(new qx.event.type.Event("error"), true);
      }
    },




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

      if (this._element)
      {
        this._element.onload = this._element.onerror = null;
        this._element.qx_ImagePreloader = null;
        this._element = null;
      }

      this._isLoaded = this._isErroneous = this._isPng = false;

      return qx.core.Target.prototype.dispose.call(this);
    }
  }
});

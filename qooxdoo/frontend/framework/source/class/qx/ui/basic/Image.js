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

/* ************************************************************************

#module(ui_basic)
#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * This widget represents an image.
 *
 * @appearance image
 */
qx.Class.define("qx.ui.basic.Image",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vSource {String} URL of the image
   * @param vWidth {Integer|String ? "auto"} definition of the width of the image
   * @param vHeight {Integer|String ? "auto"} definition of the height of the image
   */
  construct : function(vSource, vWidth, vHeight)
  {
    this.base(arguments);

    this._blank = qx.io.Alias.getInstance().resolve("static/image/blank.gif");

    // Source
    if (vSource != null) {
      this.setSource(vSource);
    }

    // Dimensions
    if (vWidth != null) {
      this.setWidth(vWidth);
    } else {
      this.initWidth();
    }

    if (vHeight != null) {
      this.setHeight(vHeight);
    } else {
      this.initHeight();
    }

    // Property init
    this.initSelectable();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /** Fires if an image could not be preloaded  */
    "error" : "qx.event.type.Event"
  },






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      REFINED PROPERTIES
    ---------------------------------------------------------------------------
    */

    allowStretchX :
    {
      refine : true,
      init : false
    },

    allowStretchY :
    {
      refine : true,
      init : false
    },

    selectable :
    {
      refine : true,
      init : false
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    appearance :
    {
      refine : true,
      init : "image"
    },





    /*
    ---------------------------------------------------------------------------
      OWN PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The source uri of the image. */
    source :
    {
      check : "String",
      apply : "_applySource",
      event : "changeSource",
      nullable : true,
      themeable : true
    },


    /** The assigned preloader instance of the image. */
    preloader :
    {
      check : "qx.io.image.Preloader",
      apply : "_applyPreloader",
      nullable : true
    },


    /**
     * The loading status.
     *
     *  True if the image is loaded correctly. False if no image is loaded
     *  or the one that should be loaded is currently loading or not available.
     */
    loaded :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLoaded"
    },


    /** Should the image be maxified in it's own container? */
    resizeToInner :
    {
      check : "Boolean",
      init : false
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
      EVENT MAPPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method of the "load" event - sets "loaded" property
     *
     * @type member
     * @return {void}
     */
    _onload : function() {
      this.setLoaded(true);
    },


    /**
     * Listener method of the "error" event
     *
     * @type member
     * @return {void}
     */
    _onerror : function()
    {
      this.warn("Could not load: " + this.getSource());

      this.setLoaded(false);

      if (this.hasEventListeners("error")) {
        this.dispatchEvent(new qx.event.type.Event("error"), true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPLAYBLE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Registers an image at the image manager (qx.io.image.Manager) and increases the
     * visible counter
     *
     * @type member
     * @return {void}
     */
    _beforeAppear : function()
    {
      var source = this.getSource();
      if (source)
      {
        qx.io.image.Manager.getInstance().show(source);
        this._registeredAsVisible = true;
      }

      return this.base(arguments);
    },


    /**
     * Registers an image at the image manager (qx.io.image.Manager) and reduces the
     * visible counter
     *
     * @type member
     * @return {void}
     */
    _beforeDisappear : function()
    {
      var source = this.getSource();
      if (source && this._registeredAsVisible)
      {
        qx.io.image.Manager.getInstance().hide(source);
        delete this._registeredAsVisible;
      }

      return this.base(arguments);
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySource : function(value, old)
    {
      var imageMgr = qx.io.image.Manager.getInstance();

      if (old)
      {
        imageMgr.remove(old);

        if (this._registeredAsVisible)
        {
          imageMgr.hide(old);
          delete this._registeredAsVisible;
        }
      }

      if (value)
      {
        imageMgr.add(value);

        if (this.isSeeable())
        {
          this._registeredAsVisible = true;
          imageMgr.show(value);
        }
      }

      if (this.isCreated()) {
        this._connect();
      }
    },

    /**
     * Connects a callback method to the value manager to ensure
     * that changes to the source are handled by the image instance
     *
     * @type member
     * @return {void}
     */
    _connect : function()
    {
      var aliasMgr = qx.io.Alias.getInstance();
      aliasMgr.connect(this._syncSource, this, this.getSource());
    },

    /**
     * Sets the preloader property (with creating a new instance)
     *
     * @param value {String} source of image instance
     * @return {void}
     */
    _syncSource : function(value)
    {
      if (value === null)
      {
        this.setPreloader(null);
      }
      else
      {
        var preloader = qx.io.image.PreloaderManager.getInstance().create(value);
        this.setPreloader(preloader);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyPreloader : function(value, old)
    {
      if (old)
      {
        // remove event connection
        old.removeEventListener("load", this._onload, this);
        old.removeEventListener("error", this._onerror, this);
      }

      if (value)
      {
        // Omit  here, otherwise the later setLoaded(true)
        // will not be executed (prevent recursion)
        this.setLoaded(false);

        if (value.isErroneous()) {
          this._onerror();
        } else if (value.isLoaded()) {
          this.setLoaded(true);
        }
        else
        {
          value.addEventListener("load", this._onload, this);
          value.addEventListener("error", this._onerror, this);
        }
      }
      else
      {
        this.setLoaded(false);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyLoaded : function(value, old)
    {
      if (value && this.isCreated())
      {
        this._renderContent();
      }
      else if (!value)
      {
        this._invalidatePreferredInnerWidth();
        this._invalidatePreferredInnerHeight();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyElement : function(value, old)
    {
      if (value)
      {
        if (!this._image)
        {
          try
          {
            // Create Image-Node
            // Webkit has problems with "new Image". Maybe related to "new Function" with
            // is also not working correctly.
            if (qx.core.Variant.isSet("qx.client", "webkit")) {
              this._image = document.createElement("img");
            } else {
              this._image = new Image;
            }

            this._image.style.border = "0 none";
            this._image.style.verticalAlign = "top";
            this._image.alt = "";
            this._image.title = "";
          }
          catch(ex) {
            this.error("Failed while creating image #1", ex);
          }

          if (qx.core.Variant.isSet("qx.client", "gecko|opera|webkit")) {
            this._styleEnabled();
          }
        }

        value.appendChild(this._image);
      }

      // call widget implmentation
      this.base(arguments, value, old);

      if (value && this.getSource()) {
        this._connect();
      }
    },




    /*
    ---------------------------------------------------------------------------
      CLIENT OPTIMIZED MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * Internal method (called by the layout engine)
     * Applies the dimensions and then sets the source of the image instance
     *
     * @type member
     * @return {void}
     */
    _postApply : function()
    {
      this._postApplyDimensions();
      this._updateContent();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void}
     * @signature function(value, old)
     */
    _applyEnabled : function(value, old)
    {
      if (this._image) {
        this._styleEnabled();
      }

      return this.base(arguments, value, old);
    },


    /**
     * Updates the source of the image instance
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _updateContent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var i = this._image;
        var pl = this.getPreloader();

        var source = pl && pl.isLoaded() ? pl.getSource() : this._blank;

        if (pl && pl.getIsPng() && this.getEnabled())
        {
          i.src = this._blank;
          i.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + source + "',sizingMethod='scale')";
        }
        else
        {
          i.src = source;
          i.style.filter = this.getEnabled() ? "" : "Gray() Alpha(Opacity=30)";
        }
      },

      "default" : function()
      {
        var pl = this.getPreloader();
        var source = pl && pl.isLoaded() ? pl.getSource() : this._blank;

        this._image.src = source;
      }
    }),


    /**
     * Reset the source of the image instance to a blank image
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _resetContent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._image.src = this._blank;
        this._image.style.filter = "";
      },

      "default" : function() {
        this._image.src = this._blank;
      }
    }),


    /**
     * Sets the style values for the states enabled/disabled
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _styleEnabled : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._updateContent();
      },

      "default" : function()
      {
        if (this._image)
        {
          var o = this.getEnabled()===false ? 0.3 : "";
          var s = this._image.style;

          s.opacity = s.KhtmlOpacity = s.MozOpacity = o;
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS: INNER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns width value of preloader or 0 (if preloader is not available)
     *
     * @type member
     * @return {Integer} Returns width value of preloader or 0 (if preloader is not available)
     */
    _computePreferredInnerWidth : function()
    {
      var preloader = this.getPreloader();
      return preloader ? preloader.getWidth() : 0;
    },


    /**
     * Returns height value of preloader or 0 (if preloader is not available)
     *
     * @type member
     * @return {Integer} Returns height value of preloader or 0 (if preloader is not available)
     */
    _computePreferredInnerHeight : function()
    {
      var preloader = this.getPreloader();
      return preloader ? preloader.getHeight() : 0;
    },




    /*
    ---------------------------------------------------------------------------
      APPLY
    ---------------------------------------------------------------------------
    */

    /**
     * Additionally (in comparison to base method) flushes global queues to
     * get an up-to-date view when an image is loaded
     *
     * @type member
     * @return {void}
     */
    _renderContent : function()
    {
      this.base(arguments);

      // Images load asyncron, so we need to force flushing here
      // to get an up-to-date view when an image is loaded.
      qx.ui.core.Widget.flushGlobalQueues();
    },


    /**
     * Sets the style attributes for width and height
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _postApplyDimensions : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        try
        {
          var vImageStyle = this._image.style;

          if (this.getResizeToInner())
          {
            vImageStyle.pixelWidth = this.getInnerWidth();
            vImageStyle.pixelHeight = this.getInnerHeight();
          }
          else
          {
            vImageStyle.pixelWidth = this.getPreferredInnerWidth();
            vImageStyle.pixelHeight = this.getPreferredInnerHeight();
          }
        }
        catch(ex)
        {
          this.error("postApplyDimensions failed", ex);
        }
      },

      "default" : function()
      {
        try
        {
          var vImageNode = this._image;

          if (this.getResizeToInner())
          {
            vImageNode.width = this.getInnerWidth();
            vImageNode.height = this.getInnerHeight();
          }
          else
          {
            vImageNode.width = this.getPreferredInnerWidth();
            vImageNode.height = this.getPreferredInnerHeight();
          }
        }
        catch(ex)
        {
          this.error("postApplyDimensions failed", ex);
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      CHANGES IN DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the width style attribute
     *
     * @type member
     * @param vNew {var} new inner width value
     * @param vOld {var} old inner width value
     * @return {void}
     * @signature function(vNew, vOld)
     */
    _changeInnerWidth : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.style.pixelWidth = vNew;
        }
      },

      "default" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.width = vNew;
        }
      }
    }),


    /**
     * Sets the height style attribute
     *
     * @type member
     * @param vNew {var} new inner height value
     * @param vOld {var} old inner height value
     * @return {void}
     * @signature function(vNew, vOld)
     */
    _changeInnerHeight : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.style.pixelHeight = vNew;
        }
      },

      "default" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.height = vNew;
        }
      }
    })
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Remove leaking filter attribute before leaving page
    if (this._image) {
      this._image.style.filter = "";
    }

    // Remove fields
    this._disposeFields("_image");
  }
});

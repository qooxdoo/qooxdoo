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

    this._blank = qx.manager.object.AliasManager.getInstance().resolve("static/image/blank.gif");

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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onload : function() {
      this.setLoaded(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onerror : function()
    {
      this.debug("Could not load: " + this.getSource());

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
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _beforeAppear : function()
    {
      var vSource = this.getSource();

      if (qx.util.Validation.isValidString(vSource)) {
        qx.manager.object.ImageManager.getInstance()._sources[vSource]++;
      }

      return this.base(arguments);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _beforeDisappear : function()
    {
      var vSource = this.getSource();
      var imageMgr = qx.manager.object.ImageManager.getInstance();

      if (qx.util.Validation.isValidString(vSource))
      {
        if (imageMgr._sources[vSource] <= 1) {
          delete imageMgr._sources[vSource];
        } else {
          imageMgr._sources[vSource]--;
        }
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
      var imageMgr = qx.manager.object.ImageManager.getInstance();

      if (value && typeof imageMgr._sources[value] === "undefined") {
        imageMgr._sources[value] = 0;
      }

      if (old)
      {
        if (imageMgr._sources[old] <= 1) {
          delete imageMgr._sources[old];
        } else {
          imageMgr._sources[old]--;
        }
      }

      if (this.isCreated()) {
        this._connect();
      }
    },

    _connect : function()
    {
      var aliasMgr = qx.manager.object.AliasManager.getInstance();
      aliasMgr.connect(this._syncSource, this, this.getSource());
    },

    _syncSource : function(value)
    {
      if (value === null)
      {
        this.setPreloader(null);
      }
      else
      {
        var preloader = qx.manager.object.ImagePreloaderManager.getInstance().create(value);
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

      var imageMgr = qx.manager.object.ImageManager.getInstance();

      if (value)
      {
        // Register to image manager
        imageMgr.add(this);

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
        // Remove from image manager
        imageMgr.remove(this);

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
     * TODOC
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
     * TODOC
     *
     * @type member
     * @param vSource {var} TODOC
     * @return {void}
     * @signature function(vSource)
     */
    _updateContent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var i = this._image;
        var pl = this.getPreloader();

        var source = pl.isLoaded() ? pl.getSource() : this._blank;

        if (pl.getIsPng() && this.getEnabled())
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
        var source = pl.isLoaded() ? pl.getSource() : this._blank;

        this._image.src = source;
      }
    }),


    /**
     * TODOC
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
     * TODOC
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
     * TODOC
     *
     * @type member
     * @return {var | int} TODOC
     */
    _computePreferredInnerWidth : function()
    {
      var preloader = this.getPreloader();
      return preloader ? preloader.getWidth() : 0;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var | int} TODOC
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
     * TODOC
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
     * TODOC
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
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
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
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
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

    // Remove from manager
    qx.manager.object.ImageManager.getInstance().remove(this);

    // Remove fields
    this._disposeFields("_image");
  }
});

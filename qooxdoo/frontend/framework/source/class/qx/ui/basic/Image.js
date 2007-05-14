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

    // Force empty alt and title property
    this.setHtmlProperty("alt", "");
    this.setHtmlProperty("title", "");

    // Source
    if (vSource !== undefined) {
      this.setSource(vSource);
    } else {
      this.initSource();
    }

    // Dimensions
    if (vWidth !== undefined) {
      this.setWidth(vWidth);
    } else {
      this.initWidth();
    }

    if (vHeight !== undefined) {
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
      apply : "_modifySource",
      event : "changeSource",
      nullable : true,
      themeable : true,
      init : "static/image/blank.gif"
    },


    /** The assigned preloader instance of the image. */
    preloader :
    {
      check : "qx.io.image.Preloader",
      apply : "_modifyPreloader",
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
      apply : "_modifyLoaded"
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

      if (qx.util.Validation.isValidString(vSource))
      {
        if (qx.manager.object.ImageManager.getInstance()._sources[vSource] <= 1) {
          delete qx.manager.object.ImageManager.getInstance()._sources[vSource];
        } else {
          qx.manager.object.ImageManager.getInstance()._sources[vSource]--;
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
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifySource : function(propValue, propOldValue, propData)
    {
      if (propValue && typeof qx.manager.object.ImageManager.getInstance()._sources[propValue] === "undefined") {
        qx.manager.object.ImageManager.getInstance()._sources[propValue] = 0;
      }

      if (propOldValue)
      {
        if (qx.manager.object.ImageManager.getInstance()._sources[propOldValue] <= 1) {
          delete qx.manager.object.ImageManager.getInstance()._sources[propOldValue];
        } else {
          qx.manager.object.ImageManager.getInstance()._sources[propOldValue]--;
        }
      }

      if (this.isCreated())
      {
        if (propValue) {
          this.setPreloader(qx.manager.object.ImagePreloaderManager.getInstance().create(qx.manager.object.AliasManager.getInstance().resolvePath(propValue)));
        }
        else if (propOldValue)
        {
          this._resetContent();
          this.setPreloader(null);
        }
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyPreloader : function(propValue, propOldValue, propData)
    {
      if (propOldValue)
      {
        // remove event connection
        propOldValue.removeEventListener("load", this._onload, this);
        propOldValue.removeEventListener("error", this._onerror, this);
      }

      if (propValue)
      {
        // Register to image manager
        qx.manager.object.ImageManager.getInstance().add(this);

        // Omit  here, otherwise the later setLoaded(true)
        // will not be executed (prevent recursion)
        this.setLoaded(false);

        if (propValue.isErroneous()) {
          this._onerror();
        } else if (propValue.isLoaded()) {
          this.setLoaded(true);
        }
        else
        {
          propValue.addEventListener("load", this._onload, this);
          propValue.addEventListener("error", this._onerror, this);
        }
      }
      else
      {
        // Remove from image manager
        qx.manager.object.ImageManager.getInstance().remove(this);

        this.setLoaded(false);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyLoaded : function(propValue, propOldValue, propData)
    {
      if (propValue && this.isCreated())
      {
        this._renderContent();
      }
      else if (!propValue)
      {
        this._invalidatePreferredInnerWidth();
        this._invalidatePreferredInnerHeight();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyElement : function(propValue, propOldValue, propData)
    {
      if (propValue)
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

            // Possible alternative for MSHTML for PNG images
            // But it seems not to be faster
            // this._image = document.createElement("div");
            // this costs much performance, move setup to blank gif to error handling
            // is this SSL save?
            // this._image.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
            this._image.style.border = "0 none";
            this._image.style.verticalAlign = "top";
          }
          catch(ex)
          {
            this.error("Failed while creating image #1", ex);
          }

          if (qx.core.Variant.isSet("qx.client", "mshtml")) {}

          // empty to help the generator removing this variant
          else {
            this._applyEnabled();
          }
        }

        propValue.appendChild(this._image);
      }

      // call widget implmentation
      this.base(arguments, propValue, propOldValue, propData);

      if (propValue)
      {
        try
        {
          // initialisize preloader
          var vSource = this.getSource();

          if (qx.util.Validation.isValidString(vSource))
          {
            // this.debug("Post-Create: " + vSource);
            this.setPreloader(qx.manager.object.ImagePreloaderManager.getInstance().create(qx.manager.object.AliasManager.getInstance().resolvePath(vSource)));
          }
        }
        catch(ex)
        {
          this.error("Failed while creating image #2", ex);
        }
      }

      return true;
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
      if (!this.getLoaded())
      {
        this._updateContent(qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif"));
        return;
      }

      this._postApplyDimensions();
      this._updateContent();
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {void}
     * @signature function(propValue, propOldValue, propData)
     */
    _modifyEnabled : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(propValue, propOldValue, propData)
      {
        if (this._image) {
          this._applyEnabled();
        }

        return this.base(arguments, propValue, propOldValue, propData);
      },

      "default" : function(propValue, propOldValue, propData)
      {
        if (this._image) {
          this._applyEnabled();
        }

        return this.base(arguments, propValue, propOldValue, propData);
      }
    }),


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
      "mshtml" : function(vSource)
      {
        var i = this._image;
        var pl = this.getPreloader();

        if (pl.getIsPng() && this.getEnabled())
        {
          i.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
          i.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + (vSource || pl.getSource()) + "',sizingMethod='scale')";
        }
        else
        {
          i.src = vSource || pl.getSource();
          i.style.filter = this.getEnabled() ? "" : "Gray() Alpha(Opacity=30)";
        }
      },

      "default" : function(vSource) {
        this._image.src = vSource || this.getPreloader().getSource();
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
        var i = this._image;

        i.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
        i.style.filter = "";
      },

      "default" : function() {
        this._image.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     * @signature function()
     */
    _applyEnabled : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this._postApply();
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
      if (this.getLoaded()) {
        return this.getPreloader().getWidth();
      }
      else if (qx.util.Validation.isValidString(this.getSource()))
      {
        var vPreloader = qx.manager.object.ImagePreloaderManager.getInstance().get(qx.manager.object.AliasManager.getInstance().resolvePath(this.getSource()));

        if (vPreloader && vPreloader.isLoaded()) {
          return vPreloader.getWidth();
        }
      }

      return 0;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var | int} TODOC
     */
    _computePreferredInnerHeight : function()
    {
      if (this.getLoaded()) {
        return this.getPreloader().getHeight();
      }
      else if (qx.util.Validation.isValidString(this.getSource()))
      {
        var vPreloader = qx.manager.object.ImagePreloaderManager.getInstance().get(qx.manager.object.AliasManager.getInstance().resolvePath(this.getSource()));

        if (vPreloader && vPreloader.isLoaded()) {
          return vPreloader.getHeight();
        }
      }

      return 0;
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

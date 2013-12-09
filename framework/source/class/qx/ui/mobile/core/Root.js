/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */


/**
 * Root widget for the mobile application.
 */
qx.Class.define("qx.ui.mobile.core.Root",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param root {Element?null} Optional. The root DOM element of the widget. Default is the body of the document.
   * @param layout {qx.ui.mobile.layout.Abstract ? qx.ui.mobile.layout.VBox} The layout of the root widget.
   */
  construct : function(root, layout)
  {
    this.__root = root || document.body;
    this.base(arguments, layout || new qx.ui.mobile.layout.VBox());

    this.addCssClass("mobile");
    this.addCssClass(qx.core.Environment.get("os.name"));
    this.addCssClass("v"+qx.core.Environment.get("os.version").charAt(0));

    qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);

    // [BUG #7785] Document element's clientHeight is calculated wrong on iPad iOS7
    if (qx.core.Environment.get("os.name") == "ios" && window.innerHeight != document.documentElement.clientHeight) {
      qx.event.Registration.addListener(window, "orientationchange", this.__fixViewportHeight, this);
      qx.event.Registration.addListener(window, "scroll", this.__fixViewportHeight, this);
      this.__fixViewportHeight();
      document.body.style.webkitTransform = "translate3d(0,0,0)";
    }

    this._onOrientationChange();
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "root"
    },


    /**
     * Whether the native scrollbar should be shown or not.
     */
    showScrollbarY :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowScrollbarY"
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Event is fired when the app scale factor of the application has (or
     * might have) changed.
     */
    "changeAppScale" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __root : null,

    // overridden
    _createContainerElement : function() {
      return this.__root;
    },


    // property apply
    _applyShowScrollbarY : function(value, old) {
      this._setStyle("overflow-y", value ? "auto" : "hidden");
    },


    /**
     * Returns the application's total scale factor. It takes into account both
     * the application's font scale (determined by {@link #getFontScale}) and
     * the device pixel ratio. The latter could be modified at runtime by the
     * browsers font scaling/zooming feature.
     *
     * @return {Number|null} the app scale factor. If a valid app scale could
     * be determined, it is rounded to a two decimal number. If it could not be
     * determined, <code>null</code> is returned.
     */
    getAppScale: function()
    {
      var pixelRatio = parseFloat(qx.bom.client.Device.getDevicePixelRatio().toFixed(2));
      var fontScale = this.getFontScale();

      if (!isNaN(pixelRatio*fontScale)) {
        return parseFloat((pixelRatio*fontScale).toFixed(2));
      } else {
        return null;
      }
    },


    /**
     * Returns the application's font scale factor.
     *
     * @return {Number|null} the font scale factor. If a valid font scale could
     * be determined, it is rounded to a three decimal number. For displaying
     * the scale factor, you might want to round to two decimals
     * (<code>.toFixed(2)</code>). If it could not be determined,
     * <code>null</code> is returned.
     */
    getFontScale: function()
    {
      var fontScale = null;
      var appScale = 1;

      // determine font-size style in percent if available
      var fontSize = document.documentElement.style.fontSize;
      if (fontSize.indexOf("%") !== -1) {
        appScale = (parseInt(fontSize, 10) / 100);
      }

      // start from font-size computed style in pixels if available;
      fontSize = qx.bom.element.Style.get(document.documentElement, "fontSize");
      if (fontSize.indexOf("px") !== -1)
      {
        fontSize = parseFloat(fontSize);

        if (fontSize>15 && fontSize<17) {
          // iron out minor deviations from the base 16px size
          fontSize = 16;
        }

        if (appScale !== 1) {
          // if font-size style is set in percent
          fontSize = Math.round(fontSize/appScale);
        }

        // relative to the 16px base font
        fontScale = (fontSize/16);

        // apply percentage-based font-size
        fontScale *= appScale;

        // round to a tree-decimal float
        fontScale = parseFloat(fontScale.toFixed(3));
      }

      return fontScale;
    },


    /**
    * Sets the application's font scale factor, i.e. relative to a default 100%
    * font size.
    *
    * @param value {Number} the font scale factor.
    */
    setFontScale : function(value) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertNumber(value, "The scale factor is asserted to be of type Number");
      }

      var docElement = document.documentElement;
      docElement.style.fontSize = value * 100 + "%";

      // Force relayout - important for new Android devices and Firefox.
      setTimeout(function() {
        docElement.style.display = "none";
        docElement.clientWidth = docElement.clientWidth;
        docElement.style.display = "";
      }, 0);

      this.fireEvent("changeAppScale");
    },


    /**
    * Returns the rendered width.
    * @return {Integer} the width of the container element.
    */
    getWidth : function() {
      return qx.bom.element.Dimension.getWidth(this.__root);
    },


    /**
    * Returns the rendered height.
    * @return {Integer} the height of the container element.
    */
    getHeight : function() {
      return qx.bom.element.Dimension.getHeight(this.__root);
    },


    /**
    * Fixes the viewport height bug on iOS7 and iPad.
    * @internal
    */
    __fixViewportHeight : function() {
      document.documentElement.style.height = window.innerHeight + "px";
      if (document.body.scrollTop !== 0) {
        window.scrollTo(0, 0);
      }
    },


    /**
     * Event handler. Called when the orientation of the device is changed.
     *
     * @param evt {qx.event.type.Orientation} The handled orientation change event
     */
    _onOrientationChange : function(evt) {
      var isPortrait = null;

      if (evt) {
        isPortrait = evt.isPortrait();
      } else {
        isPortrait = qx.bom.Viewport.isPortrait();
      }

      if (isPortrait) {
        this.addCssClass("portrait");
        this.removeCssClass("landscape");
      } else {
        this.addCssClass("landscape");
        this.removeCssClass("portrait");
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__root = null;
    qx.event.Registration.removeListener(window, "orientationchange", this._onOrientationChange, this);

    if (qx.core.Environment.get("os.name") == "ios") {
      qx.event.Registration.removeListener(window, "orientationchange", this.__fixViewportHeight, this);
      qx.event.Registration.removeListener(window, "scroll", this.__fixViewportHeight, this);
    }
  }
});

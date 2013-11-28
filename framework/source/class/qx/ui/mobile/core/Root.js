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

    // Bugfix #7717 - On iOS7 the headers are partially covered by the browser's chrome.
    if (qx.core.Environment.get("os.name") == "ios" && window.innerHeight != document.documentElement.clientHeight) {
      var fixViewportHeight = function() {
        document.documentElement.style.height = window.innerHeight + "px";
        if (document.body.scrollTop !== 0) {
          window.scrollTo(0, 0);
        }
      }.bind(this);

      window.addEventListener("scroll", fixViewportHeight, false);
      window.addEventListener("orientationchange", fixViewportHeight, false);
      fixViewportHeight();

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
     * Event is fired when the scale factor of the application has changed.
     */
    "changeScaleFactor" : "qx.event.type.Event"
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
     * Returns the application's scale factor.
     * @return {Number} the scale factor. For the total scale of an app, you
     * might have to multiply this value by the device pixel ratio. The returned
     * is rounded to three decimals for a better precision in calculations. When
     * displaying the scale factor, you might want to round to two decimals
     * (<code>.toFixed(2)</code>).
     */
    getScaleFactor: function()
    {
      var scaleFactor = null;
      var appScaleFactor = 1;

      // determine font-size style in percent if available
      var fontSize = document.documentElement.style.fontSize;
      if (fontSize.indexOf("%") !== -1) {
        appScaleFactor = (parseInt(fontSize, 10) / 100);
      }

      // start from font-size computed style in pixels if available;
      fontSize = qx.bom.element.Style.get(document.documentElement, "fontSize");
      if (fontSize.indexOf("px") !== -1)
      {
        scaleFactor = parseFloat(fontSize);

        if (scaleFactor>15 && scaleFactor<17) {
          // iron out minor deviations from the base 16px size
          scaleFactor = 16;
        }

        if (appScaleFactor !== 1) {
          // if font-size style is set in percent
          scaleFactor = Math.round(scaleFactor/appScaleFactor);
        }

        // relative to the 16px base font
        scaleFactor = (scaleFactor/16);

        // apply percentage-based font-size
        scaleFactor *= appScaleFactor;

        // round to a tree-decimal float
        scaleFactor = parseFloat(scaleFactor.toFixed(3));
      }

      return scaleFactor;
    },


    /**
    * Sets the application's scale factor.
    * @param value {Number} the scale factor.
    */
    setScaleFactor : function(value) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertNumber(value, "The scale factor is asserted to be of type Number");
      }

      var docElement = document.documentElement;
      docElement.style.fontSize = value * 100 + "%";

      // Force relayout - important for new Android devices and Firefox.
      docElement.style.display = "none";
      docElement.clientWidth = docElement.clientWidth;
      docElement.style.display = "";

      this.fireEvent("changeScaleFactor");
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
  }
});

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
     * Til Schneider (til132)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Container widget for internal frames (iframes).
 * An iframe can display any HTML page inside the widget.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 * var document = this.getRoot();
 * var iframe = new qx.ui.toolbar.Iframe("http://www.qooxdoo.org");
 * document.add(iframe);
 * </pre>
 *
 * This example demonstrates how to create a toolbar and a toolbar buttons.
 * The button will be added to the toolbar in the last line.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/iframe' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.embed.Iframe",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MNativeOverflow,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of Iframe.
   * @param source {String} URL which should initally set.
   */
  construct : function(source)
  {
    if (source != null) {
      this.__source = source;
    }

    this.base(arguments);

    qx.event.Registration.addListener(document.body, "mousedown", this.block, this, true);
    qx.event.Registration.addListener(document.body, "mouseup", this.release, this, true);
    qx.event.Registration.addListener(document.body, "losecapture", this.release, this, true);

    this.__blockerElement = this._createBlockerElement();
    this.getContainerElement().add(this.__blockerElement);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * The "load" event is fired after the iframe content has successfully been loaded.
     */
    "load" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "iframe"
    },

    /**
     * Source URL of the iframe.
     */
    source :
    {
      check : "String",
      apply : "_applySource",
      nullable : true
    },

    /**
     * Name of the iframe.
     */
    frameName :
    {
      check : "String",
      init : "",
      apply : "_applyFrameName"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __source : null,
    __blockerElement : null,


    // overridden
    renderLayout : function(left, top, width, height)
    {
      this.base(arguments, left, top, width, height);

      var pixel = "px";
      var insets = this.getInsets();

      this.__blockerElement.setStyle("left", insets.left + pixel);
      this.__blockerElement.setStyle("top", insets.top + pixel);
      this.__blockerElement.setStyle("width", (width - insets.left - insets.right) + pixel);
      this.__blockerElement.setStyle("height", (height - insets.top - insets.bottom) + pixel);
    },


    // overridden
    _createContentElement : function()
    {
      var iframe = new qx.html.Iframe(this.__source);
      iframe.addListener("load", this._onIframeLoad, this);
      return iframe;
    },


    /**
     * Creates <div> element which is aligned over iframe node to avoid losing mouse events.
     *
     * @return {Object} Blocker element node
     */
    _createBlockerElement : function()
    {
      var el = new qx.html.Element("div");

      el.setStyle("zIndex", 20);
      el.setStyle("position", "absolute");
      el.setStyle("display", "none");

      if (qx.bom.client.Engine.MSHTML)
      {
        el.setStyle("backgroundColor", "white");
        el.setStyle("filter", "Alpha(Opacity=0)");
      }

      return el;
    },


    /**
     * Reacts on native load event and redirects it to the widget.
     *
     * @param e {qx.event.type.Event} Native load event
     */
    _onIframeLoad : function(e) {
      this.fireNonBubblingEvent("load");
    },




    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the DOM window object of an iframe.
     *
     * @return {DOMWindow} The DOM window object of the iframe.
     */
    getWindow : function() {
      return this.getContentElement().getWindow();
    },


    /**
     * Get the DOM document object of an iframe.
     *
     * @return {DOMDocument} The DOM document object of the iframe.
     */
    getDocument : function() {
      return this.getContentElement().getDocument();
    },


    /**
     * Get the HTML body element of the iframe.
     *
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function() {
      return this.getContentElement().getBody();
    },


    /**
     * Get the current name.
     *
     * @return {String} The iframe's name.
     */
    getName : function() {
      return this.getContentElement().getName();
    },


    /**
     * Cover the iframe with a transparent blocker div element. This prevents
     * mouse or key events to be handled by the iframe. To release the blocker
     * use {@link #release}.
     *
     */
    block : function() {
      this.__blockerElement.setStyle("display", "block");
    },


    /**
     * Release the blocker set by {@link #block}.
     *
     */
    release : function() {
      this.__blockerElement.setStyle("display", "none");
    },


    /**
     * Reload the contents of the iframe.
     *
     */
    reload : function() {
      this.getContentElement().reload();
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySource : function(value, old) {
      this.getContentElement().setSource(value);
    },

    // property apply
    _applyFrameName : function(value, old) {
      this.getContentElement().setAttribute("name", value);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__blockerElement");

    qx.event.Registration.removeListener(document.body, "mousedown", this.block, this, true);
    qx.event.Registration.removeListener(document.body, "mouseup", this.release, this, true);
    qx.event.Registration.removeListener(document.body, "losecapture", this.release, this, true);
  }
});

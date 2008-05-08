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
 *
 * An iframe can display any HTML page inside the widget.
 *
 * @appearance iframe
 */
qx.Class.define("qx.ui.embed.Iframe",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(source)
  {
    this._source = source;
    this.base(arguments);

    qx.event.Registration.addListener(document, "mousedown", this._showBlockerElement, this, true);
    qx.event.Registration.addListener(document, "mouseup", this._hideBlockerElement, this, true);
    
    this._blockerElement = this._createBlockerElement();
    this._containerElement.add(this._blockerElement);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    "load" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

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
      apply : "_applySource"
    },

    /**
     * Name of the iframe.
     */
    frameName :
    {
      check : "String",
      init : "",
      apply : "_applyFrameName"
    },
    
    /**
     * Whether the iframe's should have vertical scroll bars.
     */
    overflowX :
    {
      check : ["hidden", "visible", "scroll"],
      init  : "hidden",
      apply : "_applyOverflowX"
    },

    /**
     * Whether the iframe's should have horizontal scroll bars.
     */
    overflowY :
    {
      check : ["hidden", "visible", "scroll"],
      init  : "hidden",
      apply : "_applyOverflowY"
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    
    // overridden
    renderLayout : function(left, top, width, height)
    {
      this.base(arguments, left, top, width, height);
      
      var pixel = "px";
      var insets = this.getInsets();

      this._blockerElement.setStyle("left", insets.left + pixel);
      this._blockerElement.setStyle("top", insets.top + pixel);
      this._blockerElement.setStyle("width", (width - insets.left - insets.right) + pixel);
      this._blockerElement.setStyle("height", (height - insets.top - insets.bottom) + pixel);
    },
    
    // overridden
    _createContentElement : function() {
      return new qx.html.Iframe(this._source);
    },

    _showBlockerElement : function()
    {
      this._blockerElement.setStyle("display", "block");
    },

    _hideBlockerElement : function()
    {
      this._blockerElement.setStyle("display", "none");
    },
    
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
    getWindow : function()
    {
      return this.getContentElement().getWindow();
    },


    /**
     * Get the DOM document object of an iframe.
     *
     * @return {DOMDocument} The DOM document object of the iframe.
     */
    getDocument : function()
    {
      return this.getContentElement().getDocument();
    },


    /**
     * Get the HTML body element of the iframe.
     *
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function()
    {
      return this.getContentElement().getBody();
    },

    /**
     * Sets iframe's name attribute to given value 
     *
     * @param source {String} Name to be set.
     */
    setName : function(name)
    {
      return this.getContentElement().setName(name);
    },


    /**
     * Get the current name.
     *
     * @type member
     * @return {String} The iframe's name.
     */
    getName : function() {
      return this.getContentElement().getName();
    },

    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applySource : function(value, old)
    {
      this.getContentElement().setSource(value);
    },

    _applyFrameName : function(value, old)
    {
      this.getContentElement().setAttribute("name", value);
    },

    _applyOverflowX : function(value, old)
    {
      this.getContentElement().setStyle("overflowX", value)
    },

    _applyOverflowY : function(value, old)
    {
      this.getContentElement().setStyle("overflowY", value)
    }


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */





    /*
    ---------------------------------------------------------------------------
      LOAD STATUS
    ---------------------------------------------------------------------------
    */

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
  }

});

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

    /**
     * Source URL of the iframe.
     */
    source :
    {
      check : "String",
      apply : "_applySource"
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
    _createContentElement : function() {
      return new qx.html.Iframe(this._source);
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


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applySource : function(value, old)
    {
      this.getContentElement().setSource(value);
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

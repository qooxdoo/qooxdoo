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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * A cross browser iframe instance.
 */
qx.Class.define("qx.html.Iframe",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments, "iframe");
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
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyProperty : function(name, value)
    {
      this.base(arguments, name, value);

      if (name == "source") {
        qx.bom.Iframe.setSource(this._element, value);
      }
    },

    // overridden
    _createDomElement : function() {
      return qx.bom.Iframe.create(this._content);
    },




    /*
    ---------------------------------------------------------------------------
      IFRAME API
    ---------------------------------------------------------------------------
    */

    /**
     * Get the DOM window object of an iframe.
     *
     * @return {DOMWindow} The DOM window object of the iframe.
     */
    getWindow : function()
    {
      if (this._element)
      {
        return qx.bom.Iframe.getWindow(this._element);
      } else {
        return null;
      }
    },


    /**
     * Get the DOM document object of an iframe.
     *
     * @return {DOMDocument} The DOM document object of the iframe.
     */
    getDocument : function()
    {
      if (this._element) {
        return qx.bom.Iframe.getDocument(this._element);
      } else {
        return null;
      }
    },


    /**
     * Get the HTML body element of the iframe.
     *
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody : function()
    {
      if (this._element) {
        return qx.bom.Iframe.getBody(this._element);
      } else {
        return null;
      }
    },


    /**
     * Sets iframe's source attribute to given value
     *
     * @param source {String} URL to be set.
     */
    setSource : function(source)
    {
      this._setProperty("source", source);
      return this;
    },


    /**
     * Get the current source.
     *
     * @return {String} The iframe's source
     */
    getSource : function() {
      return this._getProperty("source");
    },


    /**
     * Sets iframe's name attribute to given value
     *
     * @param name {String} Name to be set.
     */
    setName : function(name)
    {
      this.setAttribute("name", name);
      return this;
    },


    /**
     * Get the current name.
     *
     * @return {String} The iframe's name.
     */
    getName : function() {
      return this.setAttribute("name");
    },


    /**
     * Reloads iframe
     */
    reload : function()
    {
      if (this._element)
      {
        var url = this.getSource();
        this.setSource(null);
        this.setSource(url);
      }
    }
  }
});

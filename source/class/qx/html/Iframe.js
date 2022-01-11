/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A cross browser iframe instance.
 */
qx.Class.define("qx.html.Iframe", {
  extend: qx.html.Element,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Wrapper for the HTML Iframe element.
   * @param url {String} Location which should be loaded inside the Iframe.
   * @param styles {Map?null} optional map of CSS styles, where the key is the name
   *    of the style and the value is the value to use.
   * @param attributes {Map?null} optional map of element attributes, where the
   *    key is the name of the attribute and the value is the value to use.
   */
  construct(url, styles, attributes) {
    super("iframe", styles, attributes);

    this.registerProperty("source", null, this._setSourceProperty);

    this.setSource(url);
    this.addListener("navigate", this.__onNavigate, this);

    // add yourself to the element queue to enforce the creation of DOM element
    qx.html.Element._modified[this.toHashCode()] = this;
    qx.html.Element._scheduleFlush("element");
  },

  /*
   *****************************************************************************
      EVENTS
   *****************************************************************************
   */

  events: {
    /**
     * The "load" event is fired after the iframe content has successfully been loaded.
     */
    load: "qx.event.type.Event",

    /**
     * The "navigate" event is fired whenever the location of the iframe
     * changes.
     *
     * Useful to track user navigation and internally used to keep the source
     * property in sync. Only works when the destination source is of same
     * origin than the page embedding the iframe.
     */
    navigate: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    /**
     * Implementation of setter for the "source" property
     *
     * @param value {String?} value to set
     */
    _setSourceProperty(value) {
      var element = this.getDomElement();
      var currentUrl = qx.bom.Iframe.queryCurrentUrl(element);

      // Skip if frame is already on URL.
      //
      // When URL of Iframe and source property get out of sync, the source
      // property needs to be updated [BUG #4481]. This is to make sure the
      // same source is not set twice on the BOM level.
      if (value === currentUrl) {
        return;
      }

      qx.bom.Iframe.setSource(element, value);
    },

    // overridden
    _createDomElement() {
      return qx.bom.Iframe.create();
    },

    /*
    ---------------------------------------------------------------------------
      IFRAME API
    ---------------------------------------------------------------------------
    */

    /**
     * Get the DOM window object of an iframe.
     *
     * @return {Window} The DOM window object of the iframe.
     */
    getWindow() {
      var element = this.getDomElement();

      if (element) {
        return qx.bom.Iframe.getWindow(element);
      } else {
        return null;
      }
    },

    /**
     * Get the DOM document object of an iframe.
     *
     * @return {Document} The DOM document object of the iframe.
     */
    getDocument() {
      var element = this.getDomElement();

      if (element) {
        return qx.bom.Iframe.getDocument(element);
      } else {
        return null;
      }
    },

    /**
     * Get the HTML body element of the iframe.
     *
     * @return {Element} The DOM node of the <code>body</code> element of the iframe.
     */
    getBody() {
      var element = this.getDomElement();

      if (element) {
        return qx.bom.Iframe.getBody(element);
      } else {
        return null;
      }
    },

    /**
     * Sets iframe's source attribute to given value
     *
     * @param source {String} URL to be set.
     * @return {qx.html.Iframe} The current instance for chaining
     */
    setSource(source) {
      // the source needs to be applied directly in case the iFrame is hidden
      this._setProperty("source", source, true);
      return this;
    },

    /**
     * Get the current source.
     *
     * @return {String} The iframe's source
     */
    getSource() {
      return this._getProperty("source");
    },

    /**
     * Sets iframe's name attribute to given value
     *
     * @param name {String} Name to be set.
     * @return {qx.html.Iframe} The current instance for chaining
     */
    setName(name) {
      this.setAttribute("name", name);
      return this;
    },

    /**
     * Get the current name.
     *
     * @return {String} The iframe's name.
     */
    getName() {
      return this.getAttribute("name");
    },

    /**
     * Reloads iframe
     */
    reload() {
      var element = this.getDomElement();

      if (element) {
        var url = this.getSource();
        this.setSource(null);
        this.setSource(url);
      }
    },

    /*
    ---------------------------------------------------------------------------
      LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Handle user navigation. Sync actual URL of iframe with source property.
     *
     * @param e {qx.event.type.Data} navigate event
     */
    __onNavigate(e) {
      var actualUrl = e.getData();
      if (actualUrl) {
        this.setSource(actualUrl);
      }
    }
  }
});

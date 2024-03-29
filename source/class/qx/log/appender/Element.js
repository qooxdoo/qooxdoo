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

************************************************************************ */

/**
 * This appender is used to log to an existing DOM element
 */
qx.Class.define("qx.log.appender.Element", {
  extend: qx.core.Object,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param element {Element} DOM element to use for log output.
   */
  construct(element) {
    super();

    var style = [
      ".qxappender .level-debug{background:white}",
      ".qxappender .level-info{background:#DEEDFA}",
      ".qxappender .level-warn{background:#FFF7D5}",
      ".qxappender .level-error{background:#FFE2D5}",
      ".qxappender .level-user{background:#E3EFE9}",
      ".qxappender .type-string{color:black;font-weight:normal;}",
      ".qxappender .type-number{color:#155791;font-weight:normal;}",
      ".qxappender .type-boolean{color:#15BC91;font-weight:normal;}",
      ".qxappender .type-array{color:#CC3E8A;font-weight:bold;}",
      ".qxappender .type-map{color:#CC3E8A;font-weight:bold;}",
      ".qxappender .type-key{color:#565656;font-style:italic}",
      ".qxappender .type-class{color:#5F3E8A;font-weight:bold}",
      ".qxappender .type-instance{color:#565656;font-weight:bold}",
      ".qxappender .type-stringify{color:#565656;font-weight:bold}"
    ];

    // Include stylesheet
    qx.bom.Stylesheet.createElement(style.join(""));

    // Finally register to log engine
    qx.log.Logger.register(this);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __element: null,

    /**
     * Configures the DOM element to use.
     *
     * @param element {Element} DOM element to log to
     */
    setElement(element) {
      // Clear old element
      this.clear();

      // Add classname
      if (element) {
        qx.bom.element.Class.add(element, "qxappender");
      }

      // Link to element
      this.__element = element;
    },

    /**
     * Clears the current output.
     *
     */
    clear() {
      var elem = this.__element;

      // Remove all messages
      if (elem) {
        elem.innerHTML = "";
      }
    },

    /**
     * Processes a single log entry
     *
     * @signature function(entry)
     * @param entry {Map} The entry to process
     */
    process(entry) {
      var elem = this.__element;

      if (!elem) {
        return;
      }

      // Append new content
      var formatter = qx.log.appender.Formatter.getFormatter();
      elem.appendChild(formatter.toHtml(entry));

      // Scroll down
      elem.scrollTop = elem.scrollHeight;
    }
  }
});

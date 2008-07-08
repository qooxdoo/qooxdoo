qx.Class.define("qx.log.appender.Element",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(element)
  {
    this.base(arguments);

    var style =
    [
      '.qxappender .level-debug{background:white}',
      '.qxappender .level-info{background:#DEEDFA}',
      '.qxappender .level-warn{background:#FFF7D5}',
      '.qxappender .level-error{background:#FFE2D5}',
      '.qxappender .level-user{background:#E3EFE9}',
      '.qxappender .type-string{color:black;font-weight:normal;}',
      '.qxappender .type-number{color:#155791;font-weight:normal;}',
      '.qxappender .type-boolean{color:#15BC91;font-weight:normal;}',
      '.qxappender .type-array{color:#CC3E8A;font-weight:bold;}',
      '.qxappender .type-map{color:#CC3E8A;font-weight:bold;}',
      '.qxappender .type-key{color:#565656;font-style:italic}',
      '.qxappender .type-class{color:#5F3E8A;font-weight:bold}',
      '.qxappender .type-instance{color:#565656;font-weight:bold}',
      '.qxappender .type-stringify{color:#565656;font-weight:bold}'
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

  members :
  {
    /**
     * Configures the DOM element to use.
     *
     * @type member
     * @param element {Element} DOM element to log to
     * @return {void}
     */
    setElement : function(element)
    {
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
     * @type static
     * @return {void}
     */
    clear : function()
    {
      var elem = this.__element;

      // Remove all messages
      if (elem) {
        elem.innerHTML = "";
      }
    },


    /**
     * Processes a single log entry
     *
     * @type static
     * @signature function(entry)
     * @param entry {Map} The entry to process
     * @return {void}
     */
    process : function(entry)
    {
      var elem = this.__element;

      if (!elem) {
        return;
      }

      // Append new content
      elem.appendChild(qx.log.appender.Util.toHtml(entry));

      // Scroll down
      elem.scrollTop = elem.scrollHeight;
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__element");
  }
});

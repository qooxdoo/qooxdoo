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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * DOM wrapper for input elements.
 */
qx.Class.define("qx.html.Input",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param type {String} The type of the input field. Valid values are
   *   <code>text</code>, <code>textarea</code>, <code>select</code>,
   *   <code>checkbox</code>, <code>radio</code>, <code>password</code>,
   *   <code>hidden</code>, <code>submit</code>, <code>image</code>,
   *   <code>file</code>, <code>search</code>, <code>reset</code>,
   *   <code>select</code> and <code>textarea</code>.
   */
  construct : function(type)
  {
    this.base(arguments);
    this.__type = type;
    this.__inputJobs = {};
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {String} The input element type */
    __type : null,

    /** {String} The current value of the input element */
    __value : "",

    /** {Boolean} Whether text wrap is currently turned on */
   __wrap : null,

    /** {Map} Input element jobs */
    __inputJobs : null,


    /**
     * Sets the value of the input element.
     *
     * @param value {var} the new value
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setValue : function(value)
    {
      this.__value = value;
      this.__inputJobs.value = true;
      return this;
    },


    /**
     * Get the current value.
     *
     * @return {String} The element's current value.
     */
    getValue : function()
    {
      if (this._element) {
        return qx.bom.element.Attribute.get(this._element, "value");
      } else {
        return this.__value;
      }
    },


    /**
     * Sets the text wrap behaviour of a text area element.
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     */
    setTextAreaWrap : function(wrap)
    {
      this.__wrap = wrap;
      this.__inputJobs.wrap = true;
      return this;
    },


    // overridden
    _createDomElement : function()
    {
      this._element = qx.bom.Input.create(this.__type);
      this._element.QxElement = this;
    },


    /**
     * Perform all input element jobs
     */
    __applyData : function()
    {
      var jobs = this.__inputJobs;

      if (jobs.value) {
        qx.bom.Input.setValue(this._element, this.__value);
      }

      if (jobs.wrap) {
        qx.bom.Input.setTextAreaWrap(this._element, this.__wrap);
      }
    },


    // overridden
    _copyData : function()
    {
      this.base(arguments);
      this.__applyData();
    },

    // overridden
    _syncData : function()
    {
      this.base(arguments);
      this.__applyData();
    }

  }
});
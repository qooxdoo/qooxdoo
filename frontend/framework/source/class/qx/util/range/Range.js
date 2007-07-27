/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This manager is used by all objects which needs ranges like qx.ui.form.Spinner, ...
 */
qx.Class.define("qx.util.range.Range",
{
  extend : qx.core.Target,
  implement : [ qx.util.range.IRange ],



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "change" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** current value of the Range object */
    value :
    {
      check : "!isNaN(value)&&value>=this.getMin()&&value<=this.getMax()",
      nullable : true,
      init : 0,
      event : "change"
    },

    /** minimal value of the Range object */
    min :
    {
      check : "Number",
      apply : "_applyMin",
      event : "change",
      init : 0
    },

    /** maximal value of the Range object */
    max :
    {
      check : "Number",
      apply : "_applyMax",
      event : "change",
      init : 100
    },

    /** whether the value should wrap around */
    wrap :
    {
      check : "Boolean",
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMax : function(value, old) {
      this.setValue(Math.min(this.getValue(), value));
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMin : function(value, old) {
      this.setValue(Math.max(this.getValue(), value));
    },


    limit : function(value)
    {
      if (this.getWrap()) {
        var value = Math.round(value);

        if (value < this.getMin()) {
          return (this.getMax() - (this.getMin() - value)) + 1;
        }
        if (value > this.getMax()) {
          return (this.getMin() + (value - this.getMax())) - 1;
        }
      }

      if (value < this.getMin()) {
        return this.getMin();
      }

      if (value > this.getMax()) {
        return this.getMax();
      }

      return Math.round(value);
    }
  }
});

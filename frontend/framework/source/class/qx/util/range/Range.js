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

************************************************************************ */

/**
 * This manager is used by all objects which needs ranges like qx.ui.form.Spinner, ...
 */
qx.Class.define("qx.util.range.Range",
{
  extend : qx.core.Object,
  implement : [ qx.util.range.IRange ],



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /**
     * Dispatched if the current value, the minimum value of the mximum value
     * changes.
     */
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

    /** maximum fraction digits */
    precision :
    {
      check : "Integer",
      nullable : true,
      event : "change",
      init : 0
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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMax : function(value, old) {
      this.setValue(Math.min(this.getValue(), value));
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMin : function(value, old) {
      this.setValue(Math.max(this.getValue(), value));
    },


    limit : function(value)
    {
      var precision = this.getPrecision();
      if (precision != null) {
        var mover = Math.pow(10, precision);
      }

      if (this.getWrap())
      {
        if (precision != null) {
          // round to the precision'th digit
          var value = Math.round(value * mover) / mover;
        }

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

      if (precision != null) {
        return Math.round(value * mover) / mover;
      } else {
        return value;
      }
    }
  }
});

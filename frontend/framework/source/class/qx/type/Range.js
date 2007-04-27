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
qx.Class.define("qx.type.Range",
{
  extend : qx.core.Target,
  implement : [ qx.type.IRange ],



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
      apply : "_modifyMin",
      event : "change",
      init : 0
    },

    /** maximal value of the Range object */
    max :
    {
      check : "Number",
      apply : "_modifyMax",
      event : "change",
      init : 100
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
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyMax : function(propValue, propOldValue, propData) {
      this.setValue(Math.min(this.getValue(), propValue));
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyMin : function(propValue, propOldValue, propData) {
      this.setValue(Math.max(this.getValue(), propValue));
    },


    limit : function(value)
    {
      if (value < this.getMin()) {
        return this.getMin();
      }

      if (value > this.getMax()) {
        return this.getMax();
      }

      return value;
    }
  }
});

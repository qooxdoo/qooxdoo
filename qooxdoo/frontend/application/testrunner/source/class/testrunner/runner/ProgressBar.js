/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(testrunner)

************************************************************************ */

qx.Class.define("testrunner.runner.ProgressBar",
{
  extend : qx.ui.layout.HorizontalBoxLayout,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.set(
    {
      width   : "auto",
      spacing : 10
    });

    var label = arguments[0] || "Progress:";

    this.label = new qx.ui.basic.Label(label);
    this.add(this.label);
    this.setLabel(label);

    this.hull = new qx.ui.layout.CanvasLayout();
    this.add(this.hull);

    this.hull.set(
    {
      height          : 20,
      width           : 200,
      backgroundColor : "#C1ECFF",
      border          : "inset"
    });

    this.bar = new qx.ui.basic.Terminator();
    this.hull.add(this.bar);

    this.bar.set(
    {
      // height : 10,
      height          : "100%",
      width           : "0%",

      // left   : 0,
      backgroundColor : "#0000FF"
    });

    this.bar.setStyleProperty("fontSize", 0);  // for IE

    this.stepStatus = new qx.ui.basic.Label("(0/0)");
    this.add(this.stepStatus);

    if (!this.isShowStepStatus()) {
      this.stepStatus.setDisplay(false);
    }

    this.pcntStatus = new qx.ui.basic.Label("(0%)");
    this.add(this.pcntStatus);

    if (!this.isShowPcntStatus()) {
      this.pcntStatus.setDisplay(false);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    status : { check : "Integer" },

    label :
    {
      check : "String",
      apply : "_applyLabel"
    },

    barWidth :
    {
      check : "Integer",
      apply : "_applyBarWidth"
    },

    showStepStatus :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyShowStepStatus"
    },

    stepStatus :
    {
      check : "String",
      init  : "",
      apply : "_applyStepStatus"
    },

    showPcntStatus :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyShowPcntStatus"
    },

    pcntStatus :
    {
      check : "String",
      init  : "",
      apply : "_applyPcntStatus"
    },

    barColor :
    {
      check : "Color",
      apply : "_applyBarColor"
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
     * For future testing only.
     *
     * @internal
     * @type member
     * @return {void}
     */
    showOff : function()
    {
      this.debug("Entering showOff...");
      var r = new qx.util.range.IntegerRange(0, 100, 5);
      var i;

      function delay()
      {
        for (var i=0; i<10000000; i++) {}
      }

      while ((i = r.next()) != null)
      {
        this.debug("Running i: " + i);
        this.update(String(i) + "%");
        delay();
      }

      this.debug("Leaving showOff...");
    },

    // update with increment
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    increment : function() {},


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    reset : function()
    {
      this.stepStatus.setText("");
      this.pcntStatus.setText("");
      this.bar.setWidth("0%");
    },

    /*
     * @param val {String} val can be either a fraction ("5/12") specifying the degree
     *            of completeness with discrete values (like 5 of 12 items have
     *            been complete); or a percentage ("68%") of the degree of
     *            completeness.
     */

    /**
     * TODOC
     *
     * @type member
     * @param val {var} TODOC
     * @return {boolean} TODOC
     * @throws TODOC
     */
    update : function(val)
    {
      var paramError = "Parameter to 'update' function must be a string representing a fraction or a percentage.";  // type error
      var quotVal, pcntVal;

      if (typeof (val) != 'string') {
        throw new Error(paramError);
      }

      if (val.indexOf("/") > -1)
      {
        // handle curr/total spec
        quot = val.split("/");

        if ((quot.length != 2) || (isNaN(quot[0] = parseInt(quot[0]))) || (isNaN(quot[1] = parseInt(quot[1]))) || (quot[0] <= 0) || (quot[1] <= 0) || (quot[0] > quot[1])) {
          throw new Error(paramError);
        }
        else
        {
          quotVal = Math.round(quot[0] / quot[1] * 100);
          this.bar.setWidth(quotVal + "%");
          qx.ui.core.Widget.flushGlobalQueues();
          this.stepStatus.setText("(" + val + ")");
          this.pcntStatus.setText("(" + quotVal + "%)");
        }
      }

      // alternative use properties, e.g. this.setPcntStatus(..)
      else if (val[val.length - 1] = "%")
      {  // ends in '%'

        // handle percent spec
        var pcnt = parseInt(val.slice(0, val.length - 1));

        if (pcnt == NaN || (pcnt < 0 || pcnt > 100)) {
          throw new Error(paramError);
        }
        else
        {
          this.bar.setWidth(pcnt + "%");
          qx.ui.core.Widget.flushGlobalQueues();
          this.pcntStatus.setText("(" + pcnt + "%)");
          quotVal = pcnt + "/100";
          this.stepStatus.setText("(" + quotVal + ")");
        }
      }
      else
      {
        // throw invalid update spec exception
        throw new Error(paramError);
      }

      return true;
    },  // update


    /**
     * TODOC
     *
     * @type member
     * @param newLabel {var} TODOC
     * @return {void}
     */
    _applyLabel : function(newLabel) {
      this.label.setText(newLabel);
    },


    /**
     * TODOC
     *
     * @type member
     * @param newWidth {var} TODOC
     * @return {void}
     */
    _applyBarWidth : function(newWidth) {
      this.hull.setWidth(newWidth);
    },


    /**
     * TODOC
     *
     * @type member
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyShowStepStatus : function(newStatus)
    {
      if (newStatus) {
        this.stepStatus.setDisplay(true);
      } else {
        this.stepStatus.setDisplay(false);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyStepStatus : function(newStatus)
    {
      if (this.isShowStepStatus()) {
        this.stepStatus.setText(newStatus);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyShowPcntStatus : function(newStatus)
    {
      if (newStatus) {
        this.pcntStatus.setDisplay(true);
      } else {
        this.pcntStatus.setDisplay(false);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyPcntStatus : function(newStatus)
    {
      if (this.isShowPcntStatus()) {
        this.pcntStatus.setText(newStatus);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param newColor {var} TODOC
     * @return {void}
     */
    _applyBarColor : function(newColor) {
      this.bar.setBackgroundColor(newColor);
    }
  },


  destruct : function ()
  {
    this._disposeObjects(
      "label",
      "hull",
      "bar",
      "stepStatus",
      "pcntStatus"
    );
  }

});

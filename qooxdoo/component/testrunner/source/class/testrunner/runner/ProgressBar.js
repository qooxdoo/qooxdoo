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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

qx.Class.define("testrunner.runner.ProgressBar",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.HBox(10));

    this.hull = new qx.ui.container.Composite(new qx.ui.layout.Canvas);
    this.add(this.hull);

    this.hull.set(
    {
      height          : 20,
      width           : 200,
      decorator       : "input"
    });


    this.bar = new qx.ui.core.Widget
    this.hull.add(this.bar);

    this.bar.set({
      width : 0,
      height: 20,
      backgroundColor : "#0000FF"
    });

    this.stepStatus = new qx.ui.basic.Label("(0/0)");
    this.add(this.stepStatus);

    if (!this.isShowStepStatus()) {
      this.stepStatus.exclude();
    }

    this.pcntStatus = new qx.ui.basic.Label("(0%)");
    this.add(this.pcntStatus);

    if (!this.isShowPcntStatus()) {
      this.pcntStatus.exclude();
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
     * @return {void}
     */
    increment : function() {},


    /**
     * TODOC
     *
     * @return {void}
     */
    reset : function()
    {
      this.stepStatus.setContent("");
      this.pcntStatus.setContent("");
      this.bar.setWidth(0);
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
          this.bar.setWidth(quotVal * (this.hull.getWidth() / 100) );
          this.stepStatus.setContent("(" + val + ")");
          this.pcntStatus.setContent("(" + quotVal + "%)");
        }
      }

      // alternative use properties, e.g. this.setPcntStatus(..)
      else if (val[val.length - 1] = "%")
      {  // ends in '%'
        this.error("percentage found")
        return true;

        // handle percent spec
        var pcnt = parseInt(val.slice(0, val.length - 1));

        if (pcnt == NaN || (pcnt < 0 || pcnt > 100)) {
          throw new Error(paramError);
        }
        else
        {
          this.bar.setWidth(pcnt);
          this.pcntStatus.setContent("(" + pcnt + "%)");
          quotVal = pcnt + "/100";
          this.stepStatus.setContent("(" + quotVal + ")");
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
     * @param newLabel {var} TODOC
     * @return {void}
     */
    _applyLabel : function(newLabel) {
      this.label.setContent(newLabel);
    },


    /**
     * TODOC
     *
     * @param newWidth {var} TODOC
     * @return {void}
     */
    _applyBarWidth : function(newWidth) {
      this.hull.setWidth(newWidth);
    },


    /**
     * TODOC
     *
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyShowStepStatus : function(newStatus)
    {
      if (newStatus) {
        this.stepStatus.show();
      } else {
        this.stepStatus.exclude();
      }
    },


    /**
     * TODOC
     *
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyStepStatus : function(newStatus)
    {
      if (this.isShowStepStatus()) {
        this.stepStatus.setContent(newStatus);
      }
    },


    /**
     * TODOC
     *
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyShowPcntStatus : function(newStatus)
    {
      if (newStatus) {
        this.pcntStatus.show();
      } else {
        this.pcntStatus.exclude();
      }
    },


    /**
     * TODOC
     *
     * @param newStatus {var} TODOC
     * @return {void}
     */
    _applyPcntStatus : function(newStatus)
    {
      if (this.isShowPcntStatus()) {
        this.pcntStatus.setContent(newStatus);
      }
    },


    /**
     * TODOC
     *
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

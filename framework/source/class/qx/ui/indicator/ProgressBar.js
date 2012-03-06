/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * The Progress bar is designed to simply display the current % complete
 * for a process.
 *
 * The Value is limited between 0 and Maximum value.
 * It's not allowed to set a Maximum value of 0.  If you set a Maximum value
 * bigger than 0, but smaller than Value, it will be limited to Value.
 *
 * The following example creates and adds a progress bar to the root element.
 * A listener is used to show the user if the value is changed,
 * and another one when the progress is complete.
 *
 * <pre class='javascript'>
 * var pb = new qx.ui.indicator.ProgressBar();
 * this.getRoot().add(pb, { left : 20, top: 20});
 *
 * pb.addListener("change", function(e) {
 *   this.debug(e.getData()); // % complete
 *   this.debug(pb.getValue()); // absolute value
 * });
 *
 * pb.addListener("complete", function(e) {
 *   this.debug("complete");
 * });
 *
 * //set a value
 * pb.setValue(20);
 * </pre>
 */
qx.Class.define("qx.ui.indicator.ProgressBar",
{
  extend: qx.ui.container.Composite,


  /**
   * @param value {Number ? 0} Progress bar value
   * @param maximum {Number ? 100} Progress bar maximum value
   */
  construct: function(value, maximum) {
    this.base(arguments);

    this._createChildControl("progress");

    this.setLayout(new qx.ui.layout.HBox());

    if (maximum != null) {
      this.setMaximum(maximum);
    }

    if (value != null) {
      this.setValue(value);
    }

  },


  properties:
  {
    appearance:
    {
      refine: true,
      init: "progressbar"
    }
  },


  events:
  {
    /**
     * Fired when the process is complete (value === maximum value)
     */
    complete: "qx.event.type.Event",


    /**
     * Fired when the % complete value is changed.
     */
    change: "qx.event.type.Data"
  },


  members:
  {
    __value: 0,
    __maximum: 100,


    /**
     * Returns the progress bar value.
     *
     * @return progress bar value.
     */
    getValue: function() {
      return this.__value;
    },


    /**
     * Sets the value of the progress bar.
     *
     * @param value {Number} New value of the progress bar.
     * @return The unmodified incoming value.
     */
    setValue: function(value) {
      var max = this.getMaximum();

      //do nothing if is not a number
      if (!qx.lang.Type.isNumber(value) || !isFinite(value)) {
        return;
      }

      // limit value to 0
      if (value < 0) {
        value = 0;
      }

      // limit value to max
      if (value > max) {
        value = max;
      }

      //set value
      this.__value = value;

      //update progress
      this._changeProgress(value / max);

      return value;
    },


    /**
     * Returns the maximum value of progress bar.
     *
     * @return maximum value of progress bar.
     */
    getMaximum: function() {
      return this.__maximum;
    },


    /**
     * Sets the maximum value of the progress bar.
     *
     * @param value {Number} New maximum value progress bar.
     * @return The unmodified incoming value.
     */
    setMaximum: function(value) {
      var max = value;
      var val = this.getValue();

      //do nothing if is not a number, is negative or zero
      if (!qx.lang.Type.isNumber(max) || !isFinite(max) || max <= 0) {
        return;
      }

      //limit max to a greater than 0 value
      if (max < val) {
        max = val;
      }

      //set max
      this.__maximum = max;

      //update progress
      this._changeProgress(val / max);

      return max;
    },


    //overridden
    _createChildControlImpl: function(id, hash) {
      var control;

      switch (id)
      {
        case "progress":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          this._add(control, { width: "0%" });
          break;
      }
      return control || this.base(arguments, id);
    },


  /**
   * Update the progress bar.
   *
   * @param value {Number} future value of progress bar
   */
    _changeProgress: function(value) {
      var bar = this.getChildControl("progress");
      var to = Math.floor(value * 100);
      var from = parseInt(bar.getLayoutProperties().width, 10);

      bar.setLayoutProperties({width: to + "%"});

      //fire change event
      if (to != from) {
        this.fireDataEvent("change", to, from);
      }

      //fire complete event if 100% complete
      if (to === 100) {
        this.fireEvent("complete");
      }
    }
  }
});

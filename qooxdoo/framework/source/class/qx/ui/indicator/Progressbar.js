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
 * The following example creates and adds a progress bar to the root element.
 * A listener is used to show the user if the value is changed, 
 * and another one when the progress is complete.
 *
 * <pre class='javascript'>
 * var pb = new qx.ui.indicator.Progressbar();
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
qx.Class.define("qx.ui.indicator.Progressbar", 
{
  extend: qx.ui.container.Composite,
   

  /**
   * @param value {Number ? 0} Progress bar value
   * @param max {Number ? 100} Progress bar maximum value 
   */
  construct: function(value, max) {
    this.base(arguments);
    this._createChildControl("progress");

    this.set({
      width: 200,
      height: 20,
      layout: new qx.ui.layout.HBox()
    });

    this.setValue(value || 0);
    this.setMax(max || 100);
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
     * Fired when the % complete is changed.
     */
    change: "qx.event.type.Data"
  },


  members: 
  {
    __bar: null,
    __value: 0,
    __max: 100,

    
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
      var max = this.getMax();

      //do nothing if is not a number, 
      //is negative 
      //or is greater than Max
      if (!qx.lang.Type.isNumber(value) || 
          !isFinite(value) || 
          value < 0 || 
          value > max) {
        return;
      }

      //set value
      this.__value = value;

      //update progress
      this.__changeProgress(value / max);

      return value;
    },


    /**
     * Returns the maximum value of progress bar.
     *
     * @return maximum value of progress bar.
     */
    getMax: function() {
      return this.__max;
    },


    /**
     * Sets the maximum value of the progress bar.
     *
     * @param value {Number} New maximum value progress bar.
     * @return The unmodified incoming value.
     */
    setMax: function(value) {
      var max = value;
      var val = this.getValue();

      //do nothing if is not a number, 
      //is negative or zero 
      //or is smaller than Value
      if (!qx.lang.Type.isNumber(max) || 
          !isFinite(max) || 
          max <= 0 ||
          max < val) {
        return;
      }

      //set max
      this.__max = max;

      //update progress
      this.__changeProgress(val / max);

      return max;
    },


    //overridden
    _createChildControlImpl: function(id) {
      switch (id)
      {
        case "progress":
          this.__bar = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          this._add(this.__bar, { width: "0%" });
          break;
      }
      return this.__bar || this.base(arguments, id);
    },


  /**
   * Update the progress bar. 
   *
   * @param value {Number} future value fo progress bar
   */
    __changeProgress: function(value) {
      var to = Math.round(value * 100);
      var from = parseInt(this.__bar.getLayoutProperties().width, 10);

      this.__bar.setLayoutProperties({width: to + "%"});

      //fire change event
      if (to != from) {
        this.fireDataEvent("change", to, from);
      }

      //fire complete event
      if (to == 100) {
        this.fireEvent("complete");
      }
    }
  }
});

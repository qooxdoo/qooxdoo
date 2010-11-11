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
     * Adrian Olaru (adrianolaru)


************************************************************************ */

/**
 * The Progress bar is designed to simply display the current % complete for a process. 
 * 
 * The following example creates and adds a progress bar to the root element.
 * A listener alerts the user if the value is changed, and another one
 * when the progress is complete.
 *
 * <pre class='javascript'>
 * var pb = new qx.ui.control.Progressbar();
 * this.getRoot().add(pb, { left : 20, top: 20});
 *
 * pb.addListener("changeValue", function(e) {
 *   alert(e.getData());
 * });
 *
 * pb.addListener("complete", function(e) {
 *   alert("complete");
 * });
 *
 * //set a value
 * pb.setValue(20);
 * </pre>
 */
qx.Class.define("qx.ui.control.Progressbar", 
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
      value: value || 0,
      max: max || 100,
      width: 200,
      height: 20,
      layout: new qx.ui.layout.HBox()
    });
  },
  
  properties: 
  {
    appearance: 
    {
      refine: true,
      init: "progressbar"
    },

    /** The value of progress bar */
    value: 
    {
      check: "Number",
      init: 0,
      nullable: false,
      apply: "_applyValue"
    },

    /** The maximum value of progress bar */
    max: 
    {
      check: "Number",
      init: 100,
      nullable: false,
      apply: "_applyMax"
    }
  },
  
  events:
  {
    /**
     * Fired on change of the property {@link #value}
     */
    changeValue: "qx.event.type.Data",

    /**
     * Fired when the process is complete (value === maximum value)
     */
    complete: "qx.event.type.Data"
  },

  members: 
  {
    _createChildControlImpl: function(id) {
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

    _applyValue: function(newValue, oldValue) {
      var max = this.getMax();

      if (newValue) {
        this.__changeProgress(oldValue/max, newValue/max);
        //fire changeValue event
        this.fireDataEvent("changeValue", newValue, oldValue);
        //fire complete event
        if (this.getValue() === this.getMax()) {
          this.fireDataEvent("complete", newValue, oldValue);
        }
      }
    },

    _applyMax: function(newValue, oldValue) {
      var value = this.getValue();

      if (newValue) {
        this.__changeProgress(value/oldValue, value/newValue);
      }
    },
    
  /**
   * Update the progress bar. 
   *
   * @param from {Number } current value of progress bar
   * @param to {Number } future value fo progress bar
   */
    __changeProgress: function(from, to) {
      from = Math.round(from * 100);
      to = Math.round(to * 100);

      var progress = this.getChildControl("progress");
      var dom = progress.getContainerElement().getDomElement();
      this.add(progress, { width: to + "%" });
    }
  }
});

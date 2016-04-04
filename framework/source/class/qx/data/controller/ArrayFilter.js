/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com

************************************************************************ */

/**
 * Manages a copy of a {@link qx.data.Array}, but with a filter and/or sort applied
 * 
 * The filtered/sorted array is available in the "filtered" property 
 */
qx.Class.define("qx.data.controller.ArrayFilter", {
  extend: qx.core.Object,
  
  /**
   * Constructor
   */
  construct: function() {
    this.base(arguments);
    this.setFiltered(new qx.data.Array);
  },

  /**
   * Destructor
   */
  destruct: function() {
    this._disposeArray(this.getFiltered());
  },
  
  properties: {
    /** Model - this is the source array that is filtered and sorted into the filtered property */
    model: {
      init: null,
      nullable: true,
      check: "qx.data.Array",
      apply: "_applyModel",
      event: "changeModel"
    },
    
    /** Filtered and copied version of model; this can be changed, but not set to null */
    filtered: {
      nullable: false,
      check: "qx.data.Array",
      apply: "_applyFiltered",
      event: "changeFiltered"
    },
    
    /** Method called to sort */
    sortMethod: {
      init: null,
      nullable: false,
      apply: "_applyXxx"
    },
    
    /** Method called to filter */
    filterMethod: {
      init: null,
      nullable: true,
      apply: "_applyXxx"
    },
    
    /** Method called after the filter is complete */
    postFilterMethod: {
      init: null,
      nullable: true
    }
  },
  
  events: {
    "change": "qx.event.type.Data"
  },
  
  members: {
    /**
     * Updates the filtered array
     */
    update: function() {
      if (this.isDisposed())
        return;
      var model = this.getModel();
      var filtered = this.getFiltered();
      if (!model || !model.getLength()) {
        filtered.removeAll();
        return;
      }
      
      var clone;
      
      // Filter
      if (this.getFilterMethod())
        clone = model.toArray().filter(this.getFilterMethod());
      else
        clone = model.toArray().slice(0);

      // Post Filter
      if (this.getPostFilterMethod())
        this.getPostFilterMethod()(clone);
      
      // Sort
      if (this.getSortMethod())
        clone.sort(this.getSortMethod());
      
      // Update
      if (!qx.lang.Array.equals(clone, filtered.toArray())) {
        clone.splice(0, 0, 0, filtered.getLength());
        filtered.splice.apply(filtered, clone).dispose();
      }
    },
    
    /**
     * Event handler for changes to the model's contents
     */
    _onModelChange: function(evt) {
      if (evt.getData().type != "order")
        this.update();
    },
    
    /**
     * Does the filter test
     */
    filter: function(value) {
      var fn = this.getFilterMethod();
      return fn ? fn(value) : true;
    },
    
    /**
     * Copies those in src that pass the filter test into dest
     */
    copyFilter: function(src, dest) {
      if (!src)
        src = [];
      else if (this.getFilterMethod())
        src = src.toArray().filter(this.getFilterMethod());
      else
        src = src.toArray().slice(0);

      if (!qx.lang.Array.equals(src, dest.toArray())) {
        src.splice(0, 0, 0, dest.getLength());
        dest.splice.apply(dest, src).dispose();
      }
    },
    
    /**
     * Apply for model
     */
    _applyModel: function(value, oldValue) {
      if (oldValue)
        oldValue.removeListener("change", this._onModelChange, this);
      if (value)
        value.addListener("change", this._onModelChange, this);
      this.update();
    },
    
    /**
     * Apply for filtered
     */
    _applyFiltered: function(value, oldValue) {
      if (oldValue)
        oldValue.removeListener("change", this.__onFilteredChange, this);
      this.update();
      if (value)
        value.addListener("change", this.__onFilteredChange, this);
    },
    
    /**
     * Event handler for when the filtered is changed, passes
     */
    __onFilteredChange: function(evt) {
      this.fireDataEvent("change", evt.getData());
    },
    
    /**
     * Apply for filteredMethod, sortMethod - anything that needs to refilter the array 
     */
    _applyXxx: function() {
      this.update();
    }
  }
});
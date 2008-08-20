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
     * Martin Wittemann (martinwittemann)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * A tab view is a multi page view where only one page is visible
 * at each moment. It is possible to switch the pages using the
 * buttons rendered by each page.
 */
qx.Class.define("qx.ui.tabview.TabView",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MContentPadding],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param barPosition {String} Initial bar position ({@link #barPosition})
   */
  construct : function(barPosition)
  {
    this.base(arguments);

    this._createChildControl("bar");
    this._createChildControl("pane");

    // Create manager
    var mgr = this.__radioGroup = new qx.ui.form.RadioGroup;
    mgr.setWrap(false);
    mgr.addListener("changeValue", this._onRadioChangeValue, this);

    // Initialize bar position
    if (barPosition != null) {
      this.setBarPosition(barPosition);
    } else {
      this.initBarPosition();
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "tabview"
    },

    /**
     * This property defines on which side of the TabView the bar should be positioned.
     */
    barPosition :
    {
      check : ["left", "right", "top", "bottom"],
      init : "top",
      apply : "_applyBarPosition"
    },

    /**
     * The selected page inside the TabView.
     */
    selected :
    {
      check : "qx.ui.tabview.Page",
      apply : "_applySelected",
      event : "changeSelected",
      nullable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __radioGroup : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "bar":
          control = new qx.ui.container.SlideBar();
          control.setZIndex(10);
          this._add(control);
          break;

        case "pane":
          control = new qx.ui.container.Stack;
          control.setZIndex(5);
          this._add(control, {flex:1});
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Returns the element, to which the content padding should be applied.
     *
     * @return {qx.ui.core.Widget} The content padding target.
     */
    _getContentPaddingTarget : function() {
      return this._getChildControl("pane");
    },





    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a page to the tabview including its needed button
     * (contained in the page).
     *
     * @param page {qx.ui.tabview.Page} The page which should be added.
     */
    add: function(page)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(page instanceof qx.ui.tabview.Page)) {
          throw new Error("Incompatible child for TabView: " + page);
        }
      }

      var button = page.getButton();
      var bar = this._getChildControl("bar");
      var pane = this._getChildControl("pane");

      // Exclude page
      page.exclude();

      // Register button
      this.__radioGroup.add(button);

      // Add button and page
      bar.add(button);
      pane.add(page);

      // Add state to page
      page.addState(this.__barPositionToState[this.getBarPosition()]);

      // Update states
      page.addState("lastTab");
      var children = this.getChildren();
      if (children[0] == page) {
        page.addState("firstTab");
      } else {
        children[children.length-2].removeState("lastTab");
      }
    },


    /**
     * Removes a page (and its corresponding button) from the TabView.
     *
     * @param page {qx.ui.tabview.Page} The page to be removed.
     */
    remove: function(page)
    {
      var pane = this._getChildControl("pane");
      var bar = this._getChildControl("bar");
      var button = page.getButton();
      var children = pane.getChildren();

      // Try to select next page
      if (this.getSelected() == page)
      {
        var index = children.indexOf(page);
        if (index == 0)
        {
          if (children[1]) {
            this.setSelected(children[1]);
          } else {
            this.resetSelected();
          }
        }
        else
        {
          this.setSelected(children[index-1]);
        }
      }

      // Remove the button and page
      bar.remove(button);
      pane.remove(page);

      // Remove the button from the radio group
      this.__radioGroup.remove(button);

      // Remove state from page
      page.removeState(this.__barPositionToState[this.getBarPosition()]);

      // Update states
      if (page.hasState("firstTab"))
      {
        page.removeState("firstTab");
        if (children[0]) {
          children[0].addState("firstTab");
        }
      }

      if (page.hasState("lastTab"))
      {
        page.removeState("lastTab");
        if (children.length > 0) {
          children[children.length-1].addState("lastTab");
        }
      }
    },


    /**
     * Returns TabView's children widgets.
     *
     * @return {Array} List of children.
     */
    getChildren : function() {
      return this._getChildControl("pane").getChildren();
    },


    /**
     * Returns the positon of the given page in the TabView
     *
     * @param page {qx.ui.tabview.Page} The page to query for
     * @return {Integer} Position of the page in the TabView
     */
    indexOf : function(page) {
      return this._getChildControl("pane").indexOf(page);
    },





    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /** {Map} Maps the bar position to an appearance state */
    __barPositionToState :
    {
      top : "barTop",
      right : "barRight",
      bottom : "barBottom",
      left : "barLeft"
    },


    /**
     * Apply method for the placeBarOnTop-Property.
     *
     * Passes the desired value to the layout of the tabview so
     * that the layout can handle it.
     * It also sets the states to all buttons so they know the
     * position of the bar.
     *
     * @param value {boolean} The new value.
     * @param old {boolean} The old value.
     */
    _applyBarPosition : function(value, old)
    {
      var bar = this._getChildControl("bar");

      var horizontal = value == "left" || value == "right";
      var reversed = value == "right" || value == "bottom";

      var layoutClass = horizontal ? qx.ui.layout.HBox : qx.ui.layout.VBox;

      var layout = this._getLayout();
      if (layout && layout instanceof layoutClass) {
        // pass
      } else {
        this._setLayout(layout = new layoutClass);
      }

      // Update reversed
      layout.setReversed(reversed);

      // Sync orientation to bar
      bar.setOrientation(horizontal ? "vertical" : "horizontal");

      // Read children
      var children = this.getChildren();

      // Toggle state to bar
      if (old)
      {
        var oldState = this.__barPositionToState[old];

        // Update bar
        bar.removeState(oldState);

        // Update pages
        for (var i=0, l=children.length; i<l; i++) {
          children[i].removeState(oldState);
        }
      }

      if (value)
      {
        var newState = this.__barPositionToState[value];

        // Update bar
        bar.addState(newState);

        // Update pages
        for (var i=0, l=children.length; i<l; i++) {
          children[i].addState(newState);
        }
      }
    },


    // property apply
    _applySelected : function(value, old)
    {
      var pane = this._getChildControl("pane");
      var group = this.__radioGroup;

      if (value)
      {
        var button = value.getButton();

        pane.setSelected(value);
        group.setSelected(button);

        button.focus();
        this.scrollChildIntoView(button, null, null, false);
      }
      else
      {
        pane.resetSelected();
        group.resetSelected();
      }
    },






    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the change of the selected item of the radio group.
     * @param e {qx.event.type.Data} The data event
     */
    _onRadioChangeValue : function(e) {
      this.setSelected(qx.core.ObjectRegistry.fromHashCode(e.getData()));
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__radioGroup");
  }
});

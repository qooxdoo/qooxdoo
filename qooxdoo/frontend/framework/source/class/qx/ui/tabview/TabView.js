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
 * @appearance tabview
 */
qx.Class.define("qx.ui.tabview.TabView",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    this._createChildControl("bar");
    this._createChildControl("pane");

    var mgr = this._manager = new qx.ui.form.RadioGroup;
    mgr.setWrap(false);
    mgr.addListener("changeSelected", this._onRadioChangeSelected, this);

    this._setLayout(new qx.ui.layout.VBox());
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
      event : "changeSelected"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {    
    // overridden
    _createChildControlImpl : function(id)
    {
      this.debug(this, id)
      var control;

      switch(id)
      {
        case "bar":
          control = new qx.ui.container.SlideBar();
          this._add(control);
          break;

        case "pane":
          control = new qx.ui.container.Stack;
          this._add(control, {flex:1});
          break;
      }

      return control || this.base(arguments, id);
    },

    __positionInformation : {
      "left" :
      {
        "orientation" : "vertical",
        "layout" : "HBox",
        "barPosition" : "barLeft",
        "reversedLayout" : false
      },
  
      "right" : {
        "orientation" : "vertical",
        "layout" : "HBox",
        "barPosition" : "barRight",
        "reversedLayout" : true
      },
  
      "top" : {
        "orientation" : "horizontal",
        "layout" :"VBox",
        "barPosition" : "barTop",
        "reversedLayout" : false
      },
  
      "bottom" : {
        "orientation" : "horizontal",
        "layout" : "VBox",
        "barPosition" : "barBottom",
        "reversedLayout" : true
      }
    },

    /**
     * Adds a page to the tabview including its needed button
     * (contained in the page). Every new added page will be automatically
     * checked and shown to the user.
     *
     * @param page {qx.ui.tabview.Page} The page which should be added.
     */
    add: function(page)
    {
      // exclude page
      page.exclude();

      // add the button to the bar
      this._getChildControl("bar").add(page.getButton());

      // add the button to the radio manager
      this._manager.add(page.getButton());

      // add the page to the pane
      this._getChildControl("pane").add(page);

      // reset the properties on the tabview (needed for the stats of the buttons)
      this._applyBarPosition(this.getBarPosition());
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
      var manager = this._manager;

      var index = pane.indexOf(page);
      var children = pane.getChildren();

      // try to select next page
      if (index < children.length-1) {
        this.showPage(children[index+1]);
      } else if (index > 0) {
        this.showPage(children[index-1]);
      }

      // add the button to the bar
      bar.remove(page.getButton());

      // add the button to the radio manager
      manager.remove(page.getButton());

      // add the page to the pane
      pane.remove(page);
    },

    /**
     * Returns TabView's children widgets.
     * 
     * @type member
     * @return {Array} List of children.
     */
    getChildren : function()
    {
      return this._getChildControl("bar").getChildren()
    },
    
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

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
      var pane = this._getChildControl("pane");

      // Retrieve position information
      var position = this.__positionInformation[value];
      var layout = (position.layout == "HBox") ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();

      // Apply layout and orientation
      bar.setOrientation(position.orientation);
      this._setLayout(layout);
      this._getLayout().setReversed(position.reversedLayout);

      // Update childrens' states
      var pages = this.getChildren();
      for (var i = 0, l=pages.length; i < l; i++)
      {
        if (old != undefined) {
          pages[i].removeState(this.__positionInformation[old].barPosition);
        }
        pages[i].addState(position.barPosition);
      }

    },


    // property apply
    _applySelected : function(value, old)
    {
      var pane = this._getChildControl("pane");
      pane.setSelected(value);
      this._manager.setSelected(value.getButton());
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
    _onRadioChangeSelected : function(e)
    {
      var pane = this._getChildControl("pane");
      var page = e.getData().getUserData("page");
      pane.setSelected(page);
    }

  }
});

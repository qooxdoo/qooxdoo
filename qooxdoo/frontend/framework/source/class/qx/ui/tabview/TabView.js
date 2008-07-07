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

    var mgr = this._manager = new qx.ui.core.RadioManager;
    mgr.setWrap(false);
    mgr.addListener("change", this._onChange, this);

    this._setLayout(new qx.ui.layout.VBox());
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "tabview"
    },

    alignTabsToLeft :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAlignTabsToLeft"
    },

    placeBarOnTop :
    {
      check : "Boolean",
      init : true,
      apply : "_applyPlaceBarOnTop"
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
      var control;

      switch(id)
      {
        case "bar":
          control = new qx.ui.container.SlideBar();
          control.setLayout(new qx.ui.layout.HBox());
          this._add(control);
          break;

        case "pane":
          control = new qx.ui.container.Composite();
          control.setLayout(new qx.ui.layout.Canvas());
          this._add(control, {flex:1});
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Adds a page to the tabview including its needed button
     * (contained in the page). Every new added page will be automaticaly
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
      this._applyPlaceBarOnTop(this.getPlaceBarOnTop());
      this._applyAlignTabsToLeft(this.getAlignTabsToLeft());
    },


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
     * Shows the given page in the pageview.
     *
     * @param page {qx.ui.tabview.Page} The page to show.
     */
    showPage: function(page) 
    {
      // TODO: check if the button is in the bar
      this._manager.setSelected(page.getButton());
    },


    /**
     * Returns the current active page in the tabview.
     *
     * @return {qx.ui.tabview.Page} The current visible page.
     */
    getCurrentPage: function ()
    {
      // TODO
    },


    /**
     * Apply method fot the alignTabsToLeft-Property.
     * Passes the desired value to the layout of the bar so
     * that the layout can handle it.
     * It also sets the states to all buttons so they know the
     * alignement of the bar.
     *
     * @param value {boolean} The new value.
     * @param old {boolean} The old value.
     */
    _applyAlignTabsToLeft : function(value, old)
    {
      var bar = this._getChildControl("bar");
      bar.getLayout().setAlignX(value ? "left" : "right");
      
      // set or remove the state on the buttons
      var buttons = bar.getChildren();
      
      for (var i = 0; i < buttons.length; i++) 
      {
        if (value) {
          buttons[i].addState("alignLeft");
        } else {
          buttons[i].removeState("alignLeft");
        }
      }
    },


    /**
     * Apply method fot the placeBarOnTop-Property.
     *
     * Passes the desired value to the layout of the tabview so
     * that the layout can handle it.
     * It also sets the states to all buttons so they know the
     * position of the bar.
     *
     * @param value {boolean} The new value.
     * @param old {boolean} The old value.
     */
    _applyPlaceBarOnTop : function(value, old) 
    {
      var bar = this._getChildControl("bar");
      
      // reverse the layout
      this._getLayout().setReversed(!value);
      
      // set or remove the state on the buttons
      var buttons = bar.getChildren();
      
      for (var i = 0; i < buttons.length; i++) 
      {
        if (value) {
          buttons[i].addState("barTop");
        } else {
          buttons[i].removeState("barTop");
        }
      }
    },
    
    
    _onChange : function(e)
    {
      var newButton = e.getData();
      var oldButton = e.getOldValue();

      if (newButton)
      {      
        newButton.getUserData("page").show();
        this._getChildControl("bar").scrollChildIntoView(newButton);
      }
      
      if (oldButton)
      {
        oldButton.getUserData("page").exclude();
      }
    }  
  }
});

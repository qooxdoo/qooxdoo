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
  construct : function() {
    this.base(arguments);

    this._manager = new qx.ui.core.RadioManager().set({
      wrap: false
    });
    this._manager.addListener("change", function(e)
    {
      var button = e.getValue();
      if (button) {
        this._bar.scrollButtonIntoView(button);
      }
    }, this);

    this._bar = this._createBar();
    this._pane = this._createPane();

    this._add(this._bar);
    this._add(this._pane, {flex: 1});
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
    /**
     * Adds a page to the tabview including its needed button
     * (contained in the page). Every new added page will be automaticaly
     * checked and shown to the user.
     *
     * @param page {qx.ui.tabview.Page} The page which should be added.
     */
    add: function(page)
    {
      // add the button to the bar
      this._bar.add(page.getButton());
      // add the button to the radio manager
      this._manager.add(page.getButton());
      // add the page to the pane
      this._pane.add(page);

      // check every new added page
      page.getButton().setChecked(true);

      // reset the properties on the tabview (needed for the stats of the buttons)
      this._applyPlaceBarOnTop(this.getPlaceBarOnTop());
      this._applyAlignTabsToLeft(this.getAlignTabsToLeft());
    },


    remove: function(page)
    {
      var index = this._pane.indexOf(page);
      var children = this._pane.getChildren();

      // try to select next page
      if (index < children.length-1) {
        this.showPage(children[index+1]);
      } else if (index > 0) {
        this.showPage(children[index-1]);
      }

      // add the button to the bar
      this._bar.remove(page.getButton());
      // add the button to the radio manager
      this._manager.remove(page.getButton());
      // add the page to the pane
      this._pane.remove(page);
    },


    /**
     * Shows the given page in the pageview.
     *
     * @param page {qx.ui.tabview.Page} The page to show.
     */
    showPage: function(page) {
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
      if (this._pane.getLayoutChildren().length == 1) {
        return this._pane.getLayoutChildren()[0];
      }
      // TODO: return something if page is not in the view
    },


    /**
     * Constructor helper.
     * Creates the bar for the tab view.
     *
     * @return {qx.ui.core.Widget} A widget configured as tabview bar.
     */
    _createBar: function()
    {
      var bar = new qx.ui.tabview.Bar();
      bar.setLayout(new qx.ui.layout.HBox());
      bar.setAppearance("tabview-bar");
      return bar;
    },


    /**
     * Constructor helper.
     * Creates the pane for the tab view.
     *
     * @return {qx.ui.core.Widget} A widget configured as tabview pane.
     */
    _createPane: function()
    {
      var pane = new qx.ui.container.Composite();
      pane.setLayout(new qx.ui.layout.Canvas());
      pane.setAppearance("tabview-pane");
      return pane;
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
      this._bar.getLayout().setAlignX(value ? "left" : "right");
      // set or remove the state on the buttons
      var buttons = this._bar.getChildren();
      for (var i = 0; i < buttons.length; i++) {
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
    _applyPlaceBarOnTop : function(value, old) {
      // reverse the layout
      this._getLayout().setReversed(!value);
      // set or remove the state on the buttons
      var buttons = this._bar.getChildren();
      for (var i = 0; i < buttons.length; i++) {
        if (value) {
          buttons[i].addState("barTop");
        } else {
          buttons[i].removeState("barTop");
        }
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function() {
    this._disposeObjects("_bar", "_pane", "_manager");
  }
});

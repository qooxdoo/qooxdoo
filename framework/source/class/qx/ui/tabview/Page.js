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
     * Martin Wittemann (martinwittemann)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A page is the way to add content to a {@link TabView}. Each page gets a
 * button to switch to the page. Only one page is visible at a time.
 *
 * @childControl button {qx.ui.tabview.TabButton} tab button connected to the page
 */
qx.Class.define("qx.ui.tabview.Page",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label of the tab
   * @param icon {String} Initial icon of the tab
   */
  construct : function(label, icon)
  {
    this.base(arguments);

    this._createChildControl("button");

    // init
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired by {@link qx.ui.tabview.TabButton} if the close button is clicked.
     */
    "close" : "qx.event.type.Event"
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
      init : "tabview-page"
    },


    /** The label/caption/text of the Page's button. */
    label :
    {
      check : "String",
      init : "",
      apply : "_applyLabel"
    },


    /** Any URI String supported by qx.ui.basic.Image to display an icon in Page's button. */
    icon :
    {
      check : "String",
      init : "",
      apply : "_applyIcon",
      nullable: true
    },

    /** Indicates if the close button of a TabButton should be shown. */
    showCloseButton :
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowCloseButton"
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      barTop : 1,
      barRight : 1,
      barBottom : 1,
      barLeft : 1,
      firstTab : 1,
      lastTab : 1
    },



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old) {
      this.getChildControl("button").setIcon(value);
    },


    // property apply
    _applyLabel : function(value, old) {
      this.getChildControl("button").setLabel(value);
    },


    // overridden
    _applyEnabled: function(value, old)
    {
      this.base(arguments, value, old);

      // delegate to non-child widget button
      // since enabled is inheritable value may be null
      var btn = this.getChildControl("button");
      value == null ? btn.resetEnabled() : btn.setEnabled(value);
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button":
          control = new qx.ui.tabview.TabButton;
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);

          control.setUserData("page", this);
          control.addListener("close", this._onButtonClose, this);
          break;
      }

      return control || this.base(arguments, id);
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyShowCloseButton : function(value, old) {
      this.getChildControl("button").setShowCloseButton(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Fires an "close" event when the close button of the TabButton of the page
     * is clicked.
     */
    _onButtonClose : function() {
      this.fireEvent("close");
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the button used within this page. This method is used by
     * the TabView to access the button.
     *
     * @internal
     * @return {qx.ui.form.RadioButton} The button associated with this page.
     */
    getButton: function() {
      return this.getChildControl("button");
    }
  }
});

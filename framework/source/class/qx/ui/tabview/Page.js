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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * A page is the wax to add content to a {@link TabView}. Each page
 * get a button to switch to the page. Only one page is visible at
 * each time.
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
      apply : "_applyIcon"
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
      this._getChildControl("button").setIcon(value);
    },


    // property apply
    _applyLabel : function(value, old) {
      this._getChildControl("button").setLabel(value);
    },


    // overridden
    _applyEnabled: function(value, old)
    {
      this.base(arguments, value, old);

      // delegate to non-child widget button
      // since enabled is inheritable value may be null
      var btn = this._getChildControl("button");
      value == null ? btn.resetEnabled() : btn.setEnabled(value);
    },




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
        case "button":
          control = new qx.ui.form.RadioButton;
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);
          control.setValue(this.toHashCode());

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
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
      return this._getChildControl("button");
    }
  }
});

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

qx.Class.define("qx.ui.tabview.Page",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon)
  {
    this.base(arguments);
    this._button = this._createButton(label, icon);
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the button used within this page. This method is used by
     * the TabView to access the button.
     *
     * @internal
     * @return {qx.ui.form.RadioButton} The button associated with this page.
     */
    getButton: function() {
      return this._button;
    },


    /**
     * Constructor helper.
     * Creates a new RadioButton and adjusts the button for the
     * needs of the tabview.
     *
     * @param label {String} The label of the button.
     * @param icon {String} Path to the icon.
     * @return {qx.ui.form.RadioButton} The created button.
     */
    _createButton: function(label, icon)
    {
      var button = new qx.ui.form.RadioButton(label);

      // set the icon if a icon path is available
      if (icon) {
        button.setIcon(icon);
      }

      // add a listener for hiding and showing the sites
      button.addListener("change", function(e)
      {
        if (e.getValue()) {
          this.show();
        } else {
          // Use exclude() and not hide() because of
          // "getCurrentPage" in the TabView class
          this.exclude();
        }
      }, this);

      button.setAppearance("tabview/button");

//      button.isFirstVisibleChild() ? button.addState("firstChild") : button.removeState("lastChild");
//      this.isLastVisibleChild() ? this.addState("lastChild") : this.removeState("lastChild");
//      this.getView().getAlignTabsToLeft() ? this.addState("alignLeft") : this.removeState("alignLeft");
//      !this.getView().getAlignTabsToLeft() ? this.addState("alignRight") : this.removeState("alignRight");
//      this.getView().getPlaceBarOnTop() ? this.addState("barTop") : this.removeState("barTop");
//      !this.getView().getPlaceBarOnTop() ? this.addState("barBottom") : this.removeState("barBottom");

      return button;
    },


    /**
     * Overridden apply method.
     * Enables the page and the assicoated button.
     *
     * @param value {boolean} The new value.
     * @param old {boolean} The old value.
     */
    _applyEnabled: function(value, old)
    {
      this.base(arguments, value, old);

      // since enabled is inheritable value may be null
      if (value == null) {
        this._button.resetEnabled();
      } else {
        this._button.setEnabled(value);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_button");
  }
});

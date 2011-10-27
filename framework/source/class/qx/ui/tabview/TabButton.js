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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A TabButton is the clickable part sitting on the {@link qx.ui.tabview.Page}.
 * By clicking on the TabButton the user can set a Page active.
 *
 * @childControl label {qx.ui.basic.Label} label of the tab button
 * @childControl icon {qx.ui.basic.Image} icon of the tab button
 * @childControl close-button {qx.ui.form.Button} close button of the tab button
 */
qx.Class.define("qx.ui.tabview.TabButton",
{
  extend : qx.ui.form.RadioButton,
  implement : qx.ui.form.IRadioItem,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui.layout.Grid(2, 0);
    layout.setRowAlign(0, "left", "middle");
    layout.setColumnAlign(0, "right", "middle");

    this._getLayout().dispose();
    this._setLayout(layout);

    this.initShowCloseButton();
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired by {@link qx.ui.tabview.Page} if the close button is clicked.
     *
     * Event data: The tab button.
     */
    "close" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

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

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      focused : true,
      checked : true
    },

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    _applyIconPosition : function(value, old)
    {

      var children = {
        icon : this.getChildControl("icon"),
        label : this.getChildControl("label"),
        closeButton : this.getShowCloseButton() ? this.getChildControl("close-button") : null
      }

      // Remove all children before adding them again
      for (var child in children)
      {
        if (children[child]) {
          this._remove(children[child]);
        }
      }

      switch (value)
      {
        case "top":
          this._add(children.label, {row: 3, column: 2});
          this._add(children.icon, {row: 1, column: 2});
          if (children.closeButton) {
            this._add(children.closeButton, {row: 0, column: 4});
          }
          break;

        case "bottom":
          this._add(children.label, {row: 1, column: 2});
          this._add(children.icon, {row: 3, column: 2});
          if (children.closeButton) {
            this._add(children.closeButton, {row: 0, column: 4});
          }
          break;

        case "left":
          this._add(children.label, {row: 0, column: 2});
          this._add(children.icon, {row: 0, column: 0});
          if (children.closeButton) {
            this._add(children.closeButton, {row: 0, column: 4});
          }
          break;

        case "right":
          this._add(children.label, {row: 0, column: 0});
          this._add(children.icon, {row: 0, column: 2});
          if (children.closeButton) {
            this._add(children.closeButton, {row: 0, column: 4});
          }
          break;
      }

    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id) {
        case "label":
          var control = new qx.ui.basic.Label(this.getLabel());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 2});
          this._getLayout().setColumnFlex(2, 1);
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 0});
          break;

        case "close-button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          control.setKeepActive(true);
          control.addListener("click", this._onCloseButtonClick, this);
          this._add(control, {row: 0, column: 4});

          if (!this.getShowCloseButton()) {
            control.exclude();
          }

          break;
      }

      return control || this.base(arguments, id);
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Fires a "close" event when the close button is clicked.
     */
    _onCloseButtonClick : function() {
      this.fireDataEvent("close", this);
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyShowCloseButton : function(value, old)
    {
      if (value) {
        this._showChildControl("close-button");
      } else {
        this._excludeChildControl("close-button");
      }
    },

    // property apply
    _applyCenter : function(value)
    {
      var layout = this._getLayout();

      if (value) {
        layout.setColumnAlign(2, "center", "middle");
      } else {
        layout.setColumnAlign(2, "left", "middle");
      }

    }

  }
});
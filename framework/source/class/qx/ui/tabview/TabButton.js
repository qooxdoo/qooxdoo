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


/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/16/actions/window-close.png)
************************************************************************ */


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

    var layout = new qx.ui.layout.Grid(6, 0);
    layout.setRowAlign(0, "left", "middle");
    this._setLayout(layout);
    
    this._createChildControl("close-button");
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  /** Fired by {@link qx.ui.tabview.Page} if the close button is clicked. */
  events :
  {
    "close" : "qx.event.type.Data"
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
    _createChildControlImpl : function(id)
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
          control.addListener("click", this._onCloseButtonClick, this);
          this._add(control, {row: 0, column: 3});
          break;                    
      }

      return control || this.base(arguments, id);
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    _onCloseButtonClick : function()
    {
      this.fireDataEvent("close", this);
    }

  }
});

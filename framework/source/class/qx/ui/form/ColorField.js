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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
#asses icon/16/apps/utilities-color-chooser.png
*/

qx.Class.define("qx.ui.form.ColorField",
{
  extend  : qx.ui.form.ComboBox,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.addListener("click", function(){
      this._getChildControl("list").show();
    }, this);
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
      init : "colorfield"
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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */    

    setColor: function(color)
    {
  
    },

    /*
    ---------------------------------------------------------------------------
      APPLY METHODS
    ---------------------------------------------------------------------------
    */    


    /*
    ---------------------------------------------------------------------------
      OVERRIDDEN METHODS
    ---------------------------------------------------------------------------
    */    
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "list":
          control = new qx.ui.control.ColorPopup();
          control.addListener("changeValue", this._onChangeValue, this);
          control.setFocusable(false);
          control.setKeepFocus(true);        
          break;
          
        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.setAutoHide(false);
          control.add(this._getChildControl("list"));
          break;          
      }

      return control || this.base(arguments, id);
    },

   /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */
    
    _onChangeValue : function(e) {
      this.setValue(e.getData());
    },
    
    _onKeyPress : function(e)
    {
      // if the list is closed, ignore all 
      var list = this._getChildControl("list");
      if (list.getVisibility() == "hidden") {
        return;
      }
      
      // get the key identifier
      var identifier = e.getKeyIdentifier();

      // hide the list always on escape
      if (identifier == "Escape")
      {
        this.close();
        e.stopPropagation();
        return;
      }
      
      // forward the rest of the events to the date chooser
      ////this._getChildControl("list").handleKeyPress(e);
    }

  }

});

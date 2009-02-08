/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2008      Bill Adams, http://mywebserve.com
     2009      Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Bill Adams (badams)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A button which opens the connected popup when clicking on it.
 */
qx.Class.define("qx.ui.table.columnmenu.grid.ColumnMenuButton",
{
  extend     : qx.ui.form.Button,
  implement  : qx.ui.table.IColumnMenu,

  properties :
  {
    /** The popup instance to show when clicking on the button */
    menu :
    {
      check : "qx.ui.popup.Popup",
      nullable : true,
      apply : "_applyPopup",
      event : "changePopup"
    }
  },


  members :
  {
    __table : null,

    factory : function(item, options)
    {
      switch(item)
      {
      case "menu":
        var menu = new qx.ui.table.columnmenu.grid.Menu(options.table);
        this.setMenu(menu);
        return menu;

      case "menu-button":
        var menu = this.getMenu();
        var item =
          new qx.ui.table.columnmenu.grid.MenuItem(menu,
                                                   options.text,
                                                   options.column.toString());

        if (options.bVisible)
        {
          menu.getShowList().add(item);
        }
        else
        {
          menu.getHideList().add(item);
        }
        return item;

      case "user-button":
        var button = new qx.ui.form.Button(options.text);
        button.set(
          {
            appearance: "table-column-reset-button",
            center: true
          });
        return button;

      case "separator":
        var separator = new qx.ui.core.Widget();
        separator.set(
          {
            height : 4
          });
        return separator;

      default:
        throw new Error("Unrecognized factory request: " + item);
      }
    },

    /**
     * Empty the popup of all children
     */  	
    empty : function()
    {
      var menu = this.getMenu();
      var showList = menu.getShowList();
      var hideList = menu.getHideList();

      // If there's a list of columns being shown...
      if (showList)
      {
        // ... then remove the list items.
        var entries = showList.getChildren();
        for (var i = 0, l = entries.length; i<l; i++)
        {
          entries[i].destroy();
        }
      }

      // If there's a list of columns being hidden...
      if (hideList)
      {
        // ... then remove the list items.
        entries = hideList.getChildren();
        for (var i = 0, l = entries.length; i<l; i++)
        {
          entries[i].destroy();
        }
      }

      // Remove the menu child (the lists themselves).
      entries = menu.getChildren();
      for (var i=0,l=entries.length; i<l; i++)
      {
        entries[i].destroy();
      }
    },
    
    // property apply
    _applyPopup : function(value, old)
    {
      if (old)
      {
        old.removeListener("changeVisibility", this._onPopupChange, this);
      }

      if (value)
      {
        value.setAutoHide(false);
        value.addListener("changeVisibility", this._onPopupChange, this);
      }
    },


    /**
     * Listener for visibility property changes of the attached popup
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onPopupChange : function(e)
    {
      var popup = this.getMenu();

      if (popup.isVisible())
      {
        this.addState("pressed");
      }
      else
      {
        this.removeState("pressed");
      }
    },


    // overridden
    _onMouseDown : function(e)
    {
      var popup = this.getMenu();
      if (popup)
      {
        // Toggle popup visibility
        if (popup.isVisible())
        {
          popup.exclude();
        }
        else
        {
	  popup.placeToWidget(this);	  
          popup.show();
        }

        // Event is processed, stop it for others
        e.stopPropagation();
      }
    },


    // overridden
    _onMouseUp : function(e)
    {
      // Just stop propagation
      e.stopPropagation();
    },


    // overridden
    _onMouseOver : function(e)
    {
      // Add hovered state
      this.addState("hovered");
    },


    // overridden
    _onMouseOut : function(e)
    {
      // Just remove the hover state
      this.removeState("hovered");
    },


    // overridden
    _onKeyDown : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
          this.removeState("abandoned");
          this.addState("pressed");

          var popup = this.getMenu();
          if (popup)
          {
            // Toggle popup visibility
	    if (popup.isVisible())
            {
	      popup.exclude();
	    }
            else
            {
	      popup.placeToWidget(this);
	      popup.show();
	    }
          }

          e.stopPropagation();
      }
    },


    // overridden
    _onKeyUp : function(e) {
      // no action required here
    }
  },


   destruct : function()
   {
     if (this.getMenu())
     {
       if (!qx.core.ObjectRegistry.inShutDown) {
         this.getMenu().destroy();
       }
     }
   }
});

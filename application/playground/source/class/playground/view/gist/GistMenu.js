/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("playground.view.gist.GistMenu", 
{
  extend : qx.ui.menu.Menu,


  construct : function()
  {
    this.base(arguments);
        
    this.__items = [];
    
    this.__userNameChange = new playground.view.gist.UserNameMenuItem();
    this.add(this.__userNameChange);
    this.__userNameChange.addListener("reload", function(e) {
      this.__loading();
      this.fireDataEvent("reload", e.getData());
    }, this);
    
    this.__filterCheckBox = new playground.view.gist.CheckBox(
      this.tr("Activate filter for [qx]")
    );
    this.__filterCheckBox.setValue(true);
    this.__filterCheckBox.addListener("changeValue", this.__onFilterChange, this);
    this.add(this.__filterCheckBox);
    
    // separator
    this.add(new qx.ui.menu.Separator());
    
    this.__loadingItem = new playground.view.gist.TextMenuItem(this.tr("Loading..."));
    
    this.__emptyItem = new playground.view.gist.TextMenuItem(this.tr("<em>No gist to show.</em>"));
    this.add(this.__emptyItem);
    this.__items.push(this.__emptyItem);
  },
  
  
  events : {
    "changeGist" : "qx.event.type.Data",
    "reload" : "qx.event.type.Data"
  },


  members :
  {
    __items : null,
    __loadingItem : null,
    __emptyItem : null,
    
    
    __loading : function() 
    {
      // empty the cache
      for (var i = 0; i < this.__items.length; i++) {
        this.remove(this.__items[i]);
      };
      this.__items = [];
      
      this.add(this.__loadingItem);      
    },


    updateGists : function(names, texts) 
    {
      this.remove(this.__loadingItem);
      
      if (names.length == 0) {
        this.add(this.__emptyItem);
        this.__items.push(this.__emptyItem);
        return;
      }
      
      // add the new menu items
      for (var i = 0; i < names.length; i++) {
        // skip empty gists
        if (!texts[i]) continue;
        
        var menuItem = new qx.ui.menu.Button(names[i], "icon/22/actions/edit-paste.png");
        this.add(menuItem);
        this.__items.push(menuItem);
        menuItem.addListener("execute", 
          qx.lang.Function.bind(function(code) {
            this.fireDataEvent("changeGist", code);
          }, this, texts[i])
        );
      };
      this.__onFilterChange();
    },
    
    invalidUser : function(invalid, message) {
      this.__userNameChange.markInvalid(invalid, message);
    },
    
    
    __onFilterChange : function() {
      var on = this.__filterCheckBox.getValue();
      var oneShown = false;
      for (var i = 0; i < this.__items.length; i++) {
        var item = this.__items[i];
        // ignore the status items
        if (item == this.__emptyItem) continue;
        if (on && item.getLabel().indexOf("[qx]") == -1) {
          item.exclude();
        } else {
          oneShown = true;
          item.show();
        }
      };
      
      // handle empty lists after the filtering
      if (!oneShown) {
        this.add(this.__emptyItem);
      } else if (this.indexOf(this.__emptyItem) != -1) {
        this.remove(this.__emptyItem);
      }
    }
  }
});

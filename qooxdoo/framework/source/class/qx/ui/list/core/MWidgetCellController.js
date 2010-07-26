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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Mixin.define("qx.ui.list.core.MWidgetCellController",
{
  construct : function() {
    this.__boundProperties = [];
    this.__boundPropertiesReverse = [];
  },
  
  properties : 
  {
    labelPath :
    {
      check: "String",
      nullable: true
    },

    iconPath :
    {
      check: "String",
      nullable: true
    },
  
    labelOptions :
    {
      nullable: true
    },
  
    iconOptions :
    {
      nullable: true
    },
  
    delegate :
    {
      event: "changeDelegate",
      init: null,
      nullable: true
    }
  },
  
  members :
  {
    __boundProperties : null,
    
    bindDefaultProperties : function(item, index)
    {
      this.bindProperty(
        this.getLabelPath(), "label", this.getLabelOptions(), item, index
      );

      if (this.getIconPath() != null) {
        this.bindProperty(
          this.getIconPath(), "icon", this.getIconOptions(), item, index
        );
      }
    },
    
    bindProperty : function(sourcePath, targetProperty, options, targetWidget, index)
    {
      var bindPath = "model[" + index + "]";
      if (sourcePath != null && sourcePath != "") {
        bindPath += "." + sourcePath;
      }
      
      var id = this._list.bind(bindPath, targetWidget, targetProperty, options);
      targetWidget.setUserData(targetProperty + "BindingId", id);
      
      if (!qx.lang.Array.contains(this.__boundProperties, targetProperty)) {
        this.__boundProperties.push(targetProperty);
      }
    },
    
    bindPropertyReverse: function(targetPath, sourcePath, options, sourceWidget, index)
    {
        var targetBindPath = "model[" + index + "]";
        if (targetPath != null && targetPath != "") {
          targetBindPath += "." + targetPath;
        }

        var id = sourceWidget.bind(sourcePath, this, targetBindPath, options);
        sourceWidget.setUserData(targetPath + "ReverseBindingId", id);

        if (!qx.lang.Array.contains(this.__boundPropertiesReverse, targetPath)) {
          this.__boundPropertiesReverse.push(targetPath);
        }
      },
    
    _createCellRenderer : function() {
      var delegate = this.getDelegate();

      if (delegate != null && delegate.createCellRenderer != null) {
        var renderer = delegate.createCellRenderer();
      } else {
        var renderer = new qx.ui.virtual.cell.ListItemWidgetCell();
      }

      return renderer;
    },
    
    _configureItem : function(item)
    {
      var delegate = this.getDelegate();
      
      if (delegate != null && delegate.configureItem != null) {
        delegate.configureItem(item);
      }
    },
    
    _bindItem: function(item, index) {
      var delegate = this.getDelegate();
      
      if (delegate != null && delegate.bindItem != null) {
        delegate.bindItem(this, item, index);
      } else {
        this.bindDefaultProperties(item, index);
      }
    },
  
    _removeBindingsFrom: function(item) {
      for (var  i = 0; i < this.__boundProperties.length; i++) {
        var id = item.getUserData(this.__boundProperties[i] + "BindingId");
        if (id != null) {
          this._list.removeBinding(id);
        }
      }
      
      for (var i = 0; i < this.__boundPropertiesReverse.length; i++) {
        var id = item.getUserData(this.__boundPropertiesReverse[i] + "ReverseBindingId");
        if (id != null) {
          item.removeBinding(id);
        }
      };
    }
  },

  destruct : function() {
    this.__boundProperties = this.__boundPropertiesReverse = null;
  }
});

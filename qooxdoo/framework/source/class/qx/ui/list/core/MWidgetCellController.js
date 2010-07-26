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
  },
  
  properties : 
  {
    labelPath :
    {
      check: "String",
//      apply: "_applyLabelPath",
      nullable: true
    },

    iconPath :
    {
      check: "String",
//      apply: "_applyIconPath",
      nullable: true
    },
  
    labelOptions :
    {
//      apply: "_applyLabelOptions",
      nullable: true
    },
  
    iconOptions :
    {
//      apply: "_applyIconOptions",
      nullable: true
    },
  
    delegate :
    {
//      apply: "_applyDelegate",
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
    
    bindProperty: function(sourcePath, targetProperty, options, targetWidget, index) {
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
    
    _bindItem: function(item, index) {
      var delegate = this.getDelegate();
      
      if (delegate != null && delegate.bindItem != null) {
        delegate.bindItem(this, item, index);
      } else {
        this.bindDefaultProperties(item, index);
//        var modelData = item.getUserData("binding.modelData");
//        modelData.bind("label", item, "label");
//        modelData.bind("icon", item, "icon");
      }
    },
  
    _removeBindingsFrom: function(item) {
      for (var  i = 0; i < this.__boundProperties.length; i++) {
        var id = item.getUserData(this.__boundProperties[i] + "BindingId");
        if (id != null) {
          this._list.removeBinding(id);
        }
      }
      
//      var modelData = item.getUserData("binding.modelData");
//      modelData.removeAllBindings();
    }
  },

  destruct : function() {
    this.__boundProperties = null;
  }
});

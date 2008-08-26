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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.util.PropertyGroup",
{
  extend : qx.ui.core.Widget,

  construct : function(propertyDescription)
  {
    this.base(arguments);

    this._properties = propertyDescription;

    var layout = new qx.ui.layout.Grid(10, 5);
    layout.setColumnAlign(0, "right", "top");
    layout.setColumnMinWidth(0, 110);
    this._setLayout(layout);

    this.set({
      allowShrinkX: false,
      allowShrinkY: false
    });

    var row = 0;

    for (var prop in this._properties)
    {
      var type = this._properties[prop].type;
      var nullable = this._properties[prop].nullable;

      this._add(new qx.ui.basic.Label(prop).set({
        paddingTop: 4
      }), {row: row, column: 0});

      if (nullable)
      {
        var nullWidget = new qx.ui.form.CheckBox("null");
        nullWidget.addListener("changeChecked", this._createOnNullPropertyChange(prop), this);

        this._add(nullWidget, {row: row, column: 2});
        this._properties[prop].nullWidget = nullWidget;
      }

      if (type == "int")
      {
        var formItem = new qx.ui.form.Spinner().set({
          min: this._properties[prop].min || 0,
          max: this._properties[prop].max !== undefined ? this._properties[prop].max : 1000
        });
        formItem.addListener("changeValue", this._createOnIntPropertyChange(prop), this);
        this._add(formItem, {row: row++, column: 1});
      }
      else if (type == "bool")
      {
        var formItem = new qx.ui.form.CheckBox();
        formItem.addListener("changeChecked", this._createOnBoolPropertyChange(prop), this);
        this._add(formItem, {row: row++, column: 1});
      }
      else if (type == "enum")
      {
        var values = this._properties[prop].values;
        var formItem = new qx.ui.form.RadioGroup();
        for (var i=0; i<values.length; i++)
        {
          var widget = new qx.ui.form.RadioButton(values[i]).set({
            value: values[i]
          });
          formItem.add(widget);
          this._add(widget, {row: row++, column:1});
        }
        formItem.addListener("changeValue", this._createOnEnumPropertyChange(prop, formItem), this);
      }
      else if (type == "string")
      {
        var formItem = new qx.ui.form.TextField();
        formItem.addListener("input", this._createOnIntPropertyChange(prop), this);
        this._add(formItem, {row: row++, column: 1});
      }

      this._properties[prop].formItem = formItem;
    }
  },


  statics :
  {
    WIDGET_PROPERTIES :
    {
      "width" : {type: "int", nullable: true},
      "height": {type: "int", nullable: true},
      "minWidth": {type: "int", nullable: true},
      "minHeight": {type: "int", nullable: true},
      "maxWidth": {type: "int", nullable: true},
      "maxHeight": {type: "int", nullable: true},
      "allowGrowX": {type: "bool", nullable: false},
      "allowGrowY": {type: "bool", nullable: false},
      "allowShrinkX": {type: "bool", nullable: false},
      "allowShrinkY": {type: "bool", nullable: false},
      "marginTop": {type: "int", min: -1000, nullable: false},
      "marginRight": {type: "int", min: -1000, nullable: false},
      "marginBottom": {type: "int", min: -1000, nullable: false},
      "marginLeft": {type: "int", min: -1000, nullable: false},
      "paddingTop": {type: "int", nullable: false},
      "paddingRight": {type: "int", nullable: false},
      "paddingBottom": {type: "int", nullable: false},
      "paddingLeft": {type: "int", nullable: false},
      "alignX": {
        type: "enum",
        values: [ "left", "center", "right" ],
        nullable: true
      },
      "alignY": {
        type: "enum",
        values: [ "top", "middle", "bottom", "baseline" ],
        nullable: true
      }
    },


    HBOX_PROPERTIES :
    {
      "alignX": {
        type: "enum",
        values: [ "left", "center", "right" ],
        nullable: false
      },
      "alignY": {
        type: "enum",
        values: [ "top", "middle", "bottom", "baseline" ],
        nullable: false
      },
      "spacing": {type: "int", nullable: false},
      "reversed": {type: "bool", nullable: false}
    },

    DOCK_PROPERTIES :
    {
      "sort": {
        type: "enum",
        values: [ "auto", "y", "x" ],
        nullable: false
      },
      "spacingX" : {
        type : "int",
        nullable : false
      },
      "spacingY" : {
        type : "int",
        nullable : false
      }
    },

    GRID_PROPERTIES :
    {
      "horizontalSpacing" : {type: "int", nullable: false},
      "verticalSpacing" : {type: "int", nullable: false}
    }
  },


  properties :
  {
    selected :
    {
      apply : "_applySelected",
      nullable : true
    }
  },


  members :
  {
    _applySelected : function(value, old) {
      this._updateControls(value);
    },


    _setProperty : function(widget, name, value)
    {
      if (!widget) {
        return;
      }

      var setter = "set" + qx.lang.String.firstUp(name);

      var convert = this._properties[name].convert;
      if (convert) {
        value = convert(value);
      }
      widget[setter](value);
    },


    _getProperty : function(widget, name)
    {
      var getter = "get" + qx.lang.String.firstUp(name);
      return widget[getter]();
    },


    _hasProperty : function(widget, name)
    {
      var setter = "set" + qx.lang.String.firstUp(name);
      return (typeof(widget[setter]) == "function");
    },


    _createOnIntPropertyChange : function(property)
    {
      return function(e)
      {
        var widget = this.getSelected();
        this._setProperty(widget, property, e.getTarget().getValue());
      }
    },


    _createOnBoolPropertyChange : function(property)
    {
      return function(e)
      {
        var widget = this.getSelected();
        this._setProperty(widget, property, e.getTarget().getChecked());
      }
    },


    _createOnEnumPropertyChange : function(property, mgr)
    {
      return function(e)
      {
        var widget = this.getSelected();
        this._setProperty(widget, property, mgr.getSelected().getValue());
      }
    },


    _createOnNullPropertyChange : function(property)
    {
      return function(e)
      {
        var widget = this.getSelected();
        var control = e.getTarget();

        if (control.getChecked())
        {
          this._setProperty(widget, property, null);
          this._properties[property].formItem.setEnabled(false);
        }
        else
        {
          this._setProperty(widget, property, this._properties[property].formItem.getValue());
          this._properties[property].formItem.setEnabled(true);
        }
      }
    },


    _updateControls : function(widget)
    {
      for (var prop in this._properties)
      {
        var type = this._properties[prop].type;
        var formItem = this._properties[prop].formItem;
        var nullable = this._properties[prop].nullable;

        if (!this._hasProperty(widget, prop))
        {
          formItem.setEnabled(false);
          if (nullable) {
            this._properties[prop].nullWidget.setEnabled(false);
          }
          return;
        }

       formItem.setEnabled(true);


        var propValue = this._getProperty(widget, prop);

        if (propValue !== null)
        {
          if (type == "int")
          {
            formItem.setValue(parseInt(propValue));
          }
          else if (type == "string")
          {
            formItem.setValue(propValue.toString());
          }
          else if (type == "bool")
          {
            formItem.setChecked(!!propValue);
          }
          else if (type == "enum")
          {
            formItem.setValue(propValue);
          }
        }

        if (nullable)
        {
          this._properties[prop].nullWidget.setChecked(propValue == null);
          this._properties[prop].nullWidget.setEnabled(true);
          formItem.setEnabled(propValue !== null);
        }

      }
    }

  },


  destruct : function()
  {
    this._disposeFields("_properties");
  }
});

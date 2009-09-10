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

qx.Class.define("demobrowser.demo.util.LayoutPropertyGroup",
{
  extend : demobrowser.demo.util.PropertyGroup,

  statics :
  {
    BOX_PROPERTIES :
    {
      "flex" : {type: "int", min:-1000, nullable: true}
    },

    BASIC_PROPERTIES :
    {
      "top" : {type: "int", min:-1000, nullable: true},
      "left" : {type: "int", min:-1000, nullable: true}
    },

    CANVAS_PROPERTIES :
    {
      "top" : {
        type: "string",
        nullable: true,
        convert: function(value)
        {
          if (parseInt(value).toString() == value) {
            value = parseInt(value);
          }
          return value || null;
        }
      },
      "right" : {
        type: "string",
        nullable: true,
        convert: function(value)
        {
          if (parseInt(value).toString() == value) {
            value = parseInt(value);
          }
          return value || null;
        }
      },
      "bottom" : {
        type: "string",
        nullable: true,
        convert: function(value)
        {
          if (parseInt(value).toString() == value) {
            value = parseInt(value);
          }
          return value || null;
        }
      },
      "left" : {
        type: "string",
        nullable: true,
        convert: function(value)
        {
          if (parseInt(value).toString() == value) {
            value = parseInt(value);
          }
          return value || null;
        }
      },
      "width" : {
        type: "int",
        nullable: true,
        convert: function(value) {
          return value == null ? null : value + "%";
        }
      },
      "height" : {
        type: "int",
        nullable: true,
        convert: function(value) {
          return value == null ? null : value + "%";
        }
      }
    },

    DOCK_PROPERTIES : {
      "width" : {
        type: "int",
        nullable: true,
        convert: function(value) {
          return value == null ? null : value + "%";
        }
      },
      "height" : {
        type: "int",
        nullable: true,
        convert: function(value) {
          return value == null ? null : value + "%";
        }
      },
      "edge": {
        type: "enum",
        values: [ "north", "east", "south", "west", "center" ],
        nullable: false
      }
    },

    GRID_PROPERTIES : {
      "row" : { type: "int", nullable: false},
      "column" : { type: "int", nullable: false},
      "rowSpan" : { type: "int", nullable: true},
      "colSpan" : { type: "int", nullable: true}
    }

  },


  members :
  {
    _setProperty : function(widget, name, value)
    {
      var convert = this._properties[name].convert;
      if (convert) {
        value = convert(value);
      }

      var props = {};
      props[name] = value;
      widget.setLayoutProperties(props);
    },


    _getProperty : function(widget, name) {
      return widget.getLayoutProperties()[name] || null;
    },


    _hasProperty : function(widget, name) {
      return true;
    }

  }
});

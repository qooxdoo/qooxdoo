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
qx.Class.define("qx.ui.decoration.DynamicDecorator", 
{
  extend : qx.ui.decoration.Abstract,
  type: "abstract",

  members :
  {
    // overridden
    getMarkup : function() {
      if (this._markup) {
        return this._markup;
      }
      
      // get the styles
      var styles = {};
      for (var name in this) {
        if (name.indexOf("_getMarkup") == 0 && this[name] instanceof Function) {
          this[name](styles);
        }
      }

      // build the markup
      if (!this._generateMarkup) {
        var html = ['<div style="'];
        html.push(qx.bom.element.Style.compile(styles));
        html.push('"></div>');
      } else {
        var html = this._generateMarkup(styles);
      }

      return this._markup = html.join("");
    },


    // overridden
    resize : function(element, width, height) {
      for (var name in this) {
        if (name.indexOf("_resize") == 0 && this[name] instanceof Function) {
          this[name](element, width, height);
        }
      }
    },


    // overridden
    tint : function(element, bgcolor) {
      for (var name in this) {
        if (name.indexOf("_tint") == 0 && this[name] instanceof Function) {
          this[name](element, bgcolor, element.style);
        }
      }
    },
    
    
    // overridden
    _isInitialized: function() {
      return !!this._markup;
    },


    // overridden
    _getDefaultInsets : function() {
      var directions = ["top", "right", "bottom", "left"];
      var defaultInsets = {};
      // initialize with 0
      for (var i=0; i < directions.length; i++) {
        defaultInsets[directions[i]] = 0;
      };

      for (var name in this) {
        if (name.indexOf("_getDefaultInsetsFor") == 0 && this[name] instanceof Function) {
          var currentInsets = this[name]();

          for (var i=0; i < directions.length; i++) {
            var direction = directions[i];
            if (currentInsets[direction] > defaultInsets[direction]) {
              defaultInsets[direction] = currentInsets[direction];
            }
          };
        }
      }
      
      return defaultInsets;
    }
  }
});
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
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (width < 0) {
        width = 0;
      }

      if (height < 0) {
        height = 0;
      }

      element.style.width = width + "px";
      element.style.height = height + "px";
      
      // get the left and top of the mixins
      var pos = {};
      for (var name in this) {
        if (name.indexOf("_resize") == 0 && this[name] instanceof Function) {
          var currentPos = this[name](element, width, height);
          if (!pos.left) {
            pos.left = currentPos.left;
            pos.top = currentPos.top;
          }
          // use the lowest left and top coordinate to make sure everything
          // is visible
          pos.left = currentPos.left < pos.left ? currentPos.left : pos.left;
          pos.top = currentPos.top < pos.top ? currentPos.left : pos.top;
        }
      }
      // apply only if a mixin requires
      if (pos.left != undefined) {
        element.style.left = pos.left + "px";
        element.style.top = pos.top + "px";
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
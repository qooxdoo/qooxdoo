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
/**
 * This class is an abstract base calls and used by
 * {@link qx.theme.manager.Decoration}. It's main purpose is to combine the
 * included mixins into one working decorator.
 */
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
        if (name.indexOf("_style") == 0 && this[name] instanceof Function) {
          this[name](styles);
        }
      }

      // build the markup
      if (!this._generateMarkup) {
        var html = ['<div style="'];
        html.push(qx.bom.element.Style.compile(styles));
        html.push('"></div>');
        html = html.join("");
      } else {
        var html = this._generateMarkup(styles);
      }

      return this._markup = html;
    },


    // overridden
    resize : function(element, width, height) {
      // get the left and top of the mixins
      var pos = {};
      for (var name in this) {
        if (name.indexOf("_resize") == 0 && this[name] instanceof Function) {
          var currentPos = this[name](element, width, height);
          if (pos.left == undefined) {
            pos.left = currentPos.left;
            pos.top = currentPos.top;
          }

          if (pos.width == undefined) {
            pos.width = currentPos.width;
            pos.height = currentPos.height;
          }

          if (currentPos.elementToApplyDimensions) {
            pos.elementToApplyDimensions = currentPos.elementToApplyDimensions;
          }

          // use the lowest left and top coordinate to make sure everything
          // is visible
          pos.left = currentPos.left < pos.left ? currentPos.left : pos.left;
          pos.top = currentPos.top < pos.top ? currentPos.top : pos.top;

          // use the bigest width and height
          pos.width = currentPos.width > pos.width ? currentPos.width : pos.width;
          pos.height = currentPos.height > pos.height ? currentPos.height : pos.height;
        }
      }
      // apply only if a mixin requires
      if (pos.left != undefined) {
        element.style.left = pos.left + "px";
        element.style.top = pos.top + "px";
      }

      // apply the width if required
      if (pos.width != undefined) {
        // Fix to keep applied size above zero
        // Makes issues in IE7 when applying value like '-4px'
        if (pos.width < 0) {
          pos.width = 0;
        }

        if (pos.height < 0) {
          pos.height = 0;
        }

        if (pos.elementToApplyDimensions) {
          element = pos.elementToApplyDimensions;
        }
        element.style.width = pos.width + "px";
        element.style.height = pos.height + "px";
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

      for (var name in this) {
        if (name.indexOf("_getDefaultInsetsFor") == 0 && this[name] instanceof Function) {
          var currentInsets = this[name]();

          for (var i=0; i < directions.length; i++) {
            var direction = directions[i];
            // initialize with the first insets found
            if (defaultInsets[direction] == undefined) {
              defaultInsets[direction] = currentInsets[direction];
            }
            // take the smalest inset
            if (currentInsets[direction] < defaultInsets[direction]) {
              defaultInsets[direction] = currentInsets[direction];
            }
          };
        }
      }

      // check if the mixins have created a default insets
      if (defaultInsets["top"] != undefined) {
        return defaultInsets;
      }
      // return a fallback which is 0 for all insets
      return {top: 0, right: 0, bottom: 0, left: 0};
    }
  }
});
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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Layouter for horizontal split panes.
 *
 * @internal
 */
qx.Class.define("qx.ui.splitpane.HLayout",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    verifyLayoutProperty : qx.core.Variant.select("qx.debug",
    {
      "on" : function(item, name, value)
      {
        this.assert(name === "type" || name === "flex", "The property '"+name+"' is not supported by the split layout!");

        if (name == "flex") {
          this.assertNumber(value);
        }

        if (name == "type") {
          this.assertString(value);
        }
      },

      "off" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var child, type;
      var begin, splitter, slider, end;

      for (var i=0; i<length; i++)
      {
        child = children[i];
        type = child.getLayoutProperties().type;

        if (type === "splitter") {
          splitter = child;
        } else if (type === "slider") {
          slider = child;
        } else if (!begin) {
          begin = child;
        } else {
          end = child;
        }
      }

      if (begin && end)
      {
        var beginFlex = begin.getLayoutProperties().flex;
        var endFlex = end.getLayoutProperties().flex;

        if (beginFlex == null) {
          beginFlex = 1;
        }

        if (endFlex == null) {
          endFlex = 1;
        }

        var beginHint = begin.getSizeHint();
        var splitterHint = splitter.getSizeHint();
        var endHint = end.getSizeHint();

        var beginWidth = beginHint.width;
        var splitterWidth = splitterHint.width;
        var endWidth = endHint.width;

        if (beginFlex > 0 && endFlex > 0)
        {
          var flexSum = beginFlex + endFlex;
          var flexAvailable = availWidth - splitterWidth;

          var beginWidth = Math.round((flexAvailable / flexSum) * beginFlex);
          var endWidth = flexAvailable - beginWidth;

          var sizes = qx.ui.layout.Util.arrangeIdeals(beginHint.minWidth, beginWidth, beginHint.maxWidth,
            endHint.minWidth, endWidth, endHint.maxWidth);

          beginWidth = sizes.begin;
          endWidth = sizes.end;
        }
        else if (beginFlex > 0)
        {
          beginWidth = availWidth - splitterWidth - endWidth;
          if (beginWidth < beginHint.minWidth) {
            beginWidth = beginHint.minWidth;
          }

          if (beginWidth > beginHint.maxWidth) {
            beginWidth = beginHint.maxWidth;
          }
        }
        else if (endFlex > 0)
        {
          endWidth = availWidth - beginWidth - splitterWidth;
          if (endWidth < endHint.minWidth) {
            endWidth = endHint.minWidth;
          }

          if (endWidth > endHint.maxWidth) {
            endWidth = endHint.maxWidth;
          }
        }

        begin.renderLayout(0, 0, beginWidth, availHeight);
        splitter.renderLayout(beginWidth, 0, splitterWidth, availHeight);
        end.renderLayout(beginWidth+splitterWidth, 0, endWidth, availHeight);
      }
      else
      {
        // Hide the splitter completely
        splitter.renderLayout(0, 0, 0, 0);

        // Render one child
        if (begin) {
          begin.renderLayout(0, 0, availWidth, availHeight);
        } else if (end) {
          end.renderLayout(0, 0, availWidth, availHeight);
        }
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var child, hint, props;
      var minWidth=0, width=0, maxWidth=0;
      var minHeight=0, height=0, maxHeight=0;

      for (var i=0; i<length; i++)
      {
        child = children[i];
        props = child.getLayoutProperties();

        // The slider is not relevant for auto sizing
        if (props.type === "slider") {
          continue;
        }

        hint = child.getSizeHint();

        minWidth += hint.minWidth;
        width += hint.width;
        maxWidth += hint.maxWidth;

        if (hint.minHeight > minHeight) {
          minHeight = hint.minHeight;
        }

        if (hint.height > height) {
          height = hint.height;
        }

        if (hint.maxHeight > maxHeight) {
          maxHeight = hint.maxHeight;
        }
      }

      return {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };
    }
  }
});

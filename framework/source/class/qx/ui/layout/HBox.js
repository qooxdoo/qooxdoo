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

/**
 * A full featured horizontal box layout. It lays out widgets in a
 * horizontal row, from left to right.
 *
 * *Features*
 *
 * * Minimum and maximum dimensions
 * * Priorized growing/shrinking (flex)
 * * Margins (with horizontal collapsing)
 * * Auto sizing (ignoring percent values)
 * * Percent widths (not size hint relevant)
 * * Alignment (Children property {@link qx.ui.core.LayoutItem#alignX} is ignored)
 * * Horizontal spacing (collapsed with margins)
 * * Reversed children layout (starting from last to first)
 * * Vertical children stretching (respecting size hints)
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>flex</strong> <em>(Integer)</em>: Indicates the flexibility
 *   of the item, which indicates
 *   how an item's container distributes remaining empty space among
 *   its children. Flexible elements grow and shrink to fit their given
 *   space. Elements with larger flex values will be made larger than
 *   elements with lower flex values, at the ratio determined by the
 *   two elements. The actual value is not relevant unless there are
 *   other flexible elements within the same container. Once the
 *   default sizes of elements in a box are calculated, the remaining
 *   space in the box is divided among the flexible elements, according
 *   to their flex ratios. Specifying a flex value of 0 has the same
 *   effect as leaving the flex attribute out entirely.
 * </li>
 * <li><strong>width</strong> <em>(String)</em>: Defines a percent
 *   width for the item. The percent width,
 *   when specified, is used instead of the width defined by the size hint.
 *   The minimum and maximum width still takes care of the elements limitations.
 *   It has no influence on the layout's size hint. Percents are mainly useful for
 *   widgets which are sized by the outer hierarchy.
 * </li>
 * </ul>
 *
 * *Example*
 *
 * Here is a little example of how to use the grid layout.
 *
 * <pre class="javascript">
 * var layout = new qx.ui.layout.HBox();
 * layout.setSpacing(4); // apply spacing
 *
 * var container = new qx.ui.container.Composite(layout);
 *
 * container.add(new qx.ui.core.Widget());
 * container.add(new qx.ui.core.Widget());
 * container.add(new qx.ui.core.Widget());
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/layout/hbox'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo wiki.
 *
 * *Alternative Names*
 *
 * * QHBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT)
 *
 * *Copyright Notes*
 *
 * Description of flex property by "Mozilla":http://developer.mozilla.org/en/docs/XUL:Attribute:flex
 * licensed under the
 * "CC Attribution-Sharealike License":http://creativecommons.org/licenses/by-sa/2.5/.
 */
qx.Class.define("qx.ui.layout.HBox",
{
  extend : qx.ui.layout.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param spacing {Integer?0} The spacing between child widgets {@link #spacing}.
   * @param alignX {String?"left"} Horizontal alignment of the whole children
   *     block {@link #alignX}.
   * @param separator {Decorator} A separator to render between the items
   */
  construct : function(spacing, alignX, separator)
  {
    this.base(arguments);

    if (spacing) {
      this.setSpacing(spacing);
    }

    if (alignX) {
      this.setAlignX(alignX);
    }

    if (separator) {
      this.setSeparator(separator);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Horizontal alignment of the whole children block. The horizontal
     * alignment of the child is completely ignored in HBoxes (
     * {@link qx.ui.core.LayoutItem#alignX}).
     */
    alignX :
    {
      check : [ "left", "center", "right" ],
      init : "left",
      apply : "_applyLayoutChange"
    },


    /**
     * Vertical alignment of each child. Can be overridden through
     * {@link qx.ui.core.LayoutItem#alignY}.
     */
    alignY :
    {
      check : [ "top", "middle", "bottom", "baseline" ],
      init : "top",
      apply : "_applyLayoutChange"
    },


    /** Horizontal spacing between two children */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /** Separator lines to use between the objects */
    separator :
    {
      check : "Decorator",
      nullable : true,
      apply : "_applyLayoutChange"
    },


    /** Whether the actual children list should be layouted in reversed order. */
    reversed :
    {
      check : "Boolean",
      init : false,
      apply : "_applyReversed"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __widths : null,
    __flexs : null,
    __enableFlex : null,
    __children : null,


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyReversed : function()
    {
      // easiest way is to invalidate the cache
      this._invalidChildrenCache = true;

      // call normal layout change
      this._applyLayoutChange();
    },


    /**
     * Rebuilds caches for flex and percent layout properties
     */
    __rebuildCache : function()
    {
      var children = this._getLayoutChildren();
      var length = children.length;
      var enableFlex = false;
      var reuse = this.__widths && this.__widths.length != length && this.__flexs && this.__widths;
      var props;

      // Sparse array (keep old one if lengths has not been modified)
      var widths = reuse ? this.__widths : new Array(length);
      var flexs = reuse ? this.__flexs : new Array(length);

      // Reverse support
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Loop through children to preparse values
      for (var i=0; i<length; i++)
      {
        props = children[i].getLayoutProperties();

        if (props.width != null) {
          widths[i] = parseFloat(props.width) / 100;
        }

        if (props.flex != null)
        {
          flexs[i] = props.flex;
          enableFlex = true;
        }
      }

      // Store data
      if (!reuse)
      {
        this.__widths = widths;
        this.__flexs = flexs;
      }

      this.__enableFlex = enableFlex
      this.__children = children;

      // Clear invalidation marker
      delete this._invalidChildrenCache;
    },





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
        this.assert(name === "flex" || name === "width", "The property '"+name+"' is not supported by the box layout!");

        if (name =="width")
        {
          this.assertMatch(value, qx.ui.layout.Util.PERCENT_VALUE);
        }
        else
        {
          // flex
          this.assertNumber(value);
          this.assert(value >= 0);
        }
      },

      "off" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      // Rebuild flex/width caches
      if (this._invalidChildrenCache) {
        this.__rebuildCache();
      }

      // Cache children
      var children = this.__children;
      var length = children.length;
      var util = qx.ui.layout.Util;


      // Compute gaps
      var spacing = this.getSpacing();
      var separator = this.getSeparator();
      if (separator) {
        var gaps = util.computeHorizontalSeparatorGaps(children, spacing, separator);
      } else {
        var gaps = util.computeHorizontalGaps(children, spacing, true);
      }


      // First run to cache children data and compute allocated width
      var i, child, width, percent;
      var widths = [];
      var allocatedWidth = gaps;

      for (i=0; i<length; i+=1)
      {
        percent = this.__widths[i];

        width = percent != null ?
          Math.floor((availWidth - gaps) * percent) :
          children[i].getSizeHint().width;

        widths.push(width);
        allocatedWidth += width;
      }


      // Flex support (growing/shrinking)
      if (this.__enableFlex && allocatedWidth != availWidth)
      {
        var flexibles = {};
        var flex, offset;

        for (i=0; i<length; i+=1)
        {
          flex = this.__flexs[i];

          if (flex > 0)
          {
            hint = children[i].getSizeHint();

            flexibles[i]=
            {
              min : hint.minWidth,
              value : widths[i],
              max : hint.maxWidth,
              flex : flex
            };
          }
        }

        var result = util.computeFlexOffsets(flexibles, availWidth, allocatedWidth);

        for (i in result)
        {
          offset = result[i].offset;

          widths[i] += offset;
          allocatedWidth += offset;
        }
      }


      // Start with left coordinate
      var left = children[0].getMarginLeft();

      // Alignment support
      if (allocatedWidth < availWidth && this.getAlignX() != "left")
      {
        left = availWidth - allocatedWidth;

        if (this.getAlignX() === "center") {
          left = Math.round(left / 2);
        }
      }


      // Layouting children
      var hint, top, height, width, marginRight, marginTop, marginBottom;
      var spacing = this.getSpacing();

      // Pre configure separators
      this._clearSeparators();

      // Compute separator width
      if (separator)
      {
        var separatorInsets = qx.theme.manager.Decoration.getInstance().resolve(separator).getInsets();
        var separatorWidth = separatorInsets.left + separatorInsets.right;
      }

      // Render children and separators
      for (i=0; i<length; i+=1)
      {
        child = children[i];
        width = widths[i];
        hint = child.getSizeHint();

        marginTop = child.getMarginTop();
        marginBottom = child.getMarginBottom();

        // Find usable height
        height = Math.max(hint.minHeight, Math.min(availHeight-marginTop-marginBottom, hint.maxHeight));

        // Respect vertical alignment
        top = util.computeVerticalAlignOffset(child.getAlignY()||this.getAlignY(), height, availHeight, marginTop, marginBottom);

        // Add collapsed margin
        if (i > 0)
        {
          // Whether a separator has been configured
          if (separator)
          {
            // add margin of last child and spacing
            left += marginRight + spacing;

            // then render the separator at this position
            this._renderSeparator(separator, {
              left : left,
              top : 0,
              width : separatorWidth,
              height : availHeight
            });

            // and finally add the size of the separator, the spacing (again) and the left margin
            left += separatorWidth + spacing + child.getMarginLeft();
          }
          else
          {
            // Support margin collapsing when no separator is defined
            left += util.collapseMargins(spacing, marginRight, child.getMarginLeft());
          }
        }

        // Layout child
        child.renderLayout(left, top, width, height);

        // Add width
        left += width;

        // Remember right margin (for collapsing)
        marginRight = child.getMarginRight();
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      // Rebuild flex/width caches
      if (this._invalidChildrenCache) {
        this.__rebuildCache();
      }

      var util = qx.ui.layout.Util;
      var children = this.__children;

      // Initialize
      var minWidth=0, width=0;
      var minHeight=0, height=0;
      var child, hint, margin;

      // Iterate over children
      for (var i=0, l=children.length; i<l; i+=1)
      {
        child = children[i];
        hint = child.getSizeHint();

        // Sum up widths
        width += hint.width;

        // Detect if child is shrinkable and update minWidth
        minWidth += this.__flexs[i] > 0 ? hint.minWidth : hint.width;

        // Build vertical margin sum
        margin = child.getMarginTop() + child.getMarginBottom();

        // Find biggest height
        if ((hint.height+margin) > height) {
          height = hint.height + margin;
        }

        // Find biggest minHeight
        if ((hint.minHeight+margin) > minHeight) {
          minHeight = hint.minHeight + margin;
        }
      }

      // Respect gaps
      var spacing = this.getSpacing();
      var separator = this.getSeparator();
      if (separator) {
        var gaps = util.computeHorizontalSeparatorGaps(children, spacing, separator);
      } else {
        var gaps = util.computeHorizontalGaps(children, spacing, true);
      }

      // Return hint
      return {
        minWidth : minWidth + gaps,
        width : width + gaps,
        minHeight : minHeight,
        height : height
      };
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields(
      "__widths",
      "__flexs",
      "__children"
    );
  }
});

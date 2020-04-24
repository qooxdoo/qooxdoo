/* ************************************************************************

   qooxdoo - the new era of web development
   http://qooxdoo.org

   Copyright:
     2008 Dihedrals.com, http://www.dihedrals.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Chris Banford (zermattchris)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A basic layout, which supports positioning of child widgets in a 'flowing'
 * manner, starting at the container's top/left position, placing children left to right
 * (like a HBox) until the there's no remaining room for the next child. When
 * out of room on the current line of elements, a new line is started, cleared
 * below the tallest child of the preceding line -- a bit like using 'float'
 * in CSS, except that a new line wraps all the way back to the left.
 *
 * *Features*
 *
 * <ul>
 * <li> Reversing children order </li>
 * <li> Manual line breaks </li>
 * <li> Horizontal alignment of lines </li>
 * <li> Vertical alignment of individual widgets within a line </li>
 * <li> Margins with horizontal margin collapsing </li>
 * <li> Horizontal and vertical spacing </li>
 * <li> Height for width calculations </li>
 * <li> Auto-sizing </li>
 * </ul>
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>lineBreak</strong> <em>(Boolean)</em>: If set to <code>true</code>
 *   a forced line break will happen after this child widget.
 * </li>
 * <li><strong>stretch</strong> <em>(Boolean)</em>: If set to <code>true</code>
 *   the widget will be stretched to the remaining line width. This requires
 *   lineBreak to be true.
 * </li>

 * </ul>
 *
 * *Example*
 *
 * Here is a little example of how to use the Flow layout.
 *
 * <pre class="javascript">
 *  var flowlayout = new qx.ui.layout.Flow();
 *
 *  flowlayout.setAlignX( "center" );  // Align children to the X axis of the container (left|center|right)
 *
 *  var container = new qx.ui.container.Composite(flowlayout);
 *  this.getRoot().add(container, {edge: 0});
 *
 *  var button1 = new qx.ui.form.Button("1. First Button", "flowlayout/test.png");
 *  container.add(button1);
 *
 *  var button2 = new qx.ui.form.Button("2. Second longer Button...", "flowlayout/test.png");
 *  // Have this child create a break in the current Line (next child will always start a new Line)
 *  container.add(button2, {lineBreak: true});
 *
 *  var button3 = new qx.ui.form.Button("3rd really, really, really long Button", "flowlayout/test.png");
 *  button3.setHeight(100);  // tall button
 *  container.add(button3);
 *
 *  var button4 = new qx.ui.form.Button("Number 4", "flowlayout/test.png");
 *  button4.setAlignY("bottom");
 *  container.add(button4);
 *
 *  var button5 = new qx.ui.form.Button("20px Margins around the great big 5th button!");
 *  button5.setHeight(100);  // tall button
 *  button5.setMargin(20);
 *  container.add(button5, {lineBreak: true});    // Line break after this button.
 *
 *  var button6 = new qx.ui.form.Button("Number 6", "flowlayout/test.png");
 *  button6.setAlignY("middle");  // Align this child to the vertical center of this line.
 *  container.add(button6);
 *
 *  var button7 = new qx.ui.form.Button("7th a wide, short button", "flowlayout/test.png");
 *  button7.setMaxHeight(20);  // short button
 *  container.add(button7);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/docs/#layout/flow.md'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
 */
qx.Class.define("qx.ui.layout.Flow",
{
  extend : qx.ui.layout.Abstract,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param spacingX {Integer?0} The spacing between child widgets {@link #spacingX}.
   * @param spacingY {Integer?0} The spacing between the lines {@link #spacingY}.
   * @param alignX {String?"left"} Horizontal alignment of the whole children
   *     block {@link #alignX}.
   */
  construct : function(spacingX, spacingY, alignX)
  {
    this.base(arguments);

    if (spacingX) {
      this.setSpacingX(spacingX);
    }

    if (spacingY) {
      this.setSpacingY(spacingY);
    }

    if (alignX) {
      this.setAlignX(alignX);
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
      check : [ "top", "middle", "bottom"],
      init : "top",
      apply : "_applyLayoutChange"
    },

    /** Horizontal spacing between two children */
    spacingX :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },

    /**
     * The vertical spacing between the lines.
     */
    spacingY :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },

    /** Whether the actual children list should be laid out in reversed order. */
    reversed :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutChange"
    }

  },



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
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value) {
        var validProperties = ["lineBreak", "stretch"];
        this.assertInArray(name, validProperties, "The property '"+name+"' is not supported by the flow layout!" );
      },

      "false" : null
    }),


    // overridden
    connectToWidget : function(widget)
    {
      this.base(arguments, widget);

      // Necessary to be able to calculate the lines for the flow layout.
      // Otherwise the layout calculates the needed width and height by using
      // only one line of items which is leading to the wrong height. This
      // wrong height does e.g. suppress scrolling since the scroll pane does
      // not know about the correct needed height.
      if (widget) {
        widget.setAllowShrinkY(false);
      }
    },


    /**
     * The FlowLayout tries to add as many Children as possible to the current 'Line'
     * and when it sees that the next Child won't fit, it starts on a new Line, continuing
     * until all the Children have been added.
     * To enable alignX "left", "center", "right" renderLayout has to calculate the positions
     * of all a Line's children before it draws them.
     *
     * @param availWidth {Integer} Final width available for the content (in pixel)
     * @param availHeight {Integer} Final height available for the content (in pixel)
     * @param padding {Map} Map containing the padding values. Keys:
     * <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>
     */
    renderLayout : function(availWidth, availHeight, padding)
    {
      var children = this._getLayoutChildren();

      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      var lineCalculator = new qx.ui.layout.LineSizeIterator(
        children,
        this.getSpacingX()
      );

      var lineTop = padding.top;
      while (lineCalculator.hasMoreLines())
      {
        var line = lineCalculator.computeNextLine(availWidth);
        this.__renderLine(line, lineTop, availWidth, padding);
        lineTop += line.height + this.getSpacingY();
      }
    },


    /**
     * Render a line in the flow layout
     *
     * @param line {Map} A line configuration as returned by
     *    {@link LineSizeIterator#computeNextLine}.
     * @param lineTop {Integer} The line's top position
     * @param availWidth {Integer} The available line width
     * @param padding {Map} Map containing the padding values. Keys:
     * <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>
     */
    __renderLine : function(line, lineTop, availWidth, padding)
    {
      var util = qx.ui.layout.Util;

      var left = padding.left;
      if (this.getAlignX() != "left") {
        left = padding.left + availWidth - line.width;
        if (this.getAlignX() == "center") {
          left = padding.left + Math.round((availWidth - line.width) / 2);
        }
      }

      for (var i=0; i<line.children.length; i++)
      {
        var child = line.children[i];
        var size = child.getSizeHint();
        var marginTop = child.getMarginTop();
        var marginBottom = child.getMarginBottom();

        var top = util.computeVerticalAlignOffset(
          child.getAlignY() || this.getAlignY(),
          marginTop + size.height + marginBottom,
          line.height,
          marginTop, marginBottom
        );

        var layoutProps = child.getLayoutProperties();
        if (layoutProps.stretch && layoutProps.stretch) {
          size.width += availWidth - line.width;
        }

        child.renderLayout(
          left + line.gapsBefore[i],
          lineTop + top,
          size.width,
          size.height
        );

        left += line.gapsBefore[i] + size.width;
      }
    },


    // overridden
    _computeSizeHint : function() {
      return this.__computeSize(Infinity);
    },


    // overridden
    hasHeightForWidth : function() {
      return true;
    },


    // overridden
    getHeightForWidth : function(width) {
      return this.__computeSize(width).height;
    },


    /**
     * Returns the list of children fitting in the last row of the given width.
     * @param width {Number} The width to use for the calculation.
     * @return {Array} List of children in the first row.
     */
    getLastLineChildren : function(width) {
      var lineCalculator = new qx.ui.layout.LineSizeIterator(
        this._getLayoutChildren(),
        this.getSpacingX()
      );

      var lineData = [];
      while (lineCalculator.hasMoreLines()) {
        lineData = lineCalculator.computeNextLine(width).children;
      }

      return lineData;
    },


    /**
     * Compute the preferred size optionally constrained by the available width
     *
     * @param availWidth {Integer} The available width
     * @return {Map} Map containing the preferred height and width of the layout
     */
    __computeSize : function(availWidth)
    {
      var lineCalculator = new qx.ui.layout.LineSizeIterator(
        this._getLayoutChildren(),
        this.getSpacingX()
      );

      var height = 0;
      var width = 0;
      var lineCount = 0;

      while (lineCalculator.hasMoreLines())
      {
        var line = lineCalculator.computeNextLine(availWidth);
        lineCount += 1;
        width = Math.max(width, line.width);
        height += line.height;
      }

      return {
        width : width,
        height : height + this.getSpacingY() * (lineCount-1)
      };
    }
  }
});

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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************
#require(qx.bom.Stylesheet)
************************************************************************ */

/**
 * Abstract base class for HTML based cell renderer.
 *
 * HTML cell renderer are used to construct an HTML string, which is used to
 * render the cell.
 *
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.virtual.cell.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,
  implement : qx.ui.virtual.cell.ICell,

  construct : function()
  {
    this.base(arguments);

    // initialize stylesheet
    qx.ui.virtual.cell.CellStylesheet.getInstance();
  },


  members :
  {
    /**
     * Get the css classes for the cell
     *
     * @param value {var} The cell's data value
     * @param states {Object} A map containing the cell's state names as map keys.
     * @return {String} Space separated list of CSS classes
     */
    getCssClasses : function(value, states) {
      return "qx-cell";
    },


    /**
     * Get the element attributes for the cell
     *
     * @param value {var} The cell's data value
     * @param states {Object} A map containing the cell's state names as map keys.
     * @return {String} Compiled string of cell attributes. e.g.
     *   <code>'tabIndex="1" readonly="false"'</code>
     */
    getAttributes : function(value, states) {
      return "";
    },


    /**
     * Get the CSS styles for the cell
     *
     * @param value {var} The cell's data value
     * @param states {Object} A map containing the cell's state names as map keys.
     * @return {String} Compiled string of CSS styles. e.g.
     *   <code>'color="red; padding: 10px'</code>
     */
    getStyles: function(value, states) {
      return "";
    },


    /**
     * Get the cell's insets. Insets are the sum of the cell's padding and
     * border width.
     *
     * @param value {var} The cell's data value
     * @param states {Object} A map containing the cell's state names as map keys.
     * @return {Integer[]} An array containing the sum of horizontal insets at index
     *   <code>0</code> and the sum of vertical insets at index <code>1</code>.
     */
    getInsets : function(value, states) {
      return [0, 0];
    },


    /**
     * Get cell'S HTML content
     *
     * @param value {var} The cell's data value
     * @param states {Object} A map containing the cell's state names as map keys.
     * @return {String} The cell's content as HTML fragment.
     */
    getContent : function(value, states) {
      return value;
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this.getCssClasses(value, states),
        style : this.getStyles(value, states),
        attributes : this.getAttributes(value, states),
        content : this.getContent(value, states),
        insets : this.getInsets(value, states)
      };
    }
  }
});

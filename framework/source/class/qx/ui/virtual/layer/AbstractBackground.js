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
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * EXPERIMENTAL!
 *
 * Abstract base class for the {@link Row} and {@link Column} layers.
 */
qx.Class.define("qx.ui.virtual.layer.AbstractBackground",
{
  extend : qx.ui.virtual.layer.Abstract,


  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
   */

   /**
    * @param colorEven {Color?null} color for even indexes
    * @param colorOdd {Color?null} color for odd indexes
    */
   construct : function(colorEven, colorOdd)
   {
     this.base(arguments);

     if (colorEven) {
       this.setColorEven(colorEven);
     }

     if (colorOdd) {
       this.setColorOdd(colorOdd);
     }

     this.__customColors = {};
     this.__decorators = {};
   },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** color for event indexes */
    colorEven :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorEven",
      themeable : true
    },

    /** color for odd indexes */
    colorOdd :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorOdd",
      themeable : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __colorEven : null,
    __colorOdd : null,
    __customColors : null,
    __decorators : null,


    /*
    ---------------------------------------------------------------------------
      COLOR HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the color for the given index
     *
     * @param index {Integer} Index to set the color for
     * @param color {Color|null} the color to set. A value of <code>null</code>
     *    will reset the color.
     */
    setColor : function(index, color)
    {
      if (color) {
        this.__customColors[index] = qx.theme.manager.Color.getInstance().resolve(color);
      } else {
        delete(this.__customColors[index]);
      }
    },


    /**
     * Clear all colors set using {@link #setColor}.
     */
    clearCustomColors : function()
    {
      this.__customColors = {};
      this.updateLayerData();
    },


    /**
     * Get the color at the given index
     *
     * @param index {Integer} The index to get the color for.
     * @return {Color} The color at the given index
     */
    getColor : function(index)
    {
      var customColor = this.__customColors[index];
      if (customColor) {
        return customColor;
      } else {
        return index % 2 == 0 ? this.__colorEven : this.__colorOdd;
      }
    },


    // property apply
    _applyColorEven : function(value, old)
    {
      if (value) {
        this.__colorEven = qx.theme.manager.Color.getInstance().resolve(value);
      } else {
        this.__colorEven = null;
      }
      this.updateLayerData();
    },


    // property apply
    _applyColorOdd : function(value, old)
    {
      if (value) {
        this.__colorOdd = qx.theme.manager.Color.getInstance().resolve(value);
      } else {
        this.__colorOdd = null;
      }
      this.updateLayerData();
    },


    /**
     * Sets the decorator for the given index
     *
     * @param index {Integer} Index to set the color for
     * @param decorator {Decorator|null} the decorator to set. A value of
     *    <code>null</code> will reset the decorator.
     */
    setBackground : function(index, decorator)
    {
      if (decorator) {
        this.__decorators[index] = qx.theme.manager.Decoration.getInstance().resolve(decorator);
      } else {
        delete(this.__decorators[index]);
      }
      this.updateLayerData();
    },


    /**
     * Get the decorator at the given index
     *
     * @param index {Integer} The index to get the decorator for.
     * @return {Decorator} The decorator at the given index
     */
    getBackground : function(index) {
      return this.__decorators[index];
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__customColors = this.__decorators = null;
  }
});

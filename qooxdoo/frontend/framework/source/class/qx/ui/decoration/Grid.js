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
 * A very complex decoration using two, partly combined and clipped images
 * to render a graphically impressive borders with gradients.
 *
 * The decoration supports all forms of vertical gradients. The gradients must
 * be stretchable to support different heights.
 *
 * The edges could use different styles of rounded borders. Even different
 * edge sizes are supported. The sizes are automatically detected by
 * the build system using the image metadata.
 *
 * The decoration uses clipped images to reduce the number of external
 * resources.
 */
qx.Class.define("qx.ui.decoration.Grid",
{
  extend : qx.core.Object,
  implement : qx.ui.decoration.IDecorator,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Base Image URL. All the different images needed are named by the default
     * naming scheme:
     *
     * ${baseImageWithoutExtension}-${imageName}.${baseImageExtension}
     *
     * These image names are used:
     *
     * * lt (left top edge)
     * * rt (right top edge)
     * * lb (left bottom edge)
     * * rb (right bottom edge)
     *
     * * t (top side)
     * * r (right side)
     * * b (bottom side)
     * * l (left side)
     *
     * * c (center image)
     */
    baseImage :
    {
      check : "String",
      nullable : true,
      apply : "_changeBaseImage"
    },

    /** Whether the top border should be visible */
    topBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    },

    /** Whether the right border should be visible */
    rightBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    },

    /** Whether the bottom border should be visible */
    bottomBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    },

    /** Whether the left border should be visible */
    leftBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_changeBorderVisibility"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _changeBaseImage : function(value)
    {

    },

    _changeBorderVisibility : function(value)
    {

    },


    // interface implementation
    init : function(decorationElement) {
      // empty
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {

    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.setStyles({
        "width" : null,
        "height" : null,
        "boxSizing" : null
      });
    },


    // interface implementation
    getInsets : function()
    {
      // TODO
      var width = 0;
      return {
        top : width,
        right : width,
        bottom : width,
        left : width
      }
    }
  }
});

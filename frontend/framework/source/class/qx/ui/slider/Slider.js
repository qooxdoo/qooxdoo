/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 */
qx.Class.define("qx.ui.slider.Slider",
{
  extend : qx.ui.slider.AbstractSlider,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(orientation)
  {
    this.base(arguments, orientation);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "slider"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _onKeypressSlider : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";

      switch(e.getKeyIdentifier())
      {
        case "Right":
          if (!isHorizontal) {
            break;
          }
          this.scrollStepForward();
          e.stopPropagation();
          break;

        case "Left":
          if (!isHorizontal) {
            break;
          }
          this.scrollStepBack();
          e.stopPropagation();
          break;

        case "Down":
          if (isHorizontal) {
            break;
          }
          this.scrollStepForward();
          e.stopPropagation();
          break;

        case "Up":
          if (isHorizontal) {
            break;
          }
          this.scrollStepBack();
          e.stopPropagation();
          break;

        case "PageDown":
          this.scrollPageForward();
          e.stopPropagation();
          break;

        case "PageUp":
          this.scrollPageBack();
          e.stopPropagation();
          break;
      }
    }
  }
});

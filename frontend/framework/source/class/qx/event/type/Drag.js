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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event object class for drag events
 */
qx.Class.define("qx.event.type.Drag",
{
  extend : qx.event.type.Mouse,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._dragOffsetLeft = this._dragOffsetLeft;
      clone._dragOffsetTop = this._dragOffsetTop;

      return clone;
    },


    /**
     * Get the difference between the current left mouse position and the mouse
     * position at drag start.
     *
     * @return {Integer} The left drag offset.
     */
    getDragOffsetLeft : function() {
      return this._dragOffsetLeft;
    },


    /**
     * Set the difference between the current left mouse position and the mouse
     * position at drag start.
     *
     * @param dragOffsetLeft {Integer} The left drag offset.
     */
    setDragOffsetLeft : function(dragOffsetLeft) {
      this._dragOffsetLeft = dragOffsetLeft;
    },


    /**
     * Get the difference between the current top mouse position and the mouse
     * position at drag start.
     *
     * @return {Integer} The top drag offset.
     */
    getDragOffsetTop : function() {
      return this._dragOffsetTop;
    },


    /**
     * Set the difference between the current top mouse position and the mouse
     * position at drag start.
     *
     * @param dragOffsetLeft {Integer} The top drag offset.
     */
    setDragOffsetTop : function(dragOffsetTop) {
      this._dragOffsetTop = dragOffsetTop;
    }
  }
});

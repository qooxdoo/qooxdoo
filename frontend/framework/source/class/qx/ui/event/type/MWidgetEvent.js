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
 * Collection of common widget event methods.
 */
qx.Mixin.define("qx.ui.event.type.MWidgetEvent",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the DOM event target to which the event was originally
     * dispatched.
     *
     * @type member
     * @return {Element} DOM element to which the event was originally
     *       dispatched.
     */
    getDomTarget : function() {
      return this._target;
    }
  }
});
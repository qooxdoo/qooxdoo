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

************************************************************************ */

/**
 * Common base class for all focus events.
 */
qx.Class.define("qx.event.type.Focus",
{
  extend : qx.event.type.Event,

  members :
  {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param target {Object} Any possible event target
     * @param relatedTarget {Object} Any possible event target
     * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
     *     If the event is bubbling, the bubbling can be stopped using
     *     {@link #stopPropagation}
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(target, relatedTarget, canBubble)
    {
      this.base(arguments, canBubble, false);

      this._target = target;
      this._relatedTarget = relatedTarget;

      return this;
    }
  }
});

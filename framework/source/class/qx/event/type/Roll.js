/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */


/**
 * Roll event object.
 */
qx.Class.define("qx.event.type.Roll",
{
    extend : qx.event.type.Pointer,


    members : {
      // overridden
      stop : function()
      {
        this.stopPropagation();
        this.preventDefault();
      },


      // overridden
      _cloneNativeEvent : function(nativeEvent, clone)
      {
        var clone = this.base(arguments, nativeEvent, clone);

        clone.delta = nativeEvent.delta;

        return clone;
      },


      /**
       * Returns a map with the calculated delta coordinates and axis,
       * relative to the last <code>roll</code> event.
       *
       * @return {Map} a map with contains the delta as <code>x</code> and
       * <code>y</code>
       */
      getDelta : function() {
        return this._native.delta;
      }
    }
});

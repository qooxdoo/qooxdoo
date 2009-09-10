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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin specially introduced to deprecate the name property of the IFormElement
 * interface.
 * @deprecated
 */
qx.Mixin.define("qx.ui.form.MFormElement",
{
  events : {
    /**
     * Change event for the replacement name property.
     *
     * @deprecated
     */
    "changeName" : "qx.event.type.Data"
  },

  members :
  {
    __name : null,


    /**
     * Sets the name of the widget.
     * @param name {var} The value of the property.
     * @deprecated
     */
    setName: function(name) {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee);

      // check
      if (name != null && !qx.lang.Type.isString(name)) {
        throw new Error("Please use strings for the name property.");
        return;
      }

      var oldName = this.__name;
      this.__name = name;
      this.fireDataEvent(qx.event.type.Data, name, oldName);
    },


    /**
     * Returns the name of the widget.
     * @return {var} The value of the property.
     * @deprecated
     */
    getName: function() {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      return this.__name;
    },


    /**
     * Resets the name of the widget.
     * @deprecated
     */
    resetName: function() {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee);

      var oldName = this.__name;
      this.__name = null;
      this.fireDataEvent(qx.event.type.Data, null, oldName);
    }
  }
});

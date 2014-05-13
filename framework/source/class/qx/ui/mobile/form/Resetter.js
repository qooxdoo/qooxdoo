/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
* The resetter is responsible for managing a set of items and resetting these
* items on a {@link qx.ui.mobile.form.Resetter#reset} call.
*/
qx.Class.define("qx.ui.mobile.form.Resetter",
{
  extend : qx.ui.form.Resetter,

  members :
  {
     // override
    _supportsValue : function(formItem) {
      var clazz = formItem.constructor;

      var isFormItemSupported = (typeof formItem.getValue !== "undefined");
      isFormItemSupported = isFormItemSupported && (typeof formItem.setValue !== "undefined");
      isFormItemSupported = isFormItemSupported && (typeof formItem.resetValue !== "undefined");

      return ( this.base(arguments,formItem) || isFormItemSupported);
    }
  }
});

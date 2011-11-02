/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * A special menu checkbox not closing the menu on value changes.
 */
qx.Class.define("playground.view.gist.CheckBox",
{
  extend : qx.ui.menu.CheckBox,

  /**
   * @param label {String} The label of the checkbox.
   */
  construct : function(label) {
    this.base(arguments, label);
  },


  members :
  {
    // overridden
    _onMouseUp : function(e)
    {
      if (e.isLeftPressed()) {
        this.execute();
      }
    }
  }
});

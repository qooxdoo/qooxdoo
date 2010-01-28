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
 * A special menu item only showing an atom.
 */
qx.Class.define("playground.view.gist.TextMenuItem", 
{
  extend : qx.ui.basic.Atom,


  construct : function(label, icon)
  {
    this.base(arguments, label, icon);
    this.setPadding(4);
    this.setRich(true);
  },

  members :
  {
    /**
     * Necessary implementation for the menu layout.
     * @return {Array} An array containing the sizes.
     */
    getChildrenSizes : function()
    {
      // iconWidth, labelWidth, shortcutWidth, arrowWidth
      return [0, this.getSizeHint().width, 0, 0];
    }
  }
});

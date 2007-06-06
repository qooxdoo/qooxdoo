/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_tree)
#embed(qx.icontheme/16/status/folder-open.png)
#embed(qx.icontheme/16/places/folder.png)

************************************************************************ */

/**
 * Container node of a {@link Tree}, i.e. it can contain other TreeFolder or
 * {@link TreeFile} objects.
 */
qx.Class.define("qx.ui.tree.TreeFolder",
{
  extend : qx.ui.treefullcontrol.TreeFolder,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vLabel {String} the label to display for the tree folder
   * @param vIcon {String} the image URL to display for the tree folder
   * @param vIconSelected {String} the image URL to display when the folder
   *     element is selected
   */
  construct : function(vLabel, vIcon, vIconSelected)
  {
    this.base(arguments, qx.ui.treefullcontrol.TreeRowStructure.getInstance().standard(vLabel, vIcon, vIconSelected));
  }

});

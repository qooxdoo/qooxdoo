/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(tree)
#use(qx.ui.tree.TreeFolderFull)
#use(qx.ui.tree.TreeRowStructure)

************************************************************************ */

/**
 * @brief
 * qx.ui.tree.TreeFolder objects are tree rows which may contain sub-trees 
 *
 * The structure of a tree row is "standard"; i.e. it has an icon (either the
 * icon for a non-selected row or the icon for a selected row) followed by the
 * label and nothing else on the tree row.  For full control of the structure
 * of the tree row, use qx.ui.tree.TreeFolderFull.
 */
qx.OO.defineClass("qx.ui.tree.TreeFolder", qx.ui.tree.TreeFolderFull, 
function(vLabel, vIcon, vIconSelected)
{
  treeRowStructure = new qx.ui.tree.TreeRowStructure();
  treeRowStructure.addIcon(vIcon, vIconSelected);
  treeRowStructure.addLabel(vLabel);

  qx.ui.tree.TreeFolderFull.call(this, treeRowStructure);
});




  

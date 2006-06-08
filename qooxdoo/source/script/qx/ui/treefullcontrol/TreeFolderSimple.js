/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2006 by Derrell Lipman
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Author:
     * Derrell Lipman

************************************************************************ */

/* ************************************************************************

#package(tree)
#use(qx.ui.treefullcontrol.TreeFolder)
#use(qx.ui.treefullcontrol.TreeRowStructure)

************************************************************************ */

/**
 * @brief
 * Provide an interface compatible with qx.ui.tree.TreeFolder with the
 * standard structure: an icon (either the icon for a non-selected row or the
 * icon for a selected row) followed by the label and nothing else on the tree
 * row.
 */
qx.OO.defineClass("qx.ui.treefullcontrol.TreeFolderSimple", qx.ui.treefullcontrol.TreeFolder, 
function(vLabel, vIcon, vIconSelected)
{
  treeRowStructure = new qx.ui.treefullcontrol.TreeRowStructure();
  treeRowStructure.addIcon(vIcon, vIconSelected);
  treeRowStructure.addLabel(vLabel);

  qx.ui.treefullcontrol.TreeFolder.call(this, treeRowStructure);
});




  

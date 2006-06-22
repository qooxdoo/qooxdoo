/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
     (C) 2006 by Derrell Lipman
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>
     * Derrell Lipman

************************************************************************ */

/* ************************************************************************

#module(tree)

************************************************************************ */

/**
 * @brief
 * qx.ui.treefullcontrol.TreeFile objects are terminal tree rows (i.e. no
 * sub-trees)
 *
 * @param
 * treeRowStructure -
 *   An instance of qx.ui.treefullcontrol.TreeRowStructure, defining the
 *   structure  of this tree row.
 */
qx.OO.defineClass("qx.ui.treefullcontrol.TreeFile", qx.ui.treefullcontrol.AbstractTreeElement, 
function(treeRowStructure)
{
  qx.ui.treefullcontrol.AbstractTreeElement.call(this, treeRowStructure);
});




/*
---------------------------------------------------------------------------
  INDENT HELPER
---------------------------------------------------------------------------
*/

qx.Proto.getIndentSymbol = function(vUseTreeLines, vIsLastColumn)
{
  if (vUseTreeLines)
  {
    if (vIsLastColumn)
    {
      return this.isLastChild() ? "end" : "cross";
    }
    else
    {
      return "line";
    }
  }

  return null;
}

qx.Proto._updateIndent = function() {
  this.addToTreeQueue();
}

qx.Proto.getItems = function() {
  return [this];
}

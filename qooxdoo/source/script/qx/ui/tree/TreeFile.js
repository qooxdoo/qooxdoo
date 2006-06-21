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

#module(tree)

************************************************************************ */

qx.OO.defineClass("qx.ui.tree.TreeFile", qx.ui.tree.AbstractTreeElement, 
function(vLabel, vIcon, vIconSelected) {
  qx.ui.tree.AbstractTreeElement.call(this, vLabel, vIcon, vIconSelected);
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
    };
  };

  return null;
};

qx.Proto._updateIndent = function() {
  this.addToTreeQueue();
};

qx.Proto.getItems = function() {
  return [this];
};

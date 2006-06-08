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

#package(tree)

************************************************************************ */

/**
 * @brief
 * qx.ui.tree.TreeFileFull objects are terminal tree rows (i.e. no sub-trees)
 *
 * The structure of a tree row is provided by the array argument.  The order
 * of elements in the array is the order in which they will be presented in a
 * tree row.  The array should be an "associative" array with the following
 * named elements for the "standard" parts of a tree row:
 *
 *   label -
 *     A string of text or a string containing valid HTML
 *
 *   icon - 
 *   icon-selected - 
 *     A string of text containing the relative path to the icon image
 *
 * All other elements of the array should be objects which may be add()ed to a
 * Horizontal Layout.  If the object has no special treatment, it may be
 * (prior to instantiating this object) made anonymous with:
 *
 *   object.SetAnonymous(true).
 *
 * Otherwise, all handling for the object should be done by the application.
 */
qx.OO.defineClass("qx.ui.tree.TreeFileFull", qx.ui.tree.AbstractTreeElement, 
function(fields)
{
  qx.ui.tree.AbstractTreeElement.call(this, fields);
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

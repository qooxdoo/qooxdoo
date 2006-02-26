/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
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

************************************************************************ */

/* ************************************************************************

#package(tree)

************************************************************************ */

function QxTreeFile(vLabel, vIcon, vIconSelected) {
  QxTreeElement.call(this, vLabel, vIcon, vIconSelected);
};

QxTreeFile.extend(QxTreeElement, "QxTreeFile");




/*
---------------------------------------------------------------------------
  INDENT HELPER
---------------------------------------------------------------------------
*/

proto.getIndentSymbol = function(vUseTreeLines, vIsLastColumn) 
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

proto._updateIndent = function() {
  this.addToTreeQueue();
};

proto.getItems = function() {
  return [this];
};

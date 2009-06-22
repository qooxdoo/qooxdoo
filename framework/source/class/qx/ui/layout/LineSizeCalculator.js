/* ************************************************************************

   qooxdoo - the new era of web development
   http://qooxdoo.org

   Copyright:
     2008 Dihedrals.com, http://www.dihedrals.com

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Chris Banford (zermattchris)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.layout.LineSizeCalculator",
{
  extend : Object,
  
  construct : function(children, spacing)
  {
    this.__children = children;
    this.__spacing = spacing;
    
    this.__hasMoreLines = children.length > 0;
    this.__childIndex = 0;
  },
  
  members :
  {
    computeNextLine : function(availWidth)
    {
      var availWidth = availWidth || Infinity;
      
      if (!this.__hasMoreLines) {
        throw new Error("No more lines to compute");
      }
      
      var children = this.__children;
      var lineHeight = 0;
      var lineWidth = 0;
      var lineChildren = [];
      var gapsBefore = [];
      
      for (var i=this.__childIndex; i<children.length; i++)
      {
        var child = children[i];
        var size = child.getSizeHint();
        
        var gapBefore = this.__computeGapBeforeChild(i);
        var childWidth = size.width + gapBefore;
        var isFirstChild = i == this.__childIndex;
        if (!isFirstChild && lineWidth + childWidth > availWidth)
        {
          this.__childIndex = i;
          break;
        }
        
        var childHeight = size.height + child.getMarginTop() + child.getMarginBottom();
        lineChildren.push(child);
        gapsBefore.push(gapBefore);
        lineWidth += childWidth;
        lineHeight = Math.max(lineHeight, childHeight);        
        
        if (child.getLayoutProperties().lineBreak) {
          this.__childIndex = i+1;
          break;  
        }
      }
      
      if (i >= children.length) {
        this.__hasMoreLines = false;
      }
      
      return {
        height: lineHeight,
        width: lineWidth,
        children: lineChildren,
        gapsBefore : gapsBefore
      }
    },
      
      
    __computeGapBeforeChild : function(childIndex)
    {
      var isFirstInLine = childIndex == this.__childIndex
      if (isFirstInLine) {
        return this.__children[childIndex].getMarginLeft();
      } else {
        return Math.max(
          this.__children[childIndex-1].getMarginRight(),
          this.__children[childIndex].getMarginLeft(),
          this.__spacing
        )
      }
    },
  
    
    hasMoreLines : function() {
      return this.__hasMoreLines;
    }
  }
})
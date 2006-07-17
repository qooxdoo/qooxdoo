/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(border)

************************************************************************ */

qx.OO.defineClass("qx.renderer.border.BorderObject", qx.renderer.border.Border,
function(vWidth, vStyle, vColor)
{
  this._dependentObjects = {}

  qx.renderer.border.Border.call(this, vWidth, vStyle, vColor);
});



/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.renderer.border.BorderObject.fromString = function(vDefString)
{
  var vBorder = new qx.renderer.border.BorderObject;
  var vAllParts = vDefString.split(/\s+/);
  var vPart, vTemp;

  for (var i=0; i<vAllParts.length; i++)
  {
    vPart = vAllParts[i];

    switch(vPart)
    {
      case qx.renderer.border.Border.STYLE_GROOVE:
      case qx.renderer.border.Border.STYLE_RIDGE:
      case qx.renderer.border.Border.STYLE_INSET:
      case qx.renderer.border.Border.STYLE_OUTSET:
      case qx.renderer.border.Border.STYLE_SOLID:
      case qx.renderer.border.Border.STYLE_DOTTED:
      case qx.renderer.border.Border.STYLE_DASHED:
      case qx.renderer.border.Border.STYLE_DOUBLE:
      case qx.renderer.border.Border.STYLE_NONE:
        vBorder.setStyle(vPart);
        break;

      default:
        vTemp = parseFloat(vPart);

        if(vTemp == vPart || qx.lang.String.contains(vPart, qx.constant.Core.PIXEL))
        {
          vBorder.setWidth(vTemp);
        }
        else
        {
          vPart = vPart.toLowerCase();
          vBorder.setColor(qx.renderer.color.Color.themedNames[vPart] ? new qx.renderer.color.ColorObject(vPart) : new qx.renderer.color.Color(vPart));
        }

        break;
    }
  }

  return vBorder;
}






/*
---------------------------------------------------------------------------
  WIDGET CONNECTION
---------------------------------------------------------------------------
*/

qx.Proto.addListenerWidget = function(o) {
  this._dependentObjects[o.toHashCode()] = o;
}

qx.Proto.removeListenerWidget = function(o) {
  delete this._dependentObjects[o.toHashCode()];
}

qx.Proto._sync = function(vEdge)
{
  var vAll = this._dependentObjects;
  var vCurrent;

  for (vKey in vAll)
  {
    vCurrent = vAll[vKey];

    if (vCurrent.isCreated()) {
      vCurrent._updateBorder(vEdge);
    }
  }
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (typeof this._dependentObjects === qx.constant.Type.OBJECT)
  {
    var vAll = this._dependentObjects;
    for (vKey in vAll) {
      delete vAll[vKey];
    }

    vAll = null;
    delete this._dependentObjects;
  }

  return qx.renderer.border.Border.prototype.dispose.call(this);
}







/*
---------------------------------------------------------------------------
  PRESETS
---------------------------------------------------------------------------
*/

qx.Class.presets =
{
  inset : new qx.Class(2, qx.renderer.border.Border.STYLE_INSET),
  outset : new qx.Class(2, qx.renderer.border.Border.STYLE_OUTSET),
  groove : new qx.Class(2, qx.renderer.border.Border.STYLE_GROOVE),
  ridge : new qx.Class(2, qx.renderer.border.Border.STYLE_RIDGE),
  thinInset : new qx.Class(1, qx.renderer.border.Border.STYLE_INSET),
  thinOutset : new qx.Class(1, qx.renderer.border.Border.STYLE_OUTSET),
  verticalDivider : new qx.Class(1, qx.renderer.border.Border.STYLE_INSET),
  horizontalDivider : new qx.Class(1, qx.renderer.border.Border.STYLE_INSET),

  shadow : new qx.Class(1, qx.renderer.border.Border.STYLE_SOLID, "threedshadow"),
  lightShadow : new qx.Class(1, qx.renderer.border.Border.STYLE_SOLID, "threedlightshadow"),
  info : new qx.Class(1, qx.renderer.border.Border.STYLE_SOLID, "infotext")
}

qx.Class.presets.verticalDivider.setLeftWidth(0);
qx.Class.presets.verticalDivider.setRightWidth(0);

qx.Class.presets.horizontalDivider.setTopWidth(0);
qx.Class.presets.horizontalDivider.setBottomWidth(0);

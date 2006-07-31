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

#module(guicore)

************************************************************************ */

qx.OO.defineClass("qx.ui.basic.Inline", qx.ui.layout.CanvasLayout, 
function(vId)
{
  qx.ui.layout.CanvasLayout.call(this);

  this.setStyleProperty(qx.constant.Style.PROPERTY_POSITION, qx.constant.Style.POSITION_RELATIVE);

  if (qx.util.Validation.isValidString(vId)) {
    this.setInlineNodeId(vId);
  }
});

qx.OO.addProperty({ name : "inlineNodeId", type : qx.constant.Type.STRING });

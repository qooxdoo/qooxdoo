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

qx.OO.defineClass("qx.ui.basic.HorizontalSpacer", qx.ui.basic.Terminator, 
function()
{
  qx.ui.basic.Terminator.call(this);

  this.setWidth(qx.constant.Core.FLEX);
});

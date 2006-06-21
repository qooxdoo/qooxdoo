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

#module(guicore)

************************************************************************ */

qx.OO.defineClass("qx.ui.basic.VerticalSpacer", qx.ui.basic.Terminator, 
function()
{
  qx.ui.basic.Terminator.call(this);

  this.setHeight(qx.constant.Core.FLEX);
});

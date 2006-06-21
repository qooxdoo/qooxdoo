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

#module(tabview)
#require(qx.manager.selection.RadioManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.tabview.TabViewBar", qx.ui.pageview.AbstractPageViewBar, 
function()
{
  qx.ui.pageview.AbstractPageViewBar.call(this);

  this.setZIndex(2);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "tab-view-bar" });

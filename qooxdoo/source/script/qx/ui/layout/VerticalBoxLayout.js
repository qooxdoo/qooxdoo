/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(layout)

************************************************************************ */

qx.OO.defineClass("qx.ui.layout.VerticalBoxLayout", qx.ui.layout.BoxLayout, 
function() {
  qx.ui.layout.BoxLayout.call(this, qx.constant.Layout.ORIENTATION_VERTICAL);
});

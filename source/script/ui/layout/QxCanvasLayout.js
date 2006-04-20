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

#package(layoutcore)
#require(qx.renderer.layout.CanvasLayoutImpl)

************************************************************************ */

qx.ui.layout.CanvasLayout = function() {
  qx.ui.core.Parent.call(this);
};

qx.ui.layout.CanvasLayout.extend(qx.ui.core.Parent, "qx.ui.layout.CanvasLayout");




/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new qx.renderer.layout.CanvasLayoutImpl(this);
};

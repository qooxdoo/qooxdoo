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

#module(color)
#require(qx.manager.object.ImageManager)

************************************************************************ */

qx.OO.defineClass("qx.renderer.theme.IconTheme", qx.core.Object,
function(vTitle)
{
  qx.core.Object.call(this);

  this.setTitle(vTitle);
  this._register();
});

qx.OO.addProperty({ name : "title", type : qx.constant.Type.STRING, allowNull : false, defaultValue : qx.constant.Core.EMPTY });

qx.Proto._register = function() {
  return qx.manager.object.ImageManager.registerIconTheme(this);
}

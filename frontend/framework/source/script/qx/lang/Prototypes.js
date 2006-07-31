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

#module(core)

************************************************************************ */

qx.OO.defineClass("qx.lang.Prototypes");

qx.lang.Prototypes.init = function()
{
  var key, obj;
  var objs = [ "String", "Number", "Array" ];

  for (var i=0, len=objs.length; i<len; i++)
  {
    obj = objs[i];

    for (key in qx.lang[obj])
    {
      window[obj].prototype[key] = function(key, obj)
      {
        return function() {
          return qx.lang[obj][key].apply(null, Array.prototype.concat.call([this], Array.prototype.slice.call(arguments, 0)));
        }
      }(key, obj);
    }
  }
}

if (qx.core.Settings.enablePrototypes) {
  qx.lang.Prototypes.init();
}

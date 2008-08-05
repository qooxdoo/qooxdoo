/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(buildtool)

************************************************************************ */

qx.Class.define("buildtool.UrlSearchParms",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    
    this.parms = {};
    var parmStr = window.location.search;
    if (parmStr.length > 0) 
    {
      parmStr=parmStr.slice(1);  // skip '?'
      var pairs=parmStr.split('&');
      for (var i=0; i<pairs.length; i++)
      {
        var pair = pairs[i].split('=');
        this.parms[pair[0]] = pair[1];
      }
    }
  }
});


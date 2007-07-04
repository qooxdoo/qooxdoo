/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

************************************************************************* */

/* ************************************************************************

#require(qx.io.Alias)
#resource(qx.widgettheme:widget/Ext)

************************************************************************* */

/**
 * Ext-Clone widget theme.
 */
qx.Theme.define("qx.theme.ext.Widget",
{
  title : "Ext",

  widgets : {
    uri : qx.core.Setting.get("qx.resourceUri") + "/widget/Ext"
  }
});

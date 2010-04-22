/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Theme.define("showcase.theme.Font",
{
  extend : qx.theme.modern.Font,

  fonts :
  {
    "legend" :
    {
      size : (qx.bom.client.System.WINVISTA || qx.bom.client.System.WIN7) ? 15 : 14,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
        (qx.bom.client.System.WINVISTA || qx.bom.client.System.WIN7) ?
        [ "Segoe UI", "Candara" ] :
        [ "Tahoma", "Liberation Sans", "Arial" ],
      bold : true
    }
  }
});
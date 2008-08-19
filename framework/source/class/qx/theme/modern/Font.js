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
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/**
 * The modern font theme.
 */
qx.Theme.define("qx.theme.modern.Font",
{
  fonts :
  {
    "default" :
    {
      size : qx.bom.client.System.WINVISTA ? 12 : 11,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
        qx.bom.client.System.WINVISTA ? [ "Segoe UI", "Candara" ] :
        [ "Tahoma", "Liberation Sans", "Arial" ]
    },

    "bold" :
    {
      size : qx.bom.client.System.WINVISTA ? 12 : 11,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
        qx.bom.client.System.WINVISTA ? [ "Segoe UI", "Candara" ] :
        [ "Tahoma", "Liberation Sans", "Arial" ],
      bold : true
    },

    "small" :
    {
      size : qx.bom.client.System.WINVISTA ? 11 : 10,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
        qx.bom.client.System.WINVISTA ? [ "Segoe UI", "Candara" ] :
        [ "Tahoma", "Liberation Sans", "Arial" ]
    },

    "monospace" :
    {
      size: 11,
      lineHeight : 1.4,
      family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
        qx.bom.client.System.WINVISTA ? [ "Consolas" ] :
        [ "Consolas", "DejaVu Sans Mono", "Courier New", "monospace" ]
    }
  }
});

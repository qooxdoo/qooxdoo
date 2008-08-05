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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.AttributeStyle_2",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var chk = qx.bom.Element.create("input", {
        type : "checkbox",
        checked : true,
        id : "chk"
      });

      document.body.appendChild(chk);

      var lab = qx.bom.Element.create("label", {
        "for" : "chk"
      });

      qx.bom.element.Attribute.set(lab, "text", "Checkbox #1");

      document.body.appendChild(lab);
    }
  }
});

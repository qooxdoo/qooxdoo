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

qx.Class.define("demobrowser.demo.test.Element_5",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var body = new qx.html.Root(document.getElementById("test"));

      var wrapper = new qx.html.Element;
      wrapper.setStyle("float", "left");
      wrapper.setStyle("border", "2px solid black");
      wrapper.setStyle("fontSize", "1px");
      body.add(wrapper);

      var il, jl;
      for (var i=0; i<40; i++)
      {
        il = new qx.html.Element;
        il.setAttribute("id", "row" + i);
        il.setStyle("marginBottom", "2px");
        il.setStyle("float", "left");
        il.setStyle("clear", "left");
        wrapper.add(il);

        for (var j=0; j<40; j++)
        {
          jl = new qx.html.Element;
          jl.setAttribute("id", "row" + i + "col" + j);
          jl.setStyle("marginRight", "2px");
          jl.setStyle("float", "left");
          jl.setStyle("width", "12px");
          jl.setStyle("height", "12px");
          jl.setStyle("backgroundColor", "red");
          il.add(jl)
        }
      }
    }
  }
});

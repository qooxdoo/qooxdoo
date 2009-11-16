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

qx.Class.define("demobrowser.demo.bom.Window",
{
  extend : qx.application.Native,

  members :
  {
    __urls : null,

    main : function()
    {
      this.base(arguments);

      this.__urls = [ "http://qooxdoo.org",
                      "http://sourceforge.net",
                      "http://slashdot.org" ];

      var button1 = qx.bom.Input.create("button");
      qx.bom.Input.setValue(button1, "Open Native Window");
      document.body.appendChild(button1);

      qx.event.Registration.addListener(button1, "click", function(e)
      {
        var options = { width: 400,
                        height: 200,
                        top: 200,
                        left: 100,
                        scrollbars : false,
                        menubar : true,
                        status : false };

        this.window1 = qx.bom.Window.open(this.__urls[0], "window1", options);
      }, this);

      var button2 = qx.bom.Input.create("button");
      qx.bom.Input.setValue(button2, "Window closed?");
      document.body.appendChild(button2);

      qx.event.Registration.addListener(button2, "click", function(e)
      {
        alert(qx.bom.Window.isClosed(this.window1));
      }, this);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__urls = null;
  }
});
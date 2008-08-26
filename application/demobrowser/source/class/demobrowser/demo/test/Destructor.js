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

qx.Class.define("demobrowser.demo.test.Destructor",
{
  extend : qx.application.Standalone,

  members :
  {
    map : new Array(),
    htmlRootElement : null,
    offset : 0,
    masterLabel : null,

    testHTMLElement: function()
    {
      var popped;
      while (popped=this.map.pop()) {
        popped.dispose();
        popped=null;
      }

      for ( var i = 0; i < 500; i++)
      {
        var qxElement = new qx.html.Label;
        qxElement.setContent(this.offset + "Test");

        this.htmlRootElement.add(qxElement);

        this.map.push(qxElement);
        this.offset++;
      }

      this.masterLabel.setContent("Widget Count: "+this.offset);
      qx.event.Timer.once(this.testHTMLElement, this, 300);
    },

    testWidgets: function()
    {
      var popped;
      while (popped=this.map.pop()) {
        popped.destroy();
        popped=null;
      }

      for ( var i = 0; i < 100; i++)
      {
        var label=new qx.ui.basic.Label(this.offset + "Test");

        this.getRoot().add(label, {
          left : 50,
          top : 50 + i*20
        });

        this.map.push(label);
        this.offset++;
      }

      this.masterLabel.setContent("Widget Count: " + this.offset);
      qx.event.Timer.once(this.testWidgets, this, 300);
    },


    main : function()
    {
      // Call super class
      this.base(arguments);
      this.masterLabel = new qx.ui.basic.Label();
      this.getRoot().add(this.masterLabel, {
        left : 200,
        top : 10
      });

      var body = qx.dom.Node.getBodyElement(document);
      this.htmlRootElement = new qx.html.Root(body);

      // toggle comment for different tests
      //this.testHTMLElement();
      this.testWidgets();
    }
  }
});

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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The Demo should demonstrate, that the memory leaks with flash are
 * fixed. The Demo creates five flash movies and destroy them.

 * @tag test
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.test.Destructor_Flash",
{
  extend : qx.application.Native,

  members :
  {
    __data : null,

    __count : 0,

    main : function()
    {
      // Call super class
      this.base(arguments);

      this.__data = [];

      // Init timer
      var timer = new qx.event.Timer(5000);
      timer.addListener("interval", this.runTest, this);
      timer.start();

      this.runTest();
    },

    runTest : function()
    {
      for (var i = 0; i < 5; i++)
      {
        // Create div for flash object
        var flash = qx.dom.Element.create("div");
        qx.bom.element.Style.set(flash , "width", "400px");
        qx.bom.element.Style.set(flash , "height", "300px");
        document.body.appendChild(flash);

        var id = "FlashMovie" + this.__count;
        this.__count++;

        // Create flash movie
        qx.bom.Flash.create(flash, { movie : "TestFlash.swf", id : id });

        this.debug("created: " + id);
        this.__data.push(flash);
      }

      // Create timer to delete movies
      var timer = qx.event.Timer.once(this.clear, this, 2500);
      timer.start();
    },

    clear : function()
    {
        var data = this.__data;
        for (var i=0, l=data.length; i<l; i++) {
          var id = data[i].firstChild.id;

          // Clear flash object
          qx.bom.Flash.destroy(data[i]);

          this.debug("cleaned: " + id);

          // At the end remove div
          data[i].parentNode.removeChild(data[i]);
        }
        data.length = 0;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__data = null;
  }
});

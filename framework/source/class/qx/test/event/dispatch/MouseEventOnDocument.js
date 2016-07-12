/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

qx.Class.define("qx.test.event.dispatch.MouseEventOnDocument",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      this.root = qx.dom.Element.create("div", {id: "root"});
      document.body.appendChild(this.root);
      this.ringAppender = new qx.log.appender.RingBuffer();
      qx.log.Logger.register(this.ringAppender);
    },


    tearDown : function()
    {
      qx.log.Logger.unregister(this.ringAppender);
      qx.log.Logger.clear();
      this.ringAppender=null;

      var Reg = qx.event.Registration;

      Reg.removeAllListeners(document);
      Reg.removeAllListeners(window);
      Reg.removeAllListeners(this.root);

      document.body.removeChild(document.getElementById("root"));
    },

    testMouseEventsOnDocument: function(){
      this.doWork(document);
    },

    testMouseEventsOnWindow: function(){
      this.doWork(window);
    },

    testMouseEventsOnDomNode: function(){
      this.doWork(this.root);
    },

    doWork: function(el){
      if (qx.core.Environment.get("qx.debug")){
        this.ringAppender.clear();
        var events = ['mousemove','click','mousedown','mouseup'];
        for(var i=0;i<events.length;i++ ) {
          qx.bom.Element.addListener(el, events[i], function(){});
        }
        var warnings = this.ringAppender.getAllLogEvents().length;
        this.assertTrue( 0 === warnings , warnings + " events in ['mousemove','click','mousedown','mouseup'] generated a warning when added to target "+el);
      }
    }

  }
});

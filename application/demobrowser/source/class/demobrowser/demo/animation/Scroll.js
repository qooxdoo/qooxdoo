/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag noPlayground
 *
 * @require(qx.module.Animation)
 * @require(qx.module.Manipulating)
 * @require(qx.module.Traversing)
 * @require(qx.module.Template)
 * @require(qx.module.event.GestureHandler)
 */
qx.Class.define("demobrowser.demo.animation.Scroll",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create an array with 30 numbers in it
      var data = {items : []};
      for (var i=0; i < 30; i++) {
        data.items.push(i);
      }

      // add 5 lists to the body
      for (var j=0; j < 5; j++) {
        q.template.get("list-template", data).appendTo(document.body);
      }

      // set a default scroll top
      this.reset();
      q("#resetbutton").on("tap", this.reset, this);

      q("#startbutton").on("tap", function() {
        q(".list").addClass("scrolling").setScrollTop(250, 2000).once("animationEnd", function() {
          q(".list").removeClass("scrolling");
        });
      });

    },


    reset : function() {
      q(".list").forEach(function(item, i) {
        item.scrollTop = i * 100;
      });
    }
  }
});

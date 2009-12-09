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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#tag(showcase)

************************************************************************ */

/**
 * qx.fx offers low level animation capabilites for DOM elements.
 */
qx.Class.define("demobrowser.demo.animation.Showcase",
{
  extend : qx.application.Standalone,

  members :
  {

    main : function()
    {
      this.base(arguments);
      
      var view = this.getRoot();

      var words = ["Animating", "DOM elements", "is", "fun"];
      boxes = [];
      effects = [];

      for (var i=0; i<words.length; i++)
      {
        var box = new qx.ui.embed.Html("div").set({
          cssClass : "box",
          html : words[i]
        });
        view.add(box);
        boxes.push(box);
      }
      
      boxes[0].

      qx.ui.core.queue.Manager.flush();

      effects.push(
        new qx.fx.effect.core.Fade(boxes[0].getContentElement().getDomElement()).set({
          from : 0,
          to : 1,
          modifyDisplay : true
        }),
        
        new qx.fx.effect.core.Move(boxes[1].getContentElement().getDomElement()).set({
          y : 100,
          transition : "spring"
        }),
        
        new qx.fx.effect.combination.Drop(boxes[2].getContentElement().getDomElement()).set({
          mode : "in",
          modifyDisplay : true,
          direction : "south"
        }),

        new qx.fx.effect.combination.Fold(boxes[3].getContentElement().getDomElement()).set({
          mode : "out",
          modifyDisplay : true
        })

      );
      
    }

  },

  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._demoElement = this._demoImage = null;
    this._disposeArray("_vBoxes");
  }
});

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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.animation.Content)

************************************************************************ */
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
qx.Class.define("showcase.page.animation.Page",
{
  extend : showcase.Page,

  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Animation",
      part: "animation",
      icon: "showcase/animation/icon.png",
      contentClass: "showcase.page.animation.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Animation",
        this.__descriptionText,
        this.__tryThis,
        this.__features,
        this.__manual,
        this.__demos,
        this.__api
      )
    });
  },

  members :
  {
     __descriptionText : "qooxdoo Animation is a low level animation layer. An effect changes one or more attributes of a DOM element in the given time either linear or using a transition function. Effects can be stacked in a queue and orderd by assigning a startup delay.",

     __tryThis : {
       "Click Cancel" : "To see the Fade effect"
     },

     __features : {
       "14 effects" : "Perfect for your needs.",
       "effect queue" : "Order and queue effects",
       "Highly expandable" : "Writing custom effects was never so easy."
     },

     __manual : {
       "pages/low_level/qooxdoo_animation.html#usuage" : "Animation Usuage",
       "pages/low_level/qooxdoo_animation.html#queueing_effecs" : "Queueing effecs",
       "pages/low_level/qooxdoo_animation.html#writing_own_effects" : "Writing own effects"
     },

    __demos : {
      "#animation~Showcase.html" : "Animation Showcase",
      "#animation~Save_Dialog.html" : "Save Dialog Sample",
      "#animation~Login.html": "Login Dialog Sample"
    },

    __api : {
      "#qx.fx.Base" : "Base Effect API Documentation",
      "#qx.fx.Transition" : "Transition Functions Documentation"
    }
  }
});

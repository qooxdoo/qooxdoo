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
        "qooxdoo Animation",
        this.__descriptionText,
        this.__features,
        this.__manual,        
        this.__demos,
        this.__api
      )
    });
  },
  
  members : 
  {
    __demos : {
      "#animation~Showcase.html" : "Animation Showcase",
      "#animation~Save_Dialog.html" : "Save Dialog Sample",
      "#animation~Login.html": "Login Dialog Sample"
    },

    __api : {
      "#qx.fx.Base" : "Base Effect API Documentation",
      "#qx.fx.Transition" : "Transition Functions Documentation"
    },
    
    __features : {
      "Loading Data" : "The data is loaded from twitter via JSONP.",
      "Binding" : "A binding connects the model to the list view.",
      "Master Detail" : "Clicking on a tweet in the list shows the details.",
      "Friends" : "The friends buttons lets you show your following list.",
      "Configure" : "Enter your username to see your recent tweets."
    },
    
    
    __manual : {
      "qooxdoo_animation#usuage" : "Animation Usuage",
      "qooxdoo_animation#queueing_effecs" : "Queueing effecs",
      "qooxdoo_animation#writing_own_effects" : "Writing own effects"
    },
            
    
    __descriptionText : "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  }
});
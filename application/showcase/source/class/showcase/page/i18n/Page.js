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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.i18n.Content)

************************************************************************ */

qx.Class.define("showcase.page.i18n.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "i18n",
      part: "i18n",
      icon: "showcase/i18n/icon.png",
      contentClass: "showcase.page.i18n.Content",
      description: showcase.page.DescriptionBuilder.build(
        "i18n",
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
    __descriptionText : "bla bla",
      
    __tryThis : {
    },
    
    __features : {
    },
    
    __manual : {
    },    
      
    __demos : {
    },

    __api : {
    }  
  }  
});
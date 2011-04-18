/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.virtuallist.Content)

************************************************************************ */
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
qx.Class.define("showcase.page.virtuallist.Page",
{
  extend : showcase.Page,

  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Virtual List",
      part: "virtuallist",
      icon: "showcase/virtuallist/icon.png",
      contentClass: "showcase.page.virtuallist.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Virtual List",
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
    __descriptionText : "",

    __tryThis : {
    },

    __features : null,

    __manual : {
    },

    __demos : {
    },

    __api : {
    }
  }
});

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

#use(showcase.page.theme.Content)

************************************************************************ */

qx.Class.define("showcase.page.theme.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Theming",
      part: "theme",
      icon: "showcase/theme/icon.png",
      description: "<h1>Theming</h1> bla bla bla",
      contentClass: "showcase.page.theme.Content"
    });
  }
});
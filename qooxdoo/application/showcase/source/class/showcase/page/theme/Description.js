/* ************************************************************************

#use(showcase.page.theme.Content)

************************************************************************ */

qx.Class.define("showcase.page.theme.Description",
{
  extend : showcase.PageDescription,
  
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
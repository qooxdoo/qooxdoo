/* ************************************************************************

#use(showcase.page.table.Content)

************************************************************************ */

qx.Class.define("showcase.page.table.Description",
{
  extend : showcase.PageDescription,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Table",
      part: "table",
      icon: "showcase/table/icon.png",
      description: "<h1>Table</h1> bla bla bla",
      contentClass: "showcase.page.table.Content"
    });
  }
});
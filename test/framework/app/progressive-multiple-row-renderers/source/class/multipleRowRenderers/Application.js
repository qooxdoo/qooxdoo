qx.Class.define("multipleRowRenderers.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main()
    {
      super.main();

      let createRow = function (rowNum, text) {
        let ret = {
          renderer: rowNum % 2 === 0 ? "small" : "tall",
          location: "end",
          data: [rowNum + "", text],
        };

        return ret;
      };

      let columnWidths = new qx.ui.progressive.renderer.table.Widths(2);
      columnWidths.setWidth(0, 60);
      columnWidths.setWidth(1, "1*");

      let columnNames = ["Row", "Text"];

      // Instantiate a Progressive with a structure including header
      let header = new qx.ui.progressive.headfoot.TableHeading(
        columnWidths,
        columnNames
      );
      let structure = new qx.ui.progressive.structure.Default(header);
      let p = new qx.ui.progressive.Progressive(structure);

      // Instantiate a data model and populate it.
      let dataModel = new qx.ui.progressive.model.Default();
      let rowData = [];

      rowData.push(createRow(0, "I am small."));
      rowData.push(createRow(1, "I am tall."));
      rowData.push(createRow(2, "This, too, is small."));
      rowData.push(createRow(3, "This, too, is tall."));

      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      p.setDataModel(dataModel);

      // Instantiate a table row renderer
      let rowRenderer = new qx.ui.progressive.renderer.table.Row(
        columnWidths
      );
      rowRenderer.set(
        {
          alternateBgColorsTableGlobal : true
        });

      // Give Progressive the renderer, and assign a name
      p.addRenderer("small", rowRenderer);

      // Instantiate another table row renderer for tall rows
      rowRenderer = new qx.ui.progressive.renderer.table.Row(
        columnWidths
      );

      // Set its default row height to be larger than the normal one
      rowRenderer.set(
        {
          alternateBgColorsTableGlobal: true,
          defaultRowHeight: 40
        });

      // Give Progressive the renderer, and assign a name
      p.addRenderer("tall", rowRenderer);

      p.set({
        width: 400,
        maxWidth: 400,
      });

      this.getRoot().add(p, { left: 50, top: 50, bottom: 50 });

      p.render();
    }
  }
});

/*
#asset(demobrowser/demo/icons/*)
*/

/*
 * Example of using the Image cell renderer with Progressive''s Table.
 * This also demonstrates how the minimum row height can be set by a
 * cell renderer.
 */
qx.Class.define("demobrowser.demo.progressive.ProgressiveTable_VarRowHeight",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var base = "demobrowser/demo/icons/"

      this.imageData =
        [
          {
            url     : base + "format-justify-left.png",
            height  : 4,        // will be overwritten by actual image height
            tooltip : "small icon"
          },

          {
            url     : base + "multimedia-player.png",
            height  : 4,        // will be overwritten by actual image height
            tooltip : "TALL ICON"
          },

          ""
        ];

      // Pre-load each of the images so we can determine its size.  We'll need
      // to track whether all images have been loaded before we call our
      // doLoad function.
      this.__loadCount = 0;

      var aliasManager = qx.util.AliasManager.getInstance();
      var resourceManager = qx.util.ResourceManager;
      var resolved;
      var source;

      for (var i = 0; i < this.imageData.length; i++)
      {
        // Skip null entries
        if (! this.imageData[i])
        {
          continue;
        }

        resolved = aliasManager.resolve(this.imageData[i].url);
        source = resourceManager.toUri(resolved);

        // Since we had to resolve it, save the resolved name
        this.imageData[i].url = source;

        // Increment the number of images we're waiting on load completion
        ++this.__loadCount;

        // Pre-load the image.  Call doLoad() when images is loaded.
        qx.io2.ImageLoader.load(
          source,
          function(source, entry)
          {
            this.warn("Searching for [" + source + "]");

            // Find this source entry
            for (var j = 0; j < this.imageData.length; j++)
            {
              // Is this the one?
              if (this.imageData[j].url == source)
              {
                // Yup. Save its height
                this.imageData[j].height = entry.height;

                // Increment the count of loaded images
                --this.__loadCount;

                this.debug("Found [" + this.imageData[j].url + "].  loadCount=" + this.__loadCount + ", end=" + this.imageData.length);

                // Have we loaded all images?
                if (this.__loadCount == 0)
                {
                  // Yup.  Begin our loader.
                  this.doLoad();
                }

                return;
              }
            }
            
            // Should never get here
            throw new Error("Image data for " + source + " not found");
          },
          this);
      }

      // Catch the (nonexistent in this demo) case where no images need loading
      if (this.__loadCount == 0)
      {
        this.doLoad();
      }
    },

    doLoad : function()
    {
      var nextId = 0;
      var _this = this;
      var createRow = function(imageNum, text)
      {
        var ret =
        {
          renderer : "row",
          location : "end",
          data     : [ text, _this.imageData[imageNum] ]
        };
        return ret;
      };

      var columnWidths = new qx.ui.progressive.renderer.table.Widths(2);
      columnWidths.setWidth(0, 200);
      columnWidths.setWidth(1, "1*");

      var columnNames = [ "Id", "Image" ];

      // Instantiate a Progressive with a structure including header & footer
      var header = new qx.ui.progressive.headfoot.TableHeading(columnWidths,
                                                               columnNames);
      var footer = new qx.ui.progressive.headfoot.Progress(columnWidths,
                                                           columnNames);
      var structure = new qx.ui.progressive.structure.Default(header,
                                                              footer);
      var progressive = new qx.ui.progressive.Progressive(structure);

      // Add a message
      var message =
        new qx.ui.basic.Atom("Note variable row heights in this table.");
      message.setHeight(16);
      message.setTextColor("red");
      progressive.add(message);

      // Instantiate a data model and populate it.
      var dataModel = new qx.ui.progressive.model.Default();
      var rowData = [ ];

      rowData.push(createRow(0, "I am small."));
      rowData.push(createRow(1, "I am tall."));
      rowData.push(createRow(0, "This, too, is small."));
      rowData.push(createRow(1, "This, too, is tall."));
      rowData.push(createRow(2, "No attributes specified."));

      dataModel.addElements(rowData);

      // Tell Progressive about its data model
      progressive.setDataModel(dataModel);

      // Instantiate a table row renderer
      var rowRenderer =
        new qx.ui.progressive.renderer.table.Row(columnWidths);

      // Give Progressive the renderer, and assign a name
      progressive.addRenderer("row", rowRenderer);

      // Tell the row renderer to use an image renderer for column 1
      var r = new qx.ui.progressive.renderer.table.cell.Image();
      rowRenderer.addRenderer(1, r);

      progressive.set(
        {
          width : 400,
          maxWidth :400
        });
      this.getRoot().add(progressive, { left : 50, top : 50, bottom : 50 });

      progressive.render();
    }
  }
});

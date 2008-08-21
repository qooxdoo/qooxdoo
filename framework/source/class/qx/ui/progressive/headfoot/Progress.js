/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * The standard footer used with Progressive's Table renderer, to show
 * progress of loading data into the table.
 */
qx.Class.define("qx.ui.progressive.headfoot.Progress",
{
  extend     : qx.ui.progressive.headfoot.Abstract,

  construct : function(columnWidths, labelArr)
  {
    this.base(arguments);

    // Set a default height for the progress bar
    this.setHeight(16);
    this.setPadding(0);

    this.__colors = {};

    // link to color theme
    var colorMgr = qx.theme.manager.Color.getInstance();
    this.__colors.background =
      colorMgr.resolve("progressive-progressbar-background");
    this.__colors.indicatorDone =
      colorMgr.resolve("progressive-progressbar-indicator-done");
    this.__colors.indicatorUndone =
      colorMgr.resolve("progressive-progressbar-indicator-undone");
    this.__colors.percentBackground =
      colorMgr.resolve("progressive-progressbar-percent-background");
    this.__colors.percentText =
      colorMgr.resolve("progressive-progressbar-percent-text");

    this.set(
    {
      backgroundColor : this.__colors.background
    });

    // Create a widget that continually increases its width for progress bar
    this.__progressBar = new qx.ui.core.Widget();
    this.__progressBar.set(
    {
      width : 0,
      backgroundColor : this.__colors.indicatorDone
    });
    this.add(this.__progressBar);

    // Create a flex area between the progress bar and the percent done
    var spacer = new qx.ui.core.Widget();
    spacer.set(
      {
        backgroundColor : this.__colors.indicatorUndone
      });
    this.add(spacer, { flex : 1 });

    // We also like to show progress as a percentage done string.
    this.__percentDone = new qx.ui.basic.Atom("0%");
    this.__percentDone.set(
    {
      width           : 100,
      backgroundColor : this.__colors.percentBackground,
      textColor       : this.__colors.percentText
    });
    this.add(this.__percentDone);

    // We're initially invisible
    this.exclude();
  },

  members :
  {
    __total : null,
    __colors : null,
    __progressBar : null,
    __percentDone : null,

    // overridden
    join : function(progressive)
    {
      // Save the progressive handle
      this.base(arguments, progressive);

      // Listen for the "renderStart" event, to save the number of elements on
      // the queue, and to set ourself visible
      progressive.addListener(
        "renderStart",
        function(e)
        {
          this.__total = e.getData().initial;
          this.show();
        },
        this);

      // Listen for the "progress" event, to update the progress bar
      progressive.addListener(
        "progress",
        function(e)
        {
          var complete = 1.0 - (e.getData().remaining / this.__total);
          var mySize = this.getBounds();
          if (mySize)
          {
            var barWidth = Math.floor((mySize.width -
                                       this.__percentDone.getBounds().width) *
                                      complete);
            var percent = Math.floor(complete * 100) + "%";

            if (! isNaN(barWidth))
            {
              this.__progressBar.setMinWidth(barWidth);
              this.__percentDone.setLabel(percent);
            }
          }
        },
                              this);

      // Listen for the "renderEnd" event to make ourself invisible
      progressive.addListener(
        "renderEnd",
        function(e)
        {
          this.exclude();
        },
        this);
    }
  },

  destruct : function()
  {
    this._disposeFields(
      "__colors",
      "__progressive");

    this._disposeObjects(
      "__progressBar",
      "__percentDone");
  }
});

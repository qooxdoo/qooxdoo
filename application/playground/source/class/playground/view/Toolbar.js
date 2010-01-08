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

************************************************************************ */
qx.Class.define("playground.view.Toolbar", 
{
  extend : qx.ui.toolbar.ToolBar,


  construct : function(sampleNames)
  {
    this.base(arguments);
    
    this.__sampleContainer = {};
    
    // left part
    var part1 = new qx.ui.toolbar.Part();
    this.add(part1);

    // run button
    var runButton = new qx.ui.toolbar.Button(
      this.tr("Run"), "playground/image/media-playback-start.png"
    );
    part1.add(runButton);
    runButton.setToolTipText(this.tr("Run the source code"));
    runButton.addListener("execute", function() {
      this.fireEvent("run");
    }, this);

    // select sample button
    var selectSampleButton = new qx.ui.toolbar.MenuButton(
      this.tr("Samples"), "playground/image/document-folder.png"
    );
    part1.add(selectSampleButton);
    selectSampleButton.setToolTipText(this.tr("Select a sample"));
    selectSampleButton.setMenu(this.__createSampleMenu(sampleNames));

    // highlighting button
    this.__highlightButton = new qx.ui.form.ToggleButton(this.tr("Syntax Highlighting"), "icon/16/actions/check-spelling.png");
    part1.add(this.__highlightButton);
    this.__highlightButton.setAppearance("toolbar-button");
    this.__highlightButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeHighlight", e.getData(), e.getOldData());
    }, this);
    this.__highlightButton.setValue(true);

    // spacer
    this.addSpacer();

    // right part
    var part2 = new qx.ui.toolbar.Part();
    this.add(part2);

    // log Check button
    this.__logCheckButton = new qx.ui.toolbar.CheckBox(
      this.tr("Log"), "playground/image/utilities-log-viewer.png"
    );
    part2.add(this.__logCheckButton);
    this.__logCheckButton.setToolTipText(this.tr("Show log output"));
    this.__logCheckButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeLog", e.getData(), e.getOldData());
    }, this);

    // api button
    var apiButton = new qx.ui.toolbar.Button(
      this.tr("API Viewer"), "playground/image/help-contents.png"
    );
    part2.add(apiButton);
    apiButton.setToolTipText(this.tr("Open the qooxdoo API Viewer"));
    apiButton.addListener("execute", function() {
      this.fireEvent("openApi");
    }, this);

    // help button
    var helpButton = new qx.ui.toolbar.Button(
      this.tr("Manual"), "playground/image/help-about.png"
    );
    part2.add(helpButton);
    helpButton.setToolTipText(this.tr("Open the qooxdoo Manual"));
    helpButton.addListener("execute", function() {
      this.fireEvent("openManual");
    }, this);
  },

  events : 
  {
    "run" : "qx.event.type.Event",
    "changeSample" : "qx.event.type.Data",
    "changeHighlight" : "qx.event.type.Data",
    "changeLog" : "qx.event.type.Data",
    "openApi" : "qx.event.type.Event",
    "openManual" : "qx.event.type.Event"
  },


  members :
  {
    __sampleContainer : null,
    __highlightButton : null,
    __logCheckButton : null,
    
    
    getSample : function(id) {
      return this.__sampleContainer[id];
    },
    
    
    showLog : function(show) {
      this.__logCheckButton.setValue(show);
    },
    
    
    enableHighlighting : function(value) {
      this.__highlightButton.setEnabled(value);
    },
    
    
    isHighlighted : function() {
      return this.__highlightButton.getValue();
    },
        
    
    /**
     * Generates a menu to select the samples.
     *
     * @return {qx.ui.menu.Menu} menu of the samples
     */
    __createSampleMenu : function(sampleNames)
    {
      var menu = new qx.ui.menu.Menu;

      for (var i = 0; i < sampleNames.length; i++)
      {
        var name = sampleNames[i];
        
        var sampleEntryButton = new qx.ui.menu.Button(
          name, "icon/16/mimetypes/office-document.png"
        );
        menu.add(sampleEntryButton);

        sampleEntryButton.addListener(
          "execute", qx.lang.Function.bind(function(sample, e) {
            this.fireDataEvent("changeSample", sample);
          }, this, name)
        );
      }

      return menu;
    }  
  }
});

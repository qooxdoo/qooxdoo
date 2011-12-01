/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Selenese representation of SeleniumWindow's commands
 */
qx.Class.define("inspector.selenium.SeleneseTestCase", {

  extend : qx.ui.window.Window,

  /**
   * @param url {String} base URL for the Selenese test case
   * @param title {String} title for the Selenese test case
   */
  construct : function(url, title)
  {
    this.base(arguments, "Selenese Test Case");
    this.set({
      layout : new qx.ui.layout.VBox(10),
      width: 500,
      height: 450,
      contentPadding: 5
    });

    var topCont = new qx.ui.container.Composite(new qx.ui.layout.Grow());
    this.add(topCont, {flex: 1});
    this._textArea = new qx.ui.form.TextArea();
    topCont.add(this._textArea);

    var botCont = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
    botCont.setAllowGrowX(false);
    botCont.setAlignX("center");
    this.add(botCont);
    var btnImport = new qx.ui.form.Button("Import");
    btnImport.addListener("execute", function(ev) {
      qx.event.Timer.once(function() {
        this.__importSelenese(ev)
      }, this, 100)
    }, this);

    botCont.add(btnImport);
    var btnCancel = new qx.ui.form.Button("Cancel");
    btnCancel.addListener("execute", function(ev) {
      this.close()
    }, this);
    botCont.add(btnCancel);

    var url = url || "";
    var title = title || "untitled";

    this._header = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
      '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">',
      '<head profile="http://selenium-ide.openqa.org/profiles/test-case">',
      '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
      '  <link rel="selenium.base" href="' + url + '" />',
      '  <title>' + title + '</title>',
      '</head>',
      '<body>',
      '  <table cellpadding="1" cellspacing="1" border="1">',
      '    <thead>',
      '      <tr>',
      '        <td rowspan="1" colspan="3">' + title + '</td>',
      '      </tr>',
      '    </thead>',
      '    <tbody>'
    ];

    this._footer = ['    </tbody>',
      '  </table>',
      '</body>',
      '</html>'
    ]

    this.__rows = [];

    this.__helperDiv = document.createElement("div");
    this.__helperDiv.style.display = "none";
    this.addListenerOnce("appear", function(ev) {
      this.getContentElement().getDomElement().appendChild(this.__helperDiv);
    });
  },

  properties :
  {
    seleneseCommands : {
      check : "Array",
      event : "changeSeleneseCommands"
    }
  },

  members :
  {
    _textArea : null,
    _header : null,
    _footer : null,
    __rows : null,
    __helperDiv : null,


    /**
     * Add a Selenium command to the test case.
     *
     * @param command {Array} Array containing the Selenium command, locator and
     * optional parameter string
     */
    addCommand : function(command)
    {
      if (!command instanceof Array) {
        return;
      }
      this.__rows.push(command.slice(0,3));
    },


    /**
     * Delete all commands.
     */
    reset : function()
    {
      this.__rows = [];
    },


    /**
     * Returns the test case in Selenese HTML format.
     *
     * @return {String} Selenese test case
     */
    getSelenese : function()
    {
      var html = this._header.join("\n");
      for (var i=0,l=this.__rows.length; i<l; i++) {
        var row = this.__rows[i];
        html += "\n      <tr>\n";

        for (var j=0; j<row.length; j++) {
          html += "        <td>" + row[j] + "</td>\n";
        }

        html += "      </tr>\n";
      }
      html += this._footer.join("\n");
      return html;
    },


    /**
     * Display the Selenese test case
     */
    showSelenese : function()
    {
      this._textArea.setValue(this.getSelenese());
    },

    /**
     * Imports the Selenium commands from a Selenese (HTML) test case pasted
     * into the text area
     *
     * @lint ignoreDeprecated(alert)
     */
    __importSelenese : function()
    {
      var sel = this._textArea.getValue();
      if (!sel || !sel.indexOf("<table")) {
        alert("Invalid Selenese 1");
        return;
      }
      sel = sel.replace(/\r\n/g, "");
      sel = sel.replace(/\n/g, "");
      var body = /<body>(.*?)<\/body>/mg.exec(sel);

      if (!body || body.length < 2) {
        alert("Invalid Selenese 2");
        return;
      }
      // too lazy to parse Selenese HTML, let the browser handle it
      this.__helperDiv.innerHTML = body[1];

      var rows = qx.bom.Selector.query("tbody tr", this.__helperDiv);
      var commands = [];
      for (var i=0, l=rows.length; i<l; i++) {
        var row = rows[i];
        var cells = qx.bom.Selector.query("td", row);
        var cmd = [];
        for (var j=0, m=cells.length; j<m; j++) {
          var val = "";
          if (cells[j].firstChild && cells[j].firstChild.nodeValue) {
            val = cells[j].firstChild.nodeValue;
          }
          cmd.push(val);
        }
        commands.push(cmd);
      }

      this.setSeleneseCommands(commands);
      this.close();
    }

  }

});
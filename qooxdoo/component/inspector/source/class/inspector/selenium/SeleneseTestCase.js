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

qx.Class.define("inspector.selenium.SeleneseTestCase", {

  extend : qx.ui.window.Window,

  construct : function(url, title)
  {
    this.base(arguments, "Selenese Test Case");
    this.set({
      layout : new qx.ui.layout.Grow(),
      width: 500,
      height: 450,
      contentPadding: 5
    });
    var scroll = new qx.ui.container.Scroll();
    this.add(scroll);
    this._textArea = new qx.ui.form.TextArea();
    scroll.add(this._textArea, {edge: 0});

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
  },

  members :
  {
    _textArea : null,
    _header : null,
    _footer : null,
    __rows : null,


    /**
     * Add a Selenium command to the test case.
     *
     * @param {Array} command Array containing the Selenium command, locator and
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


    showSelenese : function()
    {
      this._textArea.setValue(this.getSelenese());
    }

  }

});
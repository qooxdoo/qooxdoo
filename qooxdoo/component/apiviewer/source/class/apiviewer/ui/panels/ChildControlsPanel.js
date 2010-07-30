/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("apiviewer.ui.panels.ChildControlsPanel", {

  extend: apiviewer.ui.panels.InfoPanel,

  members :
  {

    getItemTypeHtml : function(node, currentClassDocNode) {
      return apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var", true);
    },


    getItemTitleHtml : function(node, currentClassDocNode) {
      return apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());
    },


    getItemTextHtml : function(node, currentClassDocNode, showDetails) {
      var textHtml = new qx.util.StringBuilder(node.getDescription());

      if (showDetails) {
        textHtml.add(
          '<div class="item-detail-headline">', "Default value:", '</div>',
          '<div class="item-detail-text">',
          '<code>',
          (node.getDefaultValue() ? node.getDefaultValue() : "null"),
          '</code>',
          '</div>'
        );
      }

      return textHtml.get();
    }

  }

});
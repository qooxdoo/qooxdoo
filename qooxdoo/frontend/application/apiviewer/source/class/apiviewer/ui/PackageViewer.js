/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Shows the package details.
 */
qx.Class.define("apiviewer.ui.PackageViewer",
{
  extend : apiviewer.ui.AbstractViewer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.addInfoPanel(new apiviewer.ui.panels.ClassPanel("classes", "classes", "class"));
    this.addInfoPanel(new apiviewer.ui.panels.ClassPanel("classes", "interfaces", "interface"));
    this.addInfoPanel(new apiviewer.ui.panels.ClassPanel("classes", "mixins", "mixin"));
    this.addInfoPanel(new apiviewer.ui.panels.PackagePanel("packages", "packages"));

    this.getContentElement().setAttribute("id", "ClassViewer");

    this._init(new apiviewer.dao.Package({}));
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Returns the HTML fragment for the title
     *
     * @param classNode {apiviewer.dao.Package} the package documentation node for the title
     * @return {String} HTML fragment of the title
     */
    _getTitleHtml : function(classNode)
    {
      var vHtml = "";

      // Title
      vHtml += '<small>package</small>';
      vHtml += classNode.getFullName();
      return vHtml;
    },


    _getDescriptionHtml : function(classNode)
    {
      var descHtml = new qx.util.StringBuilder();
      var desc = classNode.getDescription();
      if (desc != "") {
        descHtml.add(
          '<div class="class-description">',
          apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(desc, classNode),
          '</div>');
      }
      return descHtml.get();
    }

  }
});

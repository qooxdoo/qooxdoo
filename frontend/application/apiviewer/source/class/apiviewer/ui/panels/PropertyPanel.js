/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

qx.Class.define("apiviewer.ui.panels.PropertyPanel", {

  extend: apiviewer.ui.panels.InfoPanel,

  members : {

    __createGeneratedMethodsHtml : function(node, currentClassDocNode) {
        if (node.isOldProperty()) {
          return "";
        }

        if (node.isPrivate()) {
          var access = "__";
          var name = node.getName().substring(2);
        } else if (node.isProtected()) {
          access = "_";
          name = node.getName().substring(1);
        } else {
          access = "";
          name = node.getName();
        }
        name = qx.lang.String.toFirstUp(name);

        var generatedMethods = [
          "{@link #" + access + "set" + name + "}</td><td> Set the property value.",
          "{@link #" + access + "get" + name + "}</td><td> Get the property value.",
          "{@link #" + access + "reset" + name + "}</td><td> Reset the property value.",
          "{@link #" + access + "init" + name + "}</td><td> Call apply method with the init value."
        ];

        console.log("Name: " + node.getName() + " :: " + node.getType())

        if (node.getType() == "Boolean") {
          generatedMethods.push("{@link #" + access + "toggle" + name + "}</td><td> Toggle the property value.");
        }

        var ClassViewer = apiviewer.ui.ClassViewer;
        var textHtml = new qx.util.StringBuilder();
        textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Generated methods:", ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT);
        textHtml.add("<table><tr><td>");
        textHtml.add(generatedMethods.join("</td></tr><tr><td>"));
        textHtml.add("</td></tr></table>");
        textHtml.add(ClassViewer.DIV_END);
        return apiviewer.ui.panels.InfoPanel.resolveLinkAttributes(textHtml.get(), currentClassDocNode);
    },


    __createAttributesHtml : function(node)
    {
      var attributes = [];
      if (node.isNullable()) {
        attributes.push("This property allows 'null' values");
      }
      if (node.isInheritable()) {
        attributes.push("The property value can be inherited from a parent object.");
      }
      if (node.isAppearance()) {
        attributes.push("The property value can be set using appearances.");
      }

      if (attributes.length > 0)
      {
        var ClassViewer = apiviewer.ui.ClassViewer;
        var textHtml = new qx.util.StringBuilder();
        textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Property attributes:", ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT);
        textHtml.add("<ul><li>");
        textHtml.add(attributes.join("</li><li>"));
        textHtml.add("</li></ul>");
        textHtml.add(ClassViewer.DIV_END);
        return textHtml.get();
      }
      else
      {
        return "";
      }
    },



    /**
     * Creates the HTML showing the information about a property.
     *
     * @type member
     * @param node {Map} the doc node of the property.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the property.
     */
    getItemHtml : function(node, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ui.ClassViewer;

      // Get the property node that holds the documentation
      var docNode = node.getDocNode();

      // Add the title
      var typeHtml = apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var");
      var titleHtml = apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());

      // Add the description
      var textHtml = new qx.util.StringBuilder(apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, showDetails));

      if (showDetails)
      {

        // Add allowed values
        var allowedValue = null;

        possibleValues = node.getPossibleValues()
        if (possibleValues) {
          if (node.isNullable()) {
            possibleValues += ", null";
          }
          allowedValue =
            "<span class='item-detail-param-name'>" +
            possibleValues.split(", ").join("</span>, <span class='item-detail-param-name'>") +
            "</span>";
        } else if (node.getClassname()) {
          allowedValue = "instances of " + node.getClassname();
        } else if (node.getInstance()) {
          allowedValue = "instances of " + node.getInstance() + " or sub classes";
        } else if (node.getUnitDetection()) {
          allowedValue = "units: " + node.getUnitDetection();
        } else if (node.getType()) {
          allowedValue = "any " + node.getType();
        }

        if (allowedValue)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "Allowed values:", ClassViewer.DIV_END, ClassViewer.DIV_START_DETAIL_TEXT);
          textHtml.add(allowedValue, ClassViewer.DIV_END);
        }

        // Add check
        if (node.getCheck())
        {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Check:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
            node.getCheck(),
            ClassViewer.DIV_END
          );
        }

        // Add default value
        textHtml.add(
          ClassViewer.DIV_START_DETAIL_HEADLINE, "Default value:", ClassViewer.DIV_END,
          ClassViewer.DIV_START_DETAIL_TEXT,
          '<span class="item-detail-param-name">',
          (node.getDefaultValue() ? node.getDefaultValue() : "null"),
          '</span>',
          ClassViewer.DIV_END
        );

        // Add get alias
        if (node.getGetAlias()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Get alias:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, node.getGetAlias(), ClassViewer.DIV_END
          );
        }

        // Add set alias
        if (node.getSetAlias()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Set alias:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT, node.getSetAlias(), ClassViewer.DIV_END
          );
        }

        // add event
        if (node.getEvent()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Change event:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
            apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
              "#"+node.getEvent(), node.getClass(), true, true
            ),
            ClassViewer.DIV_END
          );
        }

        // add apply method
        if (node.getApplyMethod()) {
          textHtml.add(
            ClassViewer.DIV_START_DETAIL_HEADLINE, "Apply method:", ClassViewer.DIV_END,
            ClassViewer.DIV_START_DETAIL_TEXT,
            apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
              "#"+node.getApplyMethod(), node.getClass(), true, true
            ),
            ClassViewer.DIV_END
          );
        }

        textHtml.add(this.__createAttributesHtml(node));
        textHtml.add(this.__createGeneratedMethodsHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createIncludedFromHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createOverwriddenFromHtml(node));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInheritedFromHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInfoRequiredByHtml(node));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(docNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createErrorHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createDeprecationHtml(docNode, "property"));
      }

      var info = {};
      info.textHtml = textHtml.get();
      info.typeHtml = typeHtml;
      info.titleHtml = titleHtml;

      return info;
    }

  }

});
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

************************************************************************ */

qx.Class.define("apiviewer.ui.panels.PropertyPanel", {

  extend: apiviewer.ui.panels.InfoPanel,

  members :
  {
    __createGeneratedMethodsHtml : function(node, currentClassDocNode)
    {
      if (node.isRefined()) {
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

      name = qx.lang.String.firstUp(name);

      var generatedMethods = [];

      if (node.getPropertyType() == "fast")
      {
        generatedMethods.push("{@link #" + access + "get" + name + "}</td><td> Get the property value.");
      }
      else
      {
        generatedMethods.push("{@link #" + access + "set" + name + "}</td><td> Set the property value.");

        if (!node.isPropertyGroup())
        {
          generatedMethods.push("{@link #" + access + "get" + name + "}</td><td> Get the property value.");
          generatedMethods.push("{@link #" + access + "init" + name + "}</td><td> Call apply method with the init value.");
        }

        generatedMethods.push("{@link #" + access + "reset" + name + "}</td><td> Reset the property value.");

        if (node.getType() == "Boolean")
        {
          generatedMethods.push("{@link #" + access + "toggle" + name + "}</td><td> Toggle the property value.");
          generatedMethods.push("{@link #" + access + "is" + name + "}</td><td> Check whether the property equals <code>true</code>.");
        }
      }

      var textHtml = new qx.util.StringBuilder();
      textHtml.add('<div class="item-detail-headline">', "Generated methods:", '</div>', '<div class="item-detail-text">');
      textHtml.add("<table><tr><td>");
      textHtml.add(generatedMethods.join("</td></tr><tr><td>"));
      textHtml.add("</td></tr></table>");
      textHtml.add('</div>');

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
      if (node.isThemeable()) {
        attributes.push("The property value can be set using appearance themes.");
      }
      if (node.isPropertyGroup()) {
        attributes.push("The property is a property group.");
      }
      if (node.isRefined()) {
        attributes.push("The property refines the init value of an existing property.");
      }

      if (attributes.length > 0)
      {
        var textHtml = new qx.util.StringBuilder();
        textHtml.add('<div class="item-detail-headline">', "Property attributes:", '</div>', '<div class="item-detail-text">');
        textHtml.add("<ul><li>");
        textHtml.add(attributes.join("</li><li>"));
        textHtml.add("</li></ul>");
        textHtml.add('</div>');
        return textHtml.get();
      }
      else
      {
        return "";
      }
    },


    /**
     * Creates the HTML showing whether the item is refined
     *
     * @param node {apiviewer.dao.ClassItem} item to get the the information from
     * @return {String} HTML fragment
     */
    __createRefinedFromHtml : function(node)
    {
      if (node.isRefined())
      {
        var html = new qx.util.StringBuilder(
          '<div class="item-detail-headline">', "Refined property:", '</div>',
          '<div class="item-detail-text">',
          apiviewer.ui.panels.InfoPanel.createItemLinkHtml(node.getOverriddenFrom().getFullName()+"#"+node.getName()),
          '</div>'
        );
        return html.get();
      }
      else
      {
        return "";
      }
    },


    getItemTypeHtml : function(node) {
      return apiviewer.ui.panels.InfoPanel.createTypeHtml(node, "var");
    },


    getItemTitleHtml : function(node) {
      return apiviewer.ui.panels.InfoPanel.setTitleClass(node, node.getName());
    },


    /**
     * Creates the HTML showing the information about a property.
     *
     * @param node {Map} the doc node of the property.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the property.
     */
    getItemTextHtml : function(node, currentClassDocNode, showDetails)
    {
      // Get the property node that holds the documentation
      var docNode = node.getDocNode();

      // Add the description
      var textHtml = new qx.util.StringBuilder(apiviewer.ui.panels.InfoPanel.createDescriptionHtml(node, node.getClass(), showDetails));

      if (showDetails)
      {

        // Add allowed values
        var allowedValue = null;

        var possibleValues = qx.lang.Array.clone(node.getPossibleValues());

        if (possibleValues.length > 0)
        {
          if (node.isNullable()) {
            possibleValues.push("null");
          }
          allowedValue =
            "<code>" +
            possibleValues.join("</code>, <code>") +
            "</code>";
        } else if (node.getClassname()) {
          allowedValue = "instances of " + node.getClassname();
        } else if (node.getInstance()) {
          allowedValue = "instances of " + node.getInstance() + " or sub classes";
        } else if (node.getType()) {
          allowedValue = "any " + node.getType();
        }

        if (allowedValue)
        {
          textHtml.add('<div class="item-detail-headline">', "Allowed values:", '</div>', '<div class="item-detail-text">');
          textHtml.add(allowedValue, '</div>');
        }

        // Add check
        if (node.getCheck())
        {
          textHtml.add(
            '<div class="item-detail-headline">', "Check:", '</div>',
            '<div class="item-detail-text">',
            node.getCheck(),
            '</div>'
          );
        }

        // Add default value
        if (!node.isPropertyGroup())
        {
          textHtml.add(
            '<div class="item-detail-headline">', "Init value:", '</div>',
            '<div class="item-detail-text">',
            '<code>',
            (node.getDefaultValue() ? node.getDefaultValue() : "null"),
            '</code>',
            '</div>'
          );
        }

        // add event
        if (node.getEvent() && !node.isRefined())
        {
          textHtml.add(
            '<div class="item-detail-headline">', "Change event:", '</div>',
            '<div class="item-detail-text">',
            apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
              "#"+node.getEvent(), node.getClass(), true, true
            ),
            '</div>'
          );
        }

        // add apply method
        if (node.getApplyMethod() && !node.isRefined())
        {
          textHtml.add(
            '<div class="item-detail-headline">', "Apply method:", '</div>',
            '<div class="item-detail-text">',
            apiviewer.ui.panels.InfoPanel.createItemLinkHtml(
              "#"+node.getApplyMethod(), node.getClass(), true, true
            ),
            '</div>'
          );
        }

        textHtml.add(this.__createAttributesHtml(node));
        textHtml.add(this.__createGeneratedMethodsHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createIncludedFromHtml(node, currentClassDocNode));
        textHtml.add(this.__createRefinedFromHtml(node));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInheritedFromHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createInfoRequiredByHtml(node));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createSeeAlsoHtml(docNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createErrorHtml(node, currentClassDocNode));
        textHtml.add(apiviewer.ui.panels.InfoPanel.createDeprecationHtml(docNode, "property"));
      }

      return textHtml.get();
    }

  }

});

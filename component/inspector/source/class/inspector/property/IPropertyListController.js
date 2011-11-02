/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This interface offers a set of method declarations for all classes which
 * want to control the {@link inspector.propertyEditor.PropertyList}.
 */
qx.Interface.define("inspector.property.IPropertyListController", {

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * Should return the current selected object which the property list should
     * represent.
     * @return {qx.core.Object} The selected object.
     */
    getQxObject: function() {
      return true;
    },


    /**
     * This method should be able to take the current selected property.
     * @param layout {qx.ui.layout.BoxLayout} The layout holding the property.
     */
    setSelectedProperty: function(layout) {
      return true;
    },


    /**
     * This method should return the current selected property.
     * @return {qx.ui.layout.BoxLayout} The layout holding the current selected property.
     */
    getSelectedProperty: function() {
      return true;
    },


    /**
     * The controller should tell the lists if they should show the inherited
     * properties.
     * @return {boolean} True, if the inherited properties should be shown.
     */
    getInheritedStatus: function() {
      return true;
    },


    /**
     * The grouping of the properties should  be controlled by the implementing
     * controller.
     * @return {boolean} True, if the properties should be grouped.
     */
    getGroupStatus: function() {
      return true;
    },


    /**
     * Should invoke a selection of the current selected property, which should
     * be a qooxdoo objects, as new current widget.
     */
    gotoSelectedWidget: function() {
      return true;
    },


    /**
     * Should return the used {@link inspector.propertyEditor.IFilter}.
     * @return {inspector.propertyEditor.IFilter} The current used filter.
     */
    getFilter: function() {
      return true;
    }
  }
});

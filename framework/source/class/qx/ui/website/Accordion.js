/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * The Accordion is a group of vertically stacked panels (here called pages),
 * each with a header.
 * By default, only one page is visible while the others are collapsed.
 * Clicking or tapping a collapsed page's header will expand it while collapsing the
 * previously expanded page.
 *
 * <h2>Markup</h2>
 * The Accordion contains an unordered list element (<code>ul</code>), which
 * will be created if not already present.
 * Headers and pages are list items (<code>li</code>). Each header must contain
 * a button with an <code>accordionPage</code> data attribute where the value is a
 * CSS selector string identifying the corresponding page. Headers and pages
 * will not be created automatically. They can be predefined in the DOM before
 * the <code>q().accordion()</code> factory method is called, or added programmatically.
 *
 * <h2>CSS Classes</h2>
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Class Name</td>
 *       <td>Applied to</td>
 *       <td>Description</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>qx-accordion</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Accordion widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-accordion-button</code></td>
 *       <td>Page header (<code>li</code>)</td>
 *       <td>Identifies and styles the page headers</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-accordion-button-active</code></td>
 *       <td>Page header (<code>li</code>)</td>
 *       <td>Identifies and styles the header of the currently expanded page. Applied in addition to <code>qx-accordion-button</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-accordion-page</code></td>
 *       <td>Page (<code>li</code>)</td>
 *       <td>Identifies and styles the pages</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @require(qx.module.util.Object)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Accordion", {
    extend: qx.ui.website.Tabs,

    statics: {
        /**
         * *button*
         *
         * Template used by {@link qx.ui.website.Tabs#addButton} to create a new button.
         *
         * Default value: <pre><li><button>{{{content}}}</button></li></pre>
         */
        _templates: {
          button: "<li><button>{{{content}}}</button></li>"
        },


        /**
         * Factory method which converts the current collection into a collection of
         * accordion widgets.
         *
         * @param preselected {Integer?} The (zero-based) index of the panel that
         * should initially be opened
         * @return {qx.ui.website.Accordion} A new Accordion collection.
         * @attach {qxWeb}
         */
        accordion: function(preselected) {
            var accordion = new qx.ui.website.Accordion(this);
            accordion.setConfig("orientation", "vertical");
            if (preselected) {
                accordion.setConfig("preselected", preselected);
            }
            accordion.init();

            return accordion;
        }
    },


    construct: function(selector, context) {
        this.base(arguments, selector, context);
    },


    defer: function(statics) {
        qxWeb.$attach({
            accordion: statics.accordion
        });
    }
});
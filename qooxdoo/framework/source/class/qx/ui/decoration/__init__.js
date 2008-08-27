/**
 * Decorations are used to style widgets. The idea is to have an independent
 * layer around the widget content that can be freely styled. This way you can
 * have separate decorators that define all kinds of decoration (colors,
 * background image, corners, ...), and apply them to existing widgets, without
 * interfering with the widget code itself.
 *
 * Here is a schematic drawing to illustrate that:
 *
 * <pre>
 *    +-----------------------------------------+ 
 *    | Widget (Containter Element)             | 
 *    | +-----------------------------------+   |
 *    | | Decoration                        |   |
 *    | | +-----------------------------------+ |
 *    | | | Content                           | |
 *    | | |                                   | |
 *    | | | &lt;div&gt;, &lt;input&gt;, &lt;image&gt;, ...      | |
 *    | | |                                   | |
 *    | +-|                                   | |
 *    |   +-----------------------------------+ |
 *    +-----------------------------------------+
 * </pre>
 *
 */

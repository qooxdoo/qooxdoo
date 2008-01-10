/**
 * Boilerplate code for the *qx.xml* package:
 * <pre>
 * myXml = new qx.xml.Document.fromString( xlmText);
 * // activate XPath support in IE7
 * if ((qx.core.Client.getEngine()=="mshtml") && (qx.core.Client.getVersion()==7))
 * {
 *   if( myXml.setProperty)
 *   {
 *      myXml.setProperty('SelectionLanguage','XPath') ;
 *   }
 * }
 * var myElements = qx.xml.Element.selectNodes(myXml, "//view-info[starts-with(&#64;viewname, 'MyView')]/&#64;viewname");
 *
 * </pre>
 */

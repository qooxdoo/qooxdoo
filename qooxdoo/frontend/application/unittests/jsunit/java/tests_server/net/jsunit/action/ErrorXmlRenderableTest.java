package net.jsunit.action;

import junit.framework.TestCase;
import net.jsunit.utility.XmlUtility;

public class ErrorXmlRenderableTest extends TestCase {

    public void testSimple() throws Exception {
        ErrorXmlRenderable renderable = new ErrorXmlRenderable("a message");
        assertEquals("<error>a message</error>", XmlUtility.asString(renderable.asXml()));
    }
}

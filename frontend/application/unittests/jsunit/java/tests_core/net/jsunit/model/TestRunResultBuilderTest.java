package net.jsunit.model;

import junit.framework.TestCase;
import net.jsunit.DummyBrowserResult;
import net.jsunit.utility.XmlUtility;

public class TestRunResultBuilderTest extends TestCase {

    public void testSimple() throws Exception {
        TestRunResultBuilder builder = new TestRunResultBuilder(new DummyBrowserSource("mybrowser.exe", 1));
        TestRunResult result = builder.build(XmlUtility.asXmlDocument(fullValidResult()));
        assertEquals(ResultType.SUCCESS, result.getResultType());
        assertEquals(2, result.getChildren().size());
        assertEquals("my cool os", result.getOsString());
        assertEquals("127.0.0.1", result.getIpAddress());
        assertEquals("machine.example.com", result.getHostname());
    }

    private String fullValidResult() {
        return
                "<testRunResult>" +
                        "<properties>" +
                        "<property name=\"os\" value=\"my cool os\"></property>" +
                        "<property name=\"ipAddress\" value=\"127.0.0.1\"></property>" +
                        "<property name=\"hostname\" value=\"machine.example.com\"></property>" +
                        "</properties>" +
                        successResult().asXmlFragment() +
                        successResult().asXmlFragment() +
                        "</testRunResult>";
    }

    private BrowserResult successResult() {
        return new DummyBrowserResult(true, 0, 0);
    }


}

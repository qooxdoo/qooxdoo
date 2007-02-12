package net.jsunit.model;

import junit.framework.TestCase;
import net.jsunit.DummyBrowserResult;
import net.jsunit.utility.XmlUtility;

public class DistributedTestRunResultBuilderTest extends TestCase {

    public void testSimple() throws Exception {
        DistributedTestRunResultBuilder builder = new DistributedTestRunResultBuilder(new DummyBrowserSource("mybrowser.exe", 0));
        DistributedTestRunResult result = builder.build(XmlUtility.asXmlDocument(distributedTestRunResultString()));
        assertEquals(2, result.getTestRunResults().size());
    }

    private String distributedTestRunResultString() {
        return "<distributedTestRunResult>" +
                testRunResultString() +
                testRunResultString() +
                "</distributedTestRunResult>";
    }

    private String testRunResultString() {
        return
                "<testRunResult>" +
                        "<properties>" +
                        "<property name=\"os\" value=\"my cool os\"></property>" +
                        "<property name=\"ipAddress\" value=\"127.0.0.1\"></property>" +
                        "<property name=\"hostname\" value=\"machine.example.com\"></property>" +
                        "</properties>" +
                        successResult().asXmlFragment() +
                        errorResult().asXmlFragment() +
                        "</testRunResult>";
    }

    private BrowserResult successResult() {
        return new DummyBrowserResult(true, 0, 0);
    }

    private BrowserResult errorResult() {
        return new DummyBrowserResult(false, 1, 2);
    }

}

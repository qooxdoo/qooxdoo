package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.ResultType;
import net.jsunit.model.TestRunResult;
import net.jsunit.utility.XmlUtility;

import java.net.URL;

public class TestRunResultTest extends TestCase {
    private TestRunResult testRunResult;

    protected void setUp() throws Exception {
        super.setUp();
        testRunResult = new TestRunResult(new URL("http://www.example.com"));
    }

    public void testSuccess() throws Exception {
        testRunResult.addBrowserResult(successResult());
        testRunResult.addBrowserResult(successResult());
        assertTrue(testRunResult.wasSuccessful());
        assertEquals(0, testRunResult.getErrorCount());
        assertEquals(0, testRunResult.getFailureCount());
        assertFalse(testRunResult.wasUnresponsive());
    }

    public void testFailuresAndErrors() throws Exception {
        testRunResult.addBrowserResult(failureResult());
        assertFalse(testRunResult.wasSuccessful());
        assertEquals(0, testRunResult.getErrorCount());
        assertEquals(1, testRunResult.getFailureCount());

        testRunResult.addBrowserResult(failureResult());
        assertFalse(testRunResult.wasSuccessful());
        assertEquals(0, testRunResult.getErrorCount());
        assertEquals(2, testRunResult.getFailureCount());

        testRunResult.addBrowserResult(errorResult());
        assertFalse(testRunResult.wasSuccessful());
        assertEquals(1, testRunResult.getErrorCount());
        assertEquals(2, testRunResult.getFailureCount());
    }

    public void testAsXml() throws Exception {
        testRunResult.addBrowserResult(successResult());
        testRunResult.addBrowserResult(failureResult());
        testRunResult.addBrowserResult(errorResult());
        testRunResult.setOsString("my cool os");
        testRunResult.setIpAddress("127.0.0.1");
        testRunResult.setHostname("machine.example.com");
        testRunResult.setURL(new URL("http://www.example.com"));
        assertEquals(
                "<testRunResult type=\"ERROR\" url=\"http://www.example.com\">" +
                        "<properties>" +
                        "<property name=\"os\" value=\"my cool os\" />" +
                        "<property name=\"ipAddress\" value=\"127.0.0.1\" />" +
                        "<property name=\"hostname\" value=\"machine.example.com\" />" +
                        "</properties>" +
                        successResult().asXmlFragment() +
                        failureResult().asXmlFragment() +
                        errorResult().asXmlFragment() +
                        "</testRunResult>",
                XmlUtility.asString(testRunResult.asXml())
        );
    }

    public void testUnresponsive() throws Exception {
        testRunResult.setUnresponsive();
        assertTrue(testRunResult.wasUnresponsive());
        assertEquals(ResultType.UNRESPONSIVE, testRunResult.getResultType());
        assertEquals(
                "<testRunResult type=\"UNRESPONSIVE\" url=\"http://www.example.com\" />",
                XmlUtility.asString(testRunResult.asXml())
        );
    }

    public void testAsXmlWithNoUrl() throws Exception {
        TestRunResult result = new TestRunResult();
        assertEquals("<testRunResult type=\"SUCCESS\" />", XmlUtility.asString(result.asXml()));
    }

    private BrowserResult successResult() {
        BrowserResult browserResult = new BrowserResult();
        browserResult.setId("foo");
        return browserResult;
    }

    private BrowserResult failureResult() {
        DummyBrowserResult dummyBrowserResult = new DummyBrowserResult(false, 1, 0);
        dummyBrowserResult.setId("foo");
        return dummyBrowserResult;
    }

    private BrowserResult errorResult() {
        DummyBrowserResult dummyBrowserResult = new DummyBrowserResult(false, 0, 1);
        dummyBrowserResult.setId("foo");
        return dummyBrowserResult;
    }

}

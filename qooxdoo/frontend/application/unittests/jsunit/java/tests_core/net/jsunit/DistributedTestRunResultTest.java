package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.DistributedTestRunResult;
import net.jsunit.model.ResultType;
import net.jsunit.model.TestRunResult;
import net.jsunit.utility.XmlUtility;

import java.net.URL;

public class DistributedTestRunResultTest extends TestCase {

    public void testSimple() throws Exception {
        DistributedTestRunResult distributedResult = new DistributedTestRunResult();

        TestRunResult result1 = new TestRunResult();
        result1.addBrowserResult(successResult());
        result1.addBrowserResult(successResult());
        distributedResult.addTestRunResult(result1);

        assertEquals(ResultType.SUCCESS, distributedResult.getResultType());
        assertTrue(distributedResult.wasSuccessful());

        TestRunResult result2 = new TestRunResult();
        result2.addBrowserResult(failureResult());
        result2.addBrowserResult(errorResult());
        distributedResult.addTestRunResult(result2);

        assertEquals(ResultType.ERROR, distributedResult.getResultType());
        assertFalse(distributedResult.wasSuccessful());
        assertEquals(1, distributedResult.getFailureCount());
        assertEquals(1, distributedResult.getErrorCount());
    }

    public void testUnresponsiveRemoteURL() throws Exception {
        DistributedTestRunResult distributedResult = new DistributedTestRunResult();

        TestRunResult result1 = new TestRunResult();
        result1.addBrowserResult(successResult());
        result1.addBrowserResult(successResult());
        distributedResult.addTestRunResult(result1);

        TestRunResult result2 = new TestRunResult(new URL("http://my.domain.com:8201"));
        result2.setUnresponsive();
        distributedResult.addTestRunResult(result2);

        TestRunResult result3 = new TestRunResult(new URL("http://my.domain.com:8201"));
        result3.setUnresponsive();
        distributedResult.addTestRunResult(result3);

        assertEquals(ResultType.UNRESPONSIVE, distributedResult.getResultType());
    }

    public void testAsXml() throws Exception {
        DistributedTestRunResult distributedResult = new DistributedTestRunResult();

        TestRunResult result1 = new TestRunResult();
        result1.addBrowserResult(successResult());
        result1.addBrowserResult(successResult());
        distributedResult.addTestRunResult(result1);

        TestRunResult result2 = new TestRunResult();
        result2.addBrowserResult(failureResult());
        result2.addBrowserResult(errorResult());
        distributedResult.addTestRunResult(result2);

        TestRunResult result3 = new TestRunResult(new URL("http://my.domain.com:4732"));
        result3.setUnresponsive();
        distributedResult.addTestRunResult(result3);

        assertEquals(
                "<distributedTestRunResult type=\"UNRESPONSIVE\">" +
                        XmlUtility.asString(result1.asXml()) +
                        XmlUtility.asString(result2.asXml()) +
                        "<testRunResult type=\"UNRESPONSIVE\" url=\"http://my.domain.com:4732\" />" +
                        "</distributedTestRunResult>",
                XmlUtility.asString(distributedResult.asXml())
        );
    }

    private BrowserResult successResult() {
        return new BrowserResult();
    }

    private BrowserResult failureResult() {
        return new DummyBrowserResult(false, 1, 0);
    }

    private BrowserResult errorResult() {
        return new DummyBrowserResult(false, 0, 1);
    }

}

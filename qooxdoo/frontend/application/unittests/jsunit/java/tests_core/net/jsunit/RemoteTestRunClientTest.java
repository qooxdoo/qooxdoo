package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.DummyBrowserSource;
import net.jsunit.utility.XmlUtility;

public class RemoteTestRunClientTest extends TestCase {

    private MockTestRunListener listener;
    private RemoteTestRunClient client;

    public void setUp() throws Exception {
        super.setUp();
        listener = new MockTestRunListener();
        client = new RemoteTestRunClient(new DummyBrowserSource("mybrowser.exe", 3), listener, -1);
    }

    public void testTestRunStartedMessage() {
        client.messageReceived("testRunStarted");
        assertTrue(listener.testRunStartedCalled);
    }

    public void testTestRunFinishedMessage() {
        client.messageReceived("testRunFinished");
        assertTrue(listener.testRunFinishedCalled);
    }

    public void testBrowserTestRunStartedMessage() {
        client.messageReceived("browserTestRunStarted");
        client.messageReceived("3");
        assertTrue(listener.browserTestRunStartedCalled);
        assertEquals(new Browser("mybrowser.exe", 3), listener.browser);
    }

    public void testBrowserTestRunFinishedMessage() {
        BrowserResult result = new BrowserResult();
        result.setBaseURL("http://www.example.com");
        result.setId("1234329439824");
        result.setJsUnitVersion("905.43");
        result.setRemoteAddress("http://123.45.67.89");
        result.setTime(123.45);
        result.setUserAgent("my browser version 5.6");
        result.setTestCaseStrings(new String[]{"file:///dummy/path/dummyPage.html:testFoo|1.3|S||"});
        client.messageReceived("browserTestRunFinished");
        client.messageReceived("3");
        String xml = XmlUtility.asString(result.asXmlDocument());
        String[] lines = xml.split("\r\n");
        for (String line : lines)
            client.messageReceived(line);
        client.messageReceived("endXml");
        assertTrue(listener.browserTestRunFinishedCalled);
        assertEquals(new Browser("mybrowser.exe", 3), listener.browser);
        assertEquals(xml, XmlUtility.asString(listener.result.asXmlDocument()));
    }

}

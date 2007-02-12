package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.Browser;
import net.jsunit.utility.XmlUtility;

import java.util.ArrayList;
import java.util.List;

public class TestRunNotifierServerTest extends TestCase implements MessageReceiver {

    private TestRunNotifierServer server;
    private ClientSideConnection clientSideConnection;
    private List<String> messages = new ArrayList<String>();
    private MockBrowserTestRunner mockRunner;

    public void setUp() throws Exception {
        super.setUp();
        mockRunner = new MockBrowserTestRunner();
        server = new TestRunNotifierServer(mockRunner, 8083);
        clientSideConnection = new ClientSideConnection(this, 8083);
        new Thread() {
            public void run() {
                server.testRunStarted();
            }
        }.start();

        clientSideConnection.start();
        waitForServerConnectionToStartRunning();
    }

    public void testMessagesSentAsTestRunProceeds() throws InterruptedException {
        while (messages.size() < 1)
            Thread.sleep(10);

        assertEquals(1, messages.size());
        assertEquals("testRunStarted", messages.get(0));

        server.browserTestRunStarted(new Browser("mybrowser1.exe", 0));
        while (messages.size() < 3)
            Thread.sleep(10);

        assertEquals("browserTestRunStarted", messages.get(1));
        assertEquals("0", messages.get(2));

        DummyBrowserResult browserResult = new DummyBrowserResult(false, 2, 3);
        server.browserTestRunFinished(new Browser("mybrowser2.exe", 1), browserResult);
        while (messages.size() < 8)
            Thread.sleep(10);

        assertEquals("browserTestRunFinished", messages.get(3));
        assertEquals("1", messages.get(4));
        String line1 = messages.get(5);
        String line2 = messages.get(6);
        String line3 = messages.get(7);
        assertEquals(XmlUtility.asString(browserResult.asXmlDocument()), line1 + "\r\n" + line2 + "\r\n" + line3);

        assertEquals("endXml", messages.get(8));
    }

    public void testStopRunner() throws InterruptedException {
        assertFalse(mockRunner.disposeCalled);
        clientSideConnection.sendMessage("foo");
        assertFalse(mockRunner.disposeCalled);
        clientSideConnection.sendMessage("stop");
        while (!mockRunner.disposeCalled)
            Thread.sleep(10);
    }

    private void waitForServerConnectionToStartRunning() throws InterruptedException {
        while (!clientSideConnection.isRunning() || !server.isReady())
            Thread.sleep(10);
    }

    public void messageReceived(String message) {
        messages.add(message);
    }

    public void tearDown() throws Exception {
        server.testRunFinished();
        clientSideConnection.shutdown();
        super.tearDown();
    }
}

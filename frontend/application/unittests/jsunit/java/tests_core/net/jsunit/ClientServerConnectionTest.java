package net.jsunit;

import junit.framework.TestCase;

public class ClientServerConnectionTest extends TestCase {

    private ServerSideConnection serverSideConnection;
    private ClientSideConnection clientSideConnection;
    private MockMessageReceiver mockReceiver1;
    private MockMessageReceiver mockReceiver2;

    public void setUp() throws Exception {
        super.setUp();
        mockReceiver1 = new MockMessageReceiver();
        mockReceiver2 = new MockMessageReceiver();
        serverSideConnection = new ServerSideConnection(mockReceiver1, 8083);
        clientSideConnection = new ClientSideConnection(mockReceiver2, 8083);
        clientSideConnection.start();
        serverSideConnection.connect();

        while (!serverSideConnection.isConnected() || !clientSideConnection.isRunning())
            Thread.sleep(3);
    }

    public void tearDown() throws Exception {
        serverSideConnection.shutDown();
        clientSideConnection.shutdown();
        super.tearDown();
    }

    public void testSimple() throws InterruptedException {
        serverSideConnection.sendMessage("hello");
        while (mockReceiver2.message == null)
            Thread.sleep(3);
        assertEquals("hello", mockReceiver2.message);

        clientSideConnection.sendMessage("bonjour");
        while (mockReceiver1.message == null)
            Thread.sleep(3);
        assertEquals("bonjour", mockReceiver1.message);
    }

}

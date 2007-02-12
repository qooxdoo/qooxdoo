/**
 * 
 */
package net.jsunit;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class ClientSideConnection extends Thread {

    private MessageReceiver receiver;
    private final int port;
    private ServerSocket serverSocket;
    private Socket socket;
    private BufferedReader reader;
    private PrintWriter writer;
    private boolean running;

    public ClientSideConnection(MessageReceiver receiver, int port) {
        this.port = port;
        this.receiver = receiver;
    }

    public void run() {
        try {
            serverSocket = new ServerSocket(port);
            socket = serverSocket.accept();
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
            writer = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF-8"));
            String message;
            running = true;
            while (running && reader != null && (message = reader.readLine()) != null)
                receiver.messageReceived(message);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        shutdown();
    }

    public boolean isRunning() {
        return running;
    }

    public void shutdown() {
        try {
            if (serverSocket != null)
                serverSocket.close();
        } catch (IOException e) {
        }
        running = false;
    }

    public void sendMessage(String message) {
        writer.println(message);
        writer.flush();
    }

}
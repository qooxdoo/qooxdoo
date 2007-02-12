package net.jsunit;

import java.io.*;
import java.net.Socket;

public class ServerSideConnection {

    private int port;
    private Socket clientSocket;
    private PrintWriter writer;
    private String host = "localhost";
    private boolean isConnected;
    private final MessageReceiver receiver;
    private BufferedReader reader;

    public ServerSideConnection(MessageReceiver receiver, int port) {
        this.receiver = receiver;
        this.port = port;
    }

    public void connect() {
        for (int i = 1; i < 30; i++) {
            try {
                clientSocket = new Socket(host, port);
                writer = new PrintWriter(new OutputStreamWriter(clientSocket.getOutputStream(), "UTF-8"), false);
                reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream(), "UTF-8"));
                isConnected = true;
                new ReaderThread().start();
                return;
            } catch (IOException e1) {
                try {
                    Thread.sleep(250);
                } catch (InterruptedException e2) {
                }
            }
        }
        throw new RuntimeException("server could not connect");
    }

    public void shutDown() {
        if (writer != null) {
            writer.close();
            writer = null;
        }

        try {
            if (clientSocket != null) {
                clientSocket.close();
                clientSocket = null;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void sendMessage(String message) {
        writer.println(message);
        writer.flush();
    }

    public boolean isConnected() {
        return isConnected;
    }

    class ReaderThread extends Thread {
        public void run() {
            String message;
            try {
                while (isConnected && reader != null && (message = reader.readLine()) != null)
                    receiver.messageReceived(message);
            } catch (IOException e) {
            }

        }
    }

}

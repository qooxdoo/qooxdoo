/**
 * 
 */
package net.jsunit;

class MockMessageReceiver implements MessageReceiver {

    public String message;

    public void messageReceived(String message) {
        this.message = message;
    }

}
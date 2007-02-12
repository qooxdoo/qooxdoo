package net.jsunit;

public class InvalidBrowserIdException extends Throwable {
    public InvalidBrowserIdException(int invalidBrowserId) {
        super("Invalid browser ID: " + invalidBrowserId);
    }
}

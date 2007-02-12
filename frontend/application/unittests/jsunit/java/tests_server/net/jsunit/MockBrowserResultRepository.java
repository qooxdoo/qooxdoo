package net.jsunit;

import net.jsunit.logging.BrowserResultRepository;
import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public class MockBrowserResultRepository implements BrowserResultRepository {
    public BrowserResult storedResult;
    public String requestedId;
    public Browser requestedBrowser;

    public void store(BrowserResult result) {
        this.storedResult = result;
    }

    public BrowserResult retrieve(String id, Browser browser) {
        this.requestedId = id;
        this.requestedBrowser = browser;
        return null;
    }
}

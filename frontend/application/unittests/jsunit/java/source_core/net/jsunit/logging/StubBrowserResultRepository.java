package net.jsunit.logging;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public class StubBrowserResultRepository implements BrowserResultRepository {
    public void store(BrowserResult result) {
    }

    public BrowserResult retrieve(String id, Browser browser) {
        return null;
    }
}

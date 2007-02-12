package net.jsunit.logging;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;

public interface BrowserResultRepository {

    void store(BrowserResult result);

    BrowserResult retrieve(String id, Browser browser);

}

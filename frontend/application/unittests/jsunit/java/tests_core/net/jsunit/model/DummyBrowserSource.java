package net.jsunit.model;

public class DummyBrowserSource implements BrowserSource {

    private String fileName;
    private int id;

    public DummyBrowserSource(String fileName, int id) {
        this.fileName = fileName;
        this.id = id;
    }

    public Browser getBrowserById(int requestedId) {
        return requestedId == id ? new Browser(fileName, id) : null;
    }
}

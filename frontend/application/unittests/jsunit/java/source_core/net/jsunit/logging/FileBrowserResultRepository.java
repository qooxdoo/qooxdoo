package net.jsunit.logging;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserResult;
import net.jsunit.model.BrowserResultBuilder;
import net.jsunit.model.BrowserSource;
import net.jsunit.utility.FileUtility;
import net.jsunit.utility.XmlUtility;

import java.io.File;

public class FileBrowserResultRepository implements BrowserResultRepository {

    private static final String LOG_PREFIX = "JSTEST-";

    private File logsDirectory;

    public FileBrowserResultRepository(File logsDirectory) {
        this.logsDirectory = logsDirectory;
        if (!logsDirectory.exists())
            logsDirectory.mkdir();
    }

    private File logFileForId(String id, Browser browser) {
        return new File(logsDirectory + File.separator + LOG_PREFIX + id + "." + browser.getId() + ".xml");
    }

    public void deleteDirectory(String directoryName) {
        File file = new File(directoryName);
        file.delete();
    }

    public void store(BrowserResult result) {
        String xml = XmlUtility.asString(result.asXml());
        FileUtility.write(logFileForId(result.getId(), result.getBrowser()), xml);
    }

    public BrowserResult retrieve(String id, final Browser browser) {
        File logFile = logFileForId(id, browser);
        if (logFile.exists())
            return new BrowserResultBuilder(new BrowserSource() {
                public Browser getBrowserById(int id) {
                    return browser;
                }
            }).build(logFile);
        return null;
    }

}

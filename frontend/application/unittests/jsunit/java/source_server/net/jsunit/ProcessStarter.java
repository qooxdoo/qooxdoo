package net.jsunit;

import java.io.IOException;

public interface ProcessStarter {

    Process execute(String[] command) throws IOException;

}

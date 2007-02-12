package net.jsunit;

import java.io.IOException;

public class DefaultProcessStarter implements ProcessStarter {

    public Process execute(String[] command) throws IOException {
        return Runtime.getRuntime().exec(command);
    }

}

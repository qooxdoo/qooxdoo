package net.jsunit.utility;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class StreamUtility {

    public static String readAllFromStream(InputStream inputStream) throws IOException {
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        int aByte;
        while ((aByte = inputStream.read()) != -1)
            outStream.write(aByte);
        inputStream.close();
        return outStream.toString();

    }
}

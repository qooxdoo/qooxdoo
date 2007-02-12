package net.jsunit.utility;

import java.util.Arrays;
import java.util.List;

public class CollectionUtility {

    public static List listWith(Object object1, Object object2) {
        return Arrays.asList(new Object[]{object1, object2});
    }

}

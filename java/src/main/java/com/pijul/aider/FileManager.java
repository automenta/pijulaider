package com.pijul.aider;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FileManager {

    public List<String> listFiles(String path) throws IOException {
        try (Stream<Path> stream = Files.list(Paths.get(path))) {
            return stream.map(Path::toString).collect(Collectors.toList());
        }
    }

    public String readFile(String path) throws IOException {
        return new String(Files.readAllBytes(Paths.get(path)));
    }

    public void writeFile(String path, String content) throws IOException {
        Files.write(Paths.get(path), content.getBytes());
    }

    public void deleteFile(String path) throws IOException {
        Files.delete(Paths.get(path));
    }

    public void renameFile(String oldPath, String newPath) throws IOException {
        Files.move(Paths.get(oldPath), Paths.get(newPath));
    }
}

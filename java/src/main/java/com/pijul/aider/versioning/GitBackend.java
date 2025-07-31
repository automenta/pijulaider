package com.pijul.aider.versioning;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class GitBackend extends VersioningBackend {
    private final ExecutorService executor = Executors.newCachedThreadPool();

    private CompletableFuture<String> runCommand(String... command) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                ProcessBuilder processBuilder = new ProcessBuilder(command);
                processBuilder.redirectErrorStream(true);
                Process process = processBuilder.start();
                
                StringBuilder output = new StringBuilder();
                try (InputStream inputStream = process.getInputStream();
                     BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                }
                
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new RuntimeException("Command failed with exit code: " + exitCode);
                }
                
                return output.toString();
            } catch (IOException | InterruptedException e) {
                throw new RuntimeException("Error executing command: " + String.join(" ", command), e);
            }
        }, executor);
    }

    @Override
    public CompletableFuture<Void> add(String file) {
        return runCommand("git", "add", file).thenApply(s -> null);
    }

    @Override
    public CompletableFuture<Void> unstage(String file) {
        return runCommand("git", "reset", "HEAD", "--", file).thenApply(s -> null);
    }

    @Override
    public CompletableFuture<Void> record(String message) {
        return runCommand("git", "commit", "-m", message).thenApply(s -> null);
    }

    @Override
    public CompletableFuture<Void> unrecord(String hash) {
        return runCommand("git", "reset", "--soft", "HEAD~1").thenApply(s -> null);
    }

    @Override
    public CompletableFuture<Void> channel(String subcommand, String name) {
        return CompletableFuture.runAsync(() -> {
            try {
                if ("new".equals(subcommand)) {
                    runCommand("git", "checkout", "-b", name).get();
                } else if ("switch".equals(subcommand)) {
                    String branches = runCommand("git", "branch", "--list", name).get();
                    if (branches.trim().isEmpty()) {
                        runCommand("git", "checkout", "-b", name).get();
                    } else {
                        runCommand("git", "checkout", name).get();
                    }
                }
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        }, executor);
    }

    @Override
    public CompletableFuture<Void> patch(String subcommand, String name) {
        return CompletableFuture.runAsync(() -> {
            try {
                if ("list".equals(subcommand)) {
                    runCommand("git", "log", "--oneline").get();
                } else if ("apply".equals(subcommand)) {
                    String patch = runCommand("git", "show", name).get();
                    apply(patch).get();
                }
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        }, executor);
    }

    @Override
    public CompletableFuture<Void> apply(String patch) {
        return CompletableFuture.runAsync(() -> {
            try {
                // This would need a more robust implementation to pass patch content
                runCommand("git", "apply").get();
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException(e);
            }
        }, executor);
    }

    @Override
    public CompletableFuture<String> conflicts() {
        return runCommand("git", "status", "--porcelain").thenApply(output -> {
            List<String> conflicts = new ArrayList<>();
            for (String line : output.split("\n")) {
                if (line.startsWith("U")) {
                    String[] parts = line.split("\\s+");
                    if (parts.length > 1) {
                        conflicts.add(parts[1]);
                    }
                }
            }
            return conflicts.toString();
        });
    }

    @Override
    public CompletableFuture<Void> revert(String file) {
        return runCommand("git", "checkout", "HEAD", "--", file).thenApply(s -> null);
    }

    @Override
    public CompletableFuture<Void> undo() {
        return unrecord(null);
    }

    @Override
    public CompletableFuture<String> diff() {
        return runCommand("git", "diff");
    }

    @Override
    public CompletableFuture<Void> clear() {
        // Git doesn't have a direct equivalent of clear
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<List<String>> listTrackedFiles() {
        return runCommand("git", "ls-files").thenApply(output -> {
            List<String> files = new ArrayList<>();
            for (String line : output.split("\n")) {
                if (!line.trim().isEmpty()) {
                    files.add(line.trim());
                }
            }
            return files;
        });
    }

    @Override
    public CompletableFuture<List<String>> listUntrackedFiles() {
        return runCommand("git", "ls-files", "--others", "--exclude-standard").thenApply(output -> {
            List<String> files = new ArrayList<>();
            for (String line : output.split("\n")) {
                if (!line.trim().isEmpty()) {
                    files.add(line.trim());
                }
            }
            return files;
        });
    }
}
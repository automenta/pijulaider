package com.pijul.aider;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface Backend {
    CompletableFuture<Void> initialize();
    CompletableFuture<Void> shutdown();
    CompletableFuture<Void> record(String message);
    CompletableFuture<String> diff();
    CompletableFuture<Void> revert(String file);
    CompletableFuture<Void> revertAll();
    CompletableFuture<List<String>> listTrackedFiles();
    CompletableFuture<List<String>> listUntrackedFiles();
    CompletableFuture<Void> add(String file);
    CompletableFuture<String> status();
    CompletableFuture<Void> unrecord(String hash);
    CompletableFuture<String> conflicts();
    CompletableFuture<Void> channel(String subcommand, String name);
    CompletableFuture<Void> patch(String subcommand, String name);
    CompletableFuture<Void> apply(String patch);
    CompletableFuture<Void> clear();
}
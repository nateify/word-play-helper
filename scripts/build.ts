// Main build script that orchestrates compression and timestamp updating

import { compressWordList } from "./compress.ts";
import { updateTimestamp } from "./update-timestamp.ts";

async function build() {
    try {
        console.log("Starting build process...");

        // Step 1: Compress the word list
        await compressWordList();

        // Step 2: Update timestamp
        console.log("Updating timestamp...");
        updateTimestamp();

        console.log("Build completed successfully!");
    } catch (error) {
        console.error("Build failed:", error);
        process.exit(1);
    }
}

build();

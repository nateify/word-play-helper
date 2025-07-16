// Compress the word list for serving in browser

import { readFileSync, writeFileSync } from "fs";
import { gzipSync } from "zlib";
import { join } from "path";

async function compressWordList() {
    try {
        console.log("Reading word list...");
        const inputFile = join("data", "wordsfullb.txt");
        const outputFile = join("data", "wordsfullb.txt.gz");
        const originalData = readFileSync(inputFile, "utf8");
        console.log(`Original file size: ${originalData.length} bytes`);

        const compressed = gzipSync(originalData, { level: 9 }); // Max compression
        writeFileSync(outputFile, compressed);

        console.log(`Compressed file size: ${compressed.length} bytes`);
        console.log(
            `Compression ratio: ${(
                (1 - compressed.length / originalData.length) *
                100
            ).toFixed(1)}%`
        );
        console.log(`Compressed file saved as: ${outputFile}`);
    } catch (error) {
        console.error("Error compressing word list:", error);
        process.exit(1);
    }
}

compressWordList();

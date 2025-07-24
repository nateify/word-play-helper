import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export function updateTimestamp() {
    const htmlFilePath = join(process.cwd(), "index.html");

    try {
        // Use current date instead of git commit date
        const currentDate = new Date();

        // Format the date as "Month Day, Year" (e.g., "June 7, 2024")
        const formattedDate = currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        let htmlContent = readFileSync(htmlFilePath, "utf8");
        const regex = /(<span id="lastUpdatedTimestamp">)(.*?)(<\/span>)/;

        if (htmlContent.match(regex)) {
            htmlContent = htmlContent.replace(regex, `$1${formattedDate}$3`);
            writeFileSync(htmlFilePath, htmlContent, "utf8");
            console.log(
                `Successfully updated timestamp in index.html to: ${formattedDate}`
            );
        } else {
            console.warn(
                'Warning: Could not find <span id="lastUpdatedTimestamp"> in index.html. Timestamp not updated.'
            );
        }
    } catch (error) {
        console.error(`Error updating timestamp: ${error.message}`);
    }
}

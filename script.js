class WordPlayHelper {
    constructor() {
        this.wordList = [];
        this.letterGrid = [];
        this.isLoading = false;

        this.initializeGrid();
        this.attachEventListeners();
        this.loadWordList();
    }

    initializeGrid() {
        const gridContainer = document.getElementById("letterGrid");

        // Create 4x4 grid of input fields
        for (let i = 0; i < 16; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.className = "letter-input";
            input.maxLength = 1;
            input.dataset.index = i;

            // Add input event listener for auto-advance
            input.addEventListener("input", (e) => {
                e.target.value = e.target.value.toUpperCase();
                this.handleLetterInput(e);
            });

            // Add keyboard navigation
            input.addEventListener("keydown", (e) => {
                this.handleKeyNavigation(e);
            });

            gridContainer.appendChild(input);
        }
    }

    handleLetterInput(e) {
        const index = parseInt(e.target.dataset.index);
        const value = e.target.value;

        // Auto-advance to next input if letter is entered
        if (value && index < 15) {
            const nextInput = document.querySelector(
                `[data-index="${index + 1}"]`
            );
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    handleKeyNavigation(e) {
        const index = parseInt(e.target.dataset.index);
        const row = Math.floor(index / 4);
        const col = index % 4;

        let newIndex = index;

        switch (e.key) {
            case "ArrowUp":
                if (row > 0) newIndex = index - 4;
                break;
            case "ArrowDown":
                if (row < 3) newIndex = index + 4;
                break;
            case "ArrowLeft":
                if (col > 0) newIndex = index - 1;
                break;
            case "ArrowRight":
                if (col < 3) newIndex = index + 1;
                break;
            case "Backspace":
                if (!e.target.value && index > 0) {
                    newIndex = index - 1;
                }
                break;
            case "Enter":
                e.preventDefault();
                this.findWords();
                return;
            default:
                return;
        }

        if (newIndex !== index) {
            e.preventDefault();
            const targetInput = document.querySelector(
                `[data-index="${newIndex}"]`
            );
            if (targetInput) {
                targetInput.focus();
            }
        }
    }

    attachEventListeners() {
        document.getElementById("findWords").addEventListener("click", () => {
            this.findWords();
        });

        document.getElementById("clearGrid").addEventListener("click", () => {
            this.clearGrid();
        });
    }

    async loadWordList() {
        try {
            // Load compressed word list
            const response = await fetch("data/wordsfullb.txt.gz");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(
                `Loaded compressed data: ${response.headers.get(
                    "content-length"
                )} bytes`
            );

            // Decompress using browser's built-in DecompressionStream
            const decompressedStream = response.body.pipeThrough(
                new DecompressionStream("gzip")
            );

            // Read the decompressed data as text
            const decompressedResponse = new Response(decompressedStream);
            const decompressed = await decompressedResponse.text();

            this.wordList = decompressed
                .split("\n")
                .map((word) => word.trim().toUpperCase())
                .filter((word) => word.length > 0);

            console.log(`Loaded ${this.wordList.length} words`);
        } catch (error) {
            console.error("Error loading word list:", error);
            this.showError(
                "Failed to load word list. Please refresh the page."
            );
        }
    }

    getGridLetters() {
        const inputs = document.querySelectorAll(".letter-input");
        return Array.from(inputs)
            .map((input) => input.value.toUpperCase())
            .filter((letter) => letter);
    }

    clearGrid() {
        const inputs = document.querySelectorAll(".letter-input");
        inputs.forEach((input) => (input.value = ""));
        inputs[0].focus();
        this.clearResults();
    }

    clearResults() {
        const wordList = document.getElementById("wordList");
        const stats = document.getElementById("stats");
        wordList.innerHTML =
            '<p class="placeholder">Enter letters and click "Find Words" to see results</p>';
        stats.innerHTML = "";
    }

    showLoading() {
        const loading = document.getElementById("loading");
        const findBtn = document.getElementById("findWords");

        loading.style.display = "flex";
        findBtn.disabled = true;
        this.isLoading = true;
    }

    hideLoading() {
        const loading = document.getElementById("loading");
        const findBtn = document.getElementById("findWords");

        loading.style.display = "none";
        findBtn.disabled = false;
        this.isLoading = false;
    }

    showError(message) {
        const wordList = document.getElementById("wordList");
        wordList.innerHTML = `<p class="placeholder" style="color: var(--error);">${message}</p>`;
    }

    canFormWord(word, availableLetters) {
        const letterCount = {};

        // Count available letters
        for (const letter of availableLetters) {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        }

        // Check if word can be formed
        const wordLetters = {};
        for (const letter of word) {
            wordLetters[letter] = (wordLetters[letter] || 0) + 1;
        }

        for (const [letter, count] of Object.entries(wordLetters)) {
            if (!letterCount[letter] || letterCount[letter] < count) {
                return false;
            }
        }

        return true;
    }

    async findWords() {
        if (this.isLoading) return;

        const letters = this.getGridLetters();

        if (letters.length === 0) {
            this.showError("Please enter some letters first.");
            return;
        }

        if (this.wordList.length === 0) {
            this.showError(
                "Word list is still loading. Please wait and try again."
            );
            return;
        }

        this.showLoading();

        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
            try {
                const foundWords = this.wordList.filter((word) => {
                    return word.length >= 4 && this.canFormWord(word, letters);
                });

                // Sort by length (descending) then alphabetically
                foundWords.sort((a, b) => {
                    if (a.length !== b.length) {
                        return b.length - a.length;
                    }
                    return a.localeCompare(b);
                });

                this.displayResults(foundWords, letters);
                this.hideLoading();
            } catch (error) {
                console.error("Error finding words:", error);
                this.showError("An error occurred while finding words.");
                this.hideLoading();
            }
        }, 100);
    }

    displayResults(words, letters) {
        const wordList = document.getElementById("wordList");
        const stats = document.getElementById("stats");

        if (words.length === 0) {
            wordList.innerHTML =
                '<p class="placeholder">No words found with these letters.</p>';
            stats.innerHTML = "";
            return;
        }

        // Group words by length
        const wordsByLength = {};
        words.forEach((word) => {
            const length = word.length;
            if (!wordsByLength[length]) {
                wordsByLength[length] = [];
            }
            wordsByLength[length].push(word);
        });

        // Display stats
        const totalWords = words.length;
        const longestWord = words[0];
        const lettersUsed = letters.join("");

        stats.innerHTML = `
            <p>Found <strong>${totalWords}</strong> words using letters: <strong>${lettersUsed}</strong></p>
            <p>Longest word: <strong>${longestWord}</strong> (${longestWord.length} letters)</p>
        `;

        // Display words grouped by length
        let html = "";
        const lengths = Object.keys(wordsByLength)
            .map(Number)
            .sort((a, b) => b - a);

        lengths.forEach((length) => {
            const wordsForLength = wordsByLength[length];
            html += `
                <div class="word-group">
                    <h3>${length} letters <span class="word-count">${
                wordsForLength.length
            }</span></h3>
                    <div class="words">
                        ${wordsForLength
                            .map((word) => `<div class="word">${word}</div>`)
                            .join("")}
                    </div>
                </div>
            `;
        });

        wordList.innerHTML = html;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new WordPlayHelper();
});

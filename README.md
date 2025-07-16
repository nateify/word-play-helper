# Word Play Helper

Assistant and solver for the game "Word Play" by Game Maker's Toolkit.

## Disclaimer

This project is not affiliated with Game Maker's Toolkit!

## Current Fetures

- Input your current letter grid.
- Find all possible words with your current letters, sorted by length.

## Future Features

-   Trie for efficient word lookup (sorting by alphabetical).
-   Constraints on prefixes, suffixes, infixes.
-   Optimizer/solver (instead of just assistant/helper).
    -   Part 1: full-on optimizer by including score per tile and bonus scores.
    -   Part 2: include calculation using perks and such.

## Development

### Running & Hosting

Just a vanilla HTML/CSS/JS project. Locally you can use any simple server (i.e VSCode's Live Preview). It can be hosted on github pages or similar services.

### Compressing the word list

The raw word list is 2MB, so we compress it using gzip for use in the browser.

1. Extract the word list from the game

2. Save to the data folder

3. Compress the word list by running:

```bash
node data/compress.js
```

### Contributing

This is still very much a prototype, and I'm not sure what direction to take it. But if you have any ideas, feel free to leave an issue or a PR!

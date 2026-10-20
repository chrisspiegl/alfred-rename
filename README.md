# alfred-csv-transform

> [Alfred](https://alfredapp.com) workflow to transform CSV files between different delimiters (comma, semicolon, tab)

<img src="media/screenshot.png" style="width: 100%;">

Transform CSV files between comma-separated (`,`), semicolon-separated (`;`), and tab-separated (`\t`) formats with automatic delimiter detection.

## Install

```bash
npm install --global alfred-csv-transform
```

*Requires [Node.js](https://nodejs.org) 14+ and the Alfred [Powerpack](https://alfredapp.com/powerpack/).*

## Usage

* Select one or multiple CSV/TSV files in Finder
* Invoke Alfred File Browser and type the workflow keyword (usually `csvt` or similar)
* The workflow automatically detects the current delimiter in each file
* Choose where you want to convert TO (comma, semicolon, or tab-separated)
* Preview the output filenames by pressing <kbd>Enter</kbd>
* To actually perform the conversion, hold <kbd>Command</kbd> and press <kbd>Enter</kbd>

## Conversion Options

The workflow provides 3 simple conversion modes:

- **Convert to Comma-separated**: Transform any delimiter to comma-separated (`.csv` extension)
- **Convert to Semicolon-separated**: Transform any delimiter to semicolon-separated (`.csv` extension)
- **Convert to Tab-separated**: Transform any delimiter to tab-separated (`.tsv` extension)

## Output Format

Converted files are saved with the naming pattern: `{ORIGINAL_FILENAME}.{MODE}.{extension}`

Where MODE is the target delimiter: `comma`, `semicolon`, or `tab`

For example:
- `data.csv` (any delimiter) → `data.comma.csv` (comma-separated)
- `data.csv` (any delimiter) → `data.semicolon.csv` (semicolon-separated)
- `data.csv` (any delimiter) → `data.tab.tsv` (tab-separated)

## Features

- **Automatic Delimiter Detection**: Analyzes the first 1024 characters to detect the current delimiter
- **Smart Conversion**: Intelligently converts FROM any detected delimiter TO your chosen target
- **Batch Processing**: Convert multiple files at once
- **Header Preservation**: Maintains CSV headers during conversion
- **Safe Preview**: Preview output filenames before applying changes
- **Error Handling**: Robust error handling with clear feedback

## Related

* [More Alfred Workflows](https://github.com/chrisspiegl/alfred-workflows) - My Alfred Workflow Directory
* [alfy](https://github.com/sindresorhus/alfy) - Create Alfred workflows with ease

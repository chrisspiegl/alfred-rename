# alfred-rename

> [Alfred](https://alfredapp.com) workflow to rename files and folders via your clipboard

Add prefix, postfix, and replace `{replace}` strings inside of file and folder names easily.

## Install

```bash
npm install --global alfred-rename
```

Requires [Alfred](https://alfredapp.com) 5 with the [Powerpack](https://alfredapp.com/powerpack/) and [Node.js](https://nodejs.org) 20+ (verified on 24).

## Usage

*Careful: the file rename actions can not be reversed!*

If you want to test if you like the result of the workflow, duplicate the files and folders!

* Copy a simple text (one line only) into the clipboard
* Invoke the Alfred File Browser on one or multiple files / folders
* Select `Rename File(s) via Clipboard` action and hit <kbd>Enter</kbd>
* You will be presented with multiple options to place your clipboard content
* When hitting <kbd>Enter</kbd> you will copy the new file names into clipboard
  * This is for the purpose of previewing the change.
  * To then actually do the change, you will have to copy your initial text element again…
* To actually make the rename happen, hold down <kbd>Command</kbd> and hit <kbd>Enter</kbd>
  * The files will be renamed based on your selection
  * Alfred shows a success notification only when a file or folder was renamed

### Replace Variable

If you are using a lot of template files and you would like to place a certain text element into them, you can do the following:

* Create your files
* Put `{replace}` into the filename at the place where you want the other text to go
* Now copy something into your clipboard (like a project name)
* Select the files, and run the `Rename File(s) via Clipboard` action
* Then select the `Replace Variable with Clipboard` action
* Hold down <kbd>Command</kbd> and hit <kbd>Enter</kbd> to replace the variable in the selected files

## Development

```bash
pnpm install
pnpm lint
pnpm test
pnpm release
```

## Release

From a clean `main` checkout, `pnpm release` prompts for the version, publishes to npm with pnpm, and creates the GitHub release. Requires npm login and a GitHub token (`GITHUB_TOKEN`) or `gh` auth.

## Related

* [More Alfred Workflows](https://github.com/chrisspiegl/alfred-workflows) - My Alfred Workflow Directory
* [alfy](https://github.com/sindresorhus/alfy) - Create Alfred workflows with ease

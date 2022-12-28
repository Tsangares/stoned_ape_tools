# Development

We're excited that  you're interested in contributing code to
the extension! Read on to find out how to do so.

## Goals

Extension development is normally a simple thing in a single giant
javascript file. In our case, however, we want it to be easy for a
small group of contributors to add whatever features they want
without necessarily forcing every user to load or use every feature
and with isolation so that bugs in one developer's feature can't
damage other parts of the extension.

So the goals of the development tooling are:

- allow independent contributions that are orthogonal
- provide testing and type safety to minimize bugs
- enable user configuration of what parts of the code are active
- provide a fast and easy to understand development environment

## Setup

We use npm to configure the development environment, which enables
easy access to the best in class typescript and javascript development
tools. You'll need to have installed a 
[recent version of npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
for these instructions to work. Check that you have it by running

```
npm --version
```

You'll also need to have a recent 
[version of git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). 
Check for it with

```
git --version
```

Start by forking this repository on github. Then:

```
git clone git@github.com/<username>/stoned_ape_tools.git
```

where `<username>` is the user you used to create your fork.

Before you can build for the first time, you will need to 
use `npm` to install all the development tools, like so:

```
cd stoned_ape_tools
npm install
```

## Development

To develop chrome extensions, you need to have a directory with all
the files that would ship to Chrome in it. The command

```
npm run start
```

will create a new directory named `dist` which contains the Chrome
extension. Then, in Chrome, visit `chrome://extensions`, and turn
on "developer mode". Finally, use the "Load Unpacked Extension"
folder to load your freshly built extension by opening the `dist`
directory that was created by the build process.

On some versions of windows `npm run start` will give an error about
script execution being disabled. [This article](https://bobbyhadz.com/blog/nodemon-cannot-be-loaded-running-scripts-disabled) shows how to fix
it, and [this page from Microsoft](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.3) may also be useful.

You'll notice that `npm run start` never exits. It watches your
filesystem for changes to the source code, which you can make in
any editor you like. Each time you save a file, the system will
immediately rebuild your extension for you. Then, go back to
`chrome://extensions` and hit "Reload" in order to reload the
extension, and go to your instance of Neptune's Pride and 
reload. Your new code is now running!

## Debugging

In the Neptune's Pride tab, right click on anything that's not the
map - for example on the menu in the top right - and choose `Inspect`
from the bottom of the menu. This brings up the rather intimidating
looking dev tools panel.

Fear not, you need to know only one thing to get around in dev
tools, and that's how to search: use Control-Shift-F (Command-Option-F
on MacOS) to bring up the search panel, and type the name of a
variable or function. Click on a line from the search results in
order to open up that source file.

If you click on a line number on the left that will set a breakpoint.
Then you can take an action in the UI and your breakpoint will pop
up enabling you to debug your code.

Console logs appear in the console tab. `console.error` calls appear
both in the console tab and associated with the extension in the
chrome://extensions view (useful if you are trying to see if one of
your users hit an error that you log with `console.error` as it
persists even after the web page tab is closed). 

### Example Debug Session

Suppose you want to debug the autocomplete code. The feature triggers
when the user types [[#] into a message. Inspect the page, and use
the hotkey to search for autocomplete.

In the code, find the line that looks like

```
                        var puid = Number(autoString);
```

and put a breakpoint on that line by clicking to its left. Open a new
message in the game, and type [[0] to see the debugger pop up on the
autocomplete code. The screen should look something like this:

![Development](pictures/devscreenshot.png?raw=true)

You can step along or hit the continue button to see autocomplete in
action.

## Unit tests

Unit tests can be added in `tests/<filename>.spec.ts` and will be
automatically executed as part of precommit checks. It's good
practice to set up so that tests are executed as you type and you
can also run them from the command line any time with:
```
npm run test
```
### Unit tests in vscode

In `vscode` there are two ways to run unit tests for the project,
the fast way and the slow way.

The slow way is to leverage the CLI's `vitest` approach by installing
a `vitest` plugin. Once installed, in the experiment beaker view in
`vscode` you should see the tree of tests and be able to hover to
reveal buttons and run tests:

![vitest](pictures/vscode_vitest.png?raw=true)

The fast way is to install the`Wallaby.js` extension and set it up
with an OSS license. Then, in `vscode` when you start wallaby there
will be live display of coverage and testing status on every line.

A working state shows green boxes in the gutter like this:

![wallabytest](pictures/vscode_wallabyspec.png?raw=true)

and in the source itself:

![wallabytest](pictures/vscode_wallabyhotkey.png?raw=true)

As you type these boxes will update live. A pink box means that
line of code is on the path of a failing test, and you can use
wallaby to immediately jump to the line of the failing `expect`.


## Documentation

Markdown is the preferred format for documents (like this one, for
example) and if you're working at the command line a tool like `glow`
makes for easy checking that your documentation looks correct when
formatted. Or, use an editor like `vscode` so that you can live
preview your markdown in Chromium.

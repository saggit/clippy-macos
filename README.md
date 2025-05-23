# Clippy

Yes, Clippy from Microsoft Office is back — on macOS!
Clippy can be moved around (drag with mouse) and be animated (right-click).

![Alt Text](demo.gif)

--- 

## First start

1. [Download Clippy for macOS](https://downloadmacos.com/macshare.php?call=clippy) or build from source.
2. Run
3. Click `📎` → `Show in Finder` in the menu bar
4. Unzip all files
5. Click `📎` → `Reload`
6. Pick an Agent under `📎` → `Agents` → `…`

## Build

```sh
git clone https://github.com/saggit/clippy-macos.git
```

* Open project with Xcode
* Build and run the macOS target


## Add other Agents (optional)

An `*.acs` file includes all required resources (bitmaps, sounds, definitions, etc.) of an agent.
Unfortunately, this project does not support `*.acs` files, yet. But hopefully in the future — pull-requests are welcome.
 
Until then, you can convert `*.acs` files with the "[MSAgent Decompiler](http://www.lebeausoftware.org/software/decompile.aspx)" by  Lebeau Software.
This software extracts all resources that we need, from an `*.acs`.
There are a few steps involved.

### Requirements

```
brew install imagemagick
```
Will be used to merge single `*.bmp` sprites into a single 32 bit PNG-file. 

```
brew install ffmpeg
```
Will be used to convert `*.wav`-files in RIFF format to MP3 files.

### Conversion

Included in this project is a converter called `agent-converter.sh`.
This tool takes opaque BMP sprites, removes background colors, puts them together to one big transparent PNG file and converts all sounds to MP3. 

`./agent-convert.sh PATH_TO_AGENT NEW_NAME`

`AGENT_PATH` path to decompiled agent directory.
`NEW_NAME` should only include lowercase letters.

#### Example

`./agent-convert agents/CLIPPIT clippy`

### Final step

After the conversion step, you will get a new folder called `NEW_NAME.agent`.

1. Click `📎` → `Show in Finder` in the menu bar.
2. Move it to the Agents directory.
3. Click `📎` → `Reload`
4. Select new Agent under `📎` → `Agents` → `…`

## Clippy: The Unauthorized Biography

Watch the Unauthorized Biography with [Steven Sinofsky](https://twitter.com/stevesi), if you're interested in Clippy's history!

[![Clippy: The Unauthorized Biography](https://img.youtube.com/vi/8bhjNvSSuLM/0.jpg)](https://www.youtube.com/watch?v=8bhjNvSSuLM)

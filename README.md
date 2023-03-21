# Open-TV

Simple & fast IPTV app made with Electron and Angular

![alt text](https://github.com/Fredolx/open-tv/blob/main/demo.png)

## Features

- Super fast
- M3U file and link support
- Easy to use
- Recording & favorites
- Fully customizable player through mpv conf

## Planned features

- Xtream support
- Providing better support for bad streams (proxying the source and relaying to mpv)
- Publishing on Flathub

## Prerequisites
The app both depends on mpv and ffmpeg. ffmpeg is a depedency of mpv on all package managers. On Fedora you will need to add rpmfusion.
```
sudo dnf install mpv #Fedora
sudo pacman -Syu mpv #Arch
sudo apt install mpv #Debian/Ubuntu
scoop install mpv # Windows
choco install mpv # Windows alternative
```
The .deb package should include mpv as a dependency but [due to a bug in electron forge it's not working](https://github.com/electron/forge/issues/3127). So install it manually alongside ffmpeg if you want full functionality on Ubuntu/Debian.

## Contribute
Submit a PR anytime if you find something to improve. There may also be some suggestions in the issues. I'm not the most expert Javascript/NodeJS guy so you will certainly find some little things to fix.

## Install
You can install the latest version from [Releases](https://github.com/Fredolx/open-tv/releases/)







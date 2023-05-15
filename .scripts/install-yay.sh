#!/bin/bash

git clone https://aur.archlinux.org/yay.git ~/yay
cd ~/yay
makepkg -si

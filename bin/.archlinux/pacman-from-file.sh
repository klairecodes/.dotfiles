#!/bin/bash

pacman -S $(cat pacman-packages.txt | cut -d' ' -f1)

#!/bin/bash

pacman -S $(cat yourfilename | cut -d' ' -f1)

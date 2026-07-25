#!/bin/bash

mkdir -p ~/.ssh
touch ~/.ssh/authorized_keys
touch ~/.ssh/known_hosts
touch ~/.ssh/config

chmod 0700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/known_hosts
chmod 600 ~/.ssh/config


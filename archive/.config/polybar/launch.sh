#!/usr/bin/env bash

# Terminate already running bar instances
killall -q polybar
# If all your bars have ipc enabled, you can also use 
# polybar-msg cmd quit

# Launch draculabar
echo "---" | tee -a /tmp/draculabar.log 
polybar draculabar >>/tmp/draculabar.log 2>&1 &

echo "Bars launched..."

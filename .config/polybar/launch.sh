#!/usr/bin/env bash

# Terminate already running bar instances
killall -q polybar
# If all your bars have ipc enabled, you can also use 
# polybar-msg cmd quit

# Multiple Monitors
if type "xrandr"; then
  for m in $(xrandr --query | grep " connected" | cut -d" " -f1); do
    MONITOR=$m polybar --reload draculabar &
  done
else
  polybar --reload draculabar &
fi

# Launch draculabar
echo "---" | tee -a /tmp/draculabar.log 
#polybar draculabar >>/tmp/draculabar.log 2>&1 &

echo "Bars launched..."

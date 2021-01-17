#!/usr/bin/env bash

# Terminate already running bar instances
killall -q polybar
# If all your bars have ipc enabled, you can also use 
# polybar-msg cmd quit

# Launch draculabar
#echo "---" | tee -a /tmp/draculabar.log 
#polybar draculabar >>/tmp/draculabar.log 2>&1 &

if type "xrandr"; then
  for m in $(xrandr --query | grep " connected" | cut -d" " -f1); do
    MONITOR=$m polybar draculabar >>/tmp/draculabar.log 2>&1 &  
  done
else
  polybar draculabar >>/tmp/draculabar.log 2>&1 &
fi

echo "Bars launched..."

# Stops GTK applications from taking forever to open the first time
#. /etc/X11/Xsession

# Changing Caps Lock to backspace
xmodmap -e "clear lock" # Disable caps lock switch
xmodmap -e "clear control"
xmodmap -e "keycode 66 = Control_L"
xmodmap -e "add control = Control_L Control_R"
#xmodmap -e "keysym Caps_Lock = Control_L" # Set caps lock as L-Ctrl

# Change keypress repeat delay and rate
xset r rate 300 60

# Set Thinkpad TrackPoint sensitivity
xinput set-prop "TPPS/2 IBM TrackPoint" "libinput Accel Speed" 1.0

# Manage resources for GTK and other GUI applications
if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

# Merge .Xresources
[[ -f ~/.Xresources ]] && xrdb -merge -I$HOME ~/.Xresources

# Source .xprofile
[ -f /etc/xprofile ] && . /etc/xprofile
[ -f ~/.xprofile ] && . ~/.xprofile

# Start fcron for cron jobs
fcron

# Start i3 wm
exec i3

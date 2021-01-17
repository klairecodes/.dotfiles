# Set default screen layout
$HOME/.screenlayout/default-layout.sh
# Changing Caps Lock to backspace
xmodmap -e "clear lock" # Disable caps lock switch
xmodmap -e "keysym Caps_Lock = Escape" # Set caps lock as escape

# Change keypress repeat delay and rate
xset r rate 300 60

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

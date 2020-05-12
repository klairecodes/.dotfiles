# Changing Caps Lock to backspace
xmodmap -e "clear lock" #disable caps lock switch
xmodmap -e "keysym Caps_Lock = Escape" # set caps lock as escape

# Start xbindkeys, adding keyboard shortcuts, vol/brightness control, etc
xbindkeys

setxkbdmap -option caps:escape

# Start redshift
redshift &

# Set layout of dual monitors
/home/klaus/.screenlayout/desktopDualScreens.sh

# Manage resources for GTK and other GUI applications
if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

# Start i3 wm
exec i3
#exec gnome-session



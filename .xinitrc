# Changing Caps Lock to backspace
xmodmap -e "clear lock" #disable caps lock switch
xmodmap -e "keysym Caps_Lock = Escape" # set caps lock as escape

# Start xbindkeys, adding keyboard shortcuts, vol/brightness control, etc
xbindkeys

# Start redshift
exec redshift &

# Set layout of dual monitors
/home/klaus/.screenlayout/desktopDualScreens.sh

# Start i3 wm
exec i3



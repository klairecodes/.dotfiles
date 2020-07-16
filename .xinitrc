# Changing Caps Lock to backspace
xmodmap -e "clear lock" #disable caps lock switch
xmodmap -e "keysym Caps_Lock = Escape" # set caps lock as escape

# Start xbindkeys, adding keyboard shortcuts, vol/brightness control, etc
xbindkeys

# Change keypress repeat delay and rate
xset r rate 300 60

# Start redshift
redshift &

# Start pulseaudio tray applet
pa-applet &

# Start blueman bluetooth applet
blueman-applet &

# Start screenshot utility
flameshot &

# Set wallpaper
feh --bg-scale ~/Pictures/Wallpapers/arch_wallpaper_blk.png

# Manage resources for GTK and other GUI applications
if [ -d /etc/X11/xinit/xinitrc.d ]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [ -x "$f" ] && . "$f"
  done
  unset f
fi

# Start i3 wm
exec i3

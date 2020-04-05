# Changing Caps Lock to backspace
xmodmap -e "clear lock" #disable caps lock switch
xmodmap -e "keysym Caps_Lock = Escape" # set caps lock as escape

# Start xbindkeys, adding keyboard shortcuts, vol/brightness control, etc
xbindkeys

# Change keypress repeat delay and rate
xset r rate 300 60

# Start redshift
exec redshift &

# Start i3 wm and set wallpaper
feh --bg-scale ~/Pictures/Wallpapers/arch_wallpaper_blk.png
exec i3

# Start pulseaudio tray applet
exec pa-applet



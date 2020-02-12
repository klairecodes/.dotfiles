#
# ~/.bashrc
#



# If not running interactively, don't do anything
[[ $- != *i* ]] && return

export EDITOR='vim'
export VISUAL='vim'

# Custom commands
alias ls='ls --color=auto'
alias ls.='ls -a --color=auto'
alias klock='i3lock -i ~/Pictures/Wallpapers/arch_wallpaper_blk_red.png'
alias please='sudo !!'
alias bear='klock && systemctl hibernate && exit'
alias lk='klock && exit'

PS1='[\u@\h \W]\$ '

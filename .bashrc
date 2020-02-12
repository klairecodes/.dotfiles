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
alias klock='i3lock -i ~/Pictures/arch_wallpaper_blk.png ~/Pictures/arch_wallpaper_blk.png'
alias please='sudo !!'

PS1='[\u@\h \W]\$ '

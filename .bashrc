#
# Klaire's ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

export EDITOR='vim'
export VISUAL='vim'

# Custom commands
alias ls='ls -a --color=auto'
alias please='sudo !!'

PS1='[\u@\h \W]\$ '
. "$HOME/.cargo/env"

[ -f ~/.fzf.bash ] && source ~/.fzf.bash

#
# ~/.bash_profile
#

[[ -f ~/.bashrc ]] && . ~/.bashrc
[[ -f ~/.profile ]] && . ~/.profile

# Function that changes into a directory that a symlink points to 
function cdl { local dir=$(readlink -e $1); [[ -n "$dir" ]] && cd $dir; }

. "$HOME/.cargo/env"

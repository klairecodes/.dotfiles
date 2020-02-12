#
# ~/.bash_profile
#

[[ -f ~/.bashrc ]] && . ~/.bashrc

# Function that changes into a directory that a symlink points to 
function cdl { local dir=$(readlink -e $1); [[ -n "$dir" ]] && cd $dir; }

export PATH="$HOME/.cargo/bin:$PATH"

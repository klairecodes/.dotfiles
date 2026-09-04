#
# Klaire's .zshrc
#

# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
 if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
   source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
 fi

export PATH=$PATH:$HOME/bin:/usr/local/bin:$HOME/go/bin:/home/klaire/src/kubernetes/third_party/etcd:/usr/local/go/bin:$HOME/.cargo/env:$HOME/.cargo/bin

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME="powerlevel10k/powerlevel10k"

# Uncomment the following line to display red dots whilst waiting for completion.
COMPLETION_WAITING_DOTS="true"

# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
plugins=(git kubectl)
source $ZSH/oh-my-zsh.sh

#
# User configuration
#
export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='vim'
else
  export EDITOR='vim'
fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Environment Variables
#export EDITOR='vi -e'
export EDITOR='vim'
export VISUAL='vim'
#
# export MANPATH="/usr/local/man:$MANPATH"
# Custom pager for 'man'
#export MANPAGER='nvim +Man!'

# Show hidden files in autocomplete
setopt globdots

# Aliases
alias ls='ls -Ah --color=auto'
alias please='sudo !!'
alias cf='setfont /usr/share/kbd/consolefonts/ter-124b.psf.gz' # Set Linux console font
alias e='exit'
alias keyrateg='xset r rate 660 25'
alias keyrate='xset r rate 300 60'
alias gccc='gcc -std=c99 -Wall -Wextra -pedantic -ggdb' # CS243 default compilation flags
alias digpub='dig +short myip.opendns.com @resolver1.opendns.com' # Quickly get public IP
alias bctl='bluetoothctl'
alias butane='podman run --rm --interactive       \
              --security-opt label=disable        \
              --volume ${PWD}:/pwd --workdir /pwd \
              quay.io/coreos/butane:release'
alias coreos-installer='podman run --pull=always            \
                        --rm --interactive                  \
                        --security-opt label=disable        \
                        --volume ${PWD}:/pwd --workdir /pwd \
                        quay.io/coreos/coreos-installer:release'

alias ignition-validate='podman run --rm --interactive       \
                         --security-opt label=disable        \
                         --volume ${PWD}:/pwd --workdir /pwd \
                         quay.io/coreos/ignition-validate:release'
alias tms='tmux new-session -s'
# pacman/aur 
alias ua-drop-caches='sudo paccache -rk3; yay -Sc --aur --noconfirm'
alias ua-update-all='export TMPFILE="$(mktemp)"; \
    sudo true; \
    rate-mirrors --save=$TMPFILE arch --max-delay=21600 \
      && sudo mv /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist-backup \
      && sudo mv $TMPFILE /etc/pacman.d/mirrorlist \
      && ua-drop-caches \
      && yay -Syyu --noconfirm'
# Clipboard
alias c='xclip'
alias cs='xclip -selection clipboard'
alias v='xclip -o'
alias kubens='kubectl config set-context --current --namespace '
alias kubectx='kubectl config use-context '
alias kgpk='kubectl get pods --all-namespaces --field-selector metadata.namespace!=kube-system'
alias lsk='ls -1'
# NV
alias gp='globalprotect connect --portal nvidia.gpcloudservice.com'
alias pretty="grep -v I0421 | jq -r '[.level, .ts, .controller, .msg] | join(\" | \")'"
alias prettyjson="grep -v I0421 | jq"
alias watchs='watch -wcd -n 1 kubectl get pods --all-namespaces --field-selector metadata.namespace!=kube-system,metadata.namespace!=cert-manager,metadata.namespace!=local-path-storage'
alias nvims='nvim -S Session.vim'

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

# Set CDPATH only for interactive shells.
if test “${PS1+set}”; then
    CDPATH=.:~:~/Dropbox/:
fi

# Keychain SSH & GPG key manager
# eval $(keychain --eval --quiet ~/.ssh/id_ed25519 >& /dev/null)
# eval $(keychain --eval --quiet ~/.ssh/id_ed25519_sk >& /dev/null)
eval $(keychain --eval --quiet --noask --nogui --inherit any-once id_ed25519 >& /dev/null)

# pnpm
export PNPM_HOME="/home/klaire/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# ZVM Zsh Vi Mode plugin settings
# The plugin will auto execute this zvm_after_init function, overwrite zvm binding
function zvm_after_init() {
  source <(fzf --zsh)
}

# Readline vi bindings for zsh
bindkey -v

# ls command default directory colors
export LS_COLORS="rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=00:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.avif=01;35:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.webp=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:*~=00;90:*#=00;90:*.bak=00;90:*.crdownload=00;90:*.dpkg-dist=00;90:*.dpkg-new=00;90:*.dpkg-old=00;90:*.dpkg-tmp=00;90:*.old=00;90:*.orig=00;90:*.part=00;90:*.rej=00;90:*.rpmnew=00;90:*.rpmorig=00;90:*.rpmsave=00;90:*.swp=00;90:*.tmp=00;90:*.ucf-dist=00;90:*.ucf-new=00;90:*.ucf-old=00;90:"
LS_COLORS=$LS_COLORS:'di=0;35:' ; export LS_COLORS # color of directories

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

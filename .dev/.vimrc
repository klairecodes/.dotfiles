" Klaire's Vim Configuration File

" This line should not be removed as it ensures that various options are
" properly set to work with the Vim-related packages.
runtime! archlinux.vim

" Plugin settings
" -----------------------------------------------------------------------------
" Automatically install vim-plug plugin manager
let data_dir = has('nvim') ? stdpath('data') . '/site' : '~/.vim'
if empty(glob(data_dir . '/autoload/plug.vim'))
  silent execute '!curl -fLo '.data_dir.'/autoload/plug.vim --create-dirs  https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

" Vim-plug section
" -----------------------------------------------------------------------------
call plug#begin('~/.vim/plugged')

Plug 'vim-airline/vim-airline' " statusline
Plug 'vim-airline/vim-airline-themes' " statusline
Plug 'edkolev/tmuxline.vim' " statusline integration with tmux
Plug 'scrooloose/nerdcommenter' " easier commenting
Plug 'scrooloose/nerdtree' " file explorer
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } } " fuzzy finder
Plug 'junegunn/fzf.vim'
Plug 'tpope/vim-fugitive' " integrated Git
Plug 'tpope/vim-surround' " quick character surround modification
Plug 'airblade/vim-gitgutter' " git diff in sign column
"Plug 'vim-scripts/DoxygenToolkit.vim' " rapid Doxygen commenting
Plug 'ap/vim-css-color' " view css hex colors in vim
"Plug 'gcmt/taboo.vim' " rename tabs easily
Plug 'mtth/scratch.vim' " quick scratch buffer
Plug 'lervag/vimtex' " LaTeX live preview
"Plug 'michaelb/sniprun', {'do': 'sh install.sh'} " Run code and snippets
Plug 'stevearc/overseer.nvim' " Run code, Task Runner
Plug 'mbbill/undotree' " Undo tree and visualizer
Plug 'junegunn/goyo.vim' " Distraction-free writing
Plug 'junegunn/limelight.vim' " Fancy content-aware dimming

" Colorschemes
Plug 'dracula/vim', {'as': 'dracula'}
Plug 'arcticicestudio/nord-vim'
Plug 'fneu/breezy'
Plug 'jeffkreeftmeijer/vim-dim', {'as': 'dim'}
Plug 'noahfrederick/vim-noctu', {'as': 'vim-noctu'}
Plug 'sstallion/vim-wtf', {'as': 'vim-wtf'}

" React/Typescript
" https://thoughtbot.com/blog/modern-typescript-and-react-development-in-vim
Plug 'pangloss/vim-javascript'
Plug 'HerringtonDarkholme/yats.vim' "tsx dependency for syntax highlighting (place BEFORE typescript-vim)
Plug 'leafgarland/typescript-vim'
Plug 'MaxMEllon/vim-jsx-pretty' "js syntax highlighting
Plug 'yuezk/vim-js' "js dependency for syntax highlighting
Plug 'styled-components/vim-styled-components', { 'branch': 'main'}
Plug 'neoclide/coc.nvim', {'branch': 'release'}
let g:coc_global_extensions = [
  \ 'coc-tsserver',
  \ 'coc-prettier',
  \ 'coc-eslint'
  \ ]
Plug 'neoclide/coc-eslint'
Plug 'neoclide/coc-prettier'

" Kotlin
Plug 'udalov/kotlin-vim'

call plug#end()

" Plugin specific Settings
" -----------------------------------------------------------------------------
" airline
let g:airline_powerline_fonts = 1
let g:airline_theme='transparent'
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#formatter = 'unique_tail_improved'

" nerdcommenter
" Set a language to use its alternate delimiters by default
let g:NERDAltDelims_asm = 1

" JavaScript/TypeScript buffers
autocmd BufEnter *.{js,jsx,ts,tsx} :syntax sync fromstart
autocmd BufLeave *.{js,jsx,ts,tsx} :syntax sync clear

" neoclide/coc
" use <tab> to trigger completion and navigate to the next complete item
function! CheckBackspace() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" Having longer updatetime (default is 4000 ms = 4 s) leads to noticeable
" delays and poor user experience.
set updatetime=300

" GoTo code navigation.
nmap <silent> gd <Plug>(coc-definition)
nmap <silent> gy <Plug>(coc-type-definition)
nmap <silent> gi <Plug>(coc-implementation)
nmap <silent> gr <Plug>(coc-references)

" Use K to show documentation in preview window.
nnoremap <silent> K :call <SID>show_documentation()<CR>
function! s:show_documentation()
  if (index(['vim','help'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  elseif (coc#rpc#ready())
    call CocActionAsync('doHover')
  else
    execute '!' . &keywordprg . " " . expand('<cword>')
  endif
endfunction

" Use `[g` and `]g` to navigate diagnostics
" Use `:CocDiagnostics` to get all diagnostics of current buffer in location list
nmap <silent> [g <Plug>(coc-diagnostic-prev)
nmap <silent> ]g <Plug>(coc-diagnostic-next)

" Use Tab to cycle between completion options
inoremap <silent><expr> <Tab>
      \ coc#pum#visible() ? coc#pum#next(1) :
      \ CheckBackspace() ? "\<Tab>" :
      \ coc#refresh()
" Use Enter to confirm completion
inoremap <expr> <cr> coc#pum#visible() ? coc#pum#confirm() : "\<CR>"
"
" format file using Prettier
command! -nargs=0 Prettier :CocCommand prettier.forceFormatDocument


" gitgutter
" Sign column color matching
highlight! link SignColumn LineNr
let g:gitgutter_set_sign_backgrounds = 1

" VimTex
let g:vimtex_view_general_viewer = 'okular'

" GoYo/Limelight
"autocmd! User GoyoEnter Limelight
"autocmd! User GoyoLeave Limelight!

" Appearance
" -----------------------------------------------------------------------------
syntax on
set number
autocmd FileType asm setlocal colorcolumn=80
autocmd FileType c setlocal colorcolumn=80
" Show tabs
set listchars=tab:\|\
set list
colorscheme noctu

" Behavior
" -----------------------------------------------------------------------------
set tabstop=4
set shiftwidth=4
set expandtab
set softtabstop=4
set mouse=a
"gets rid of delay when exiting visual mode
set timeoutlen=1000 ttimeoutlen=0
set ignorecase
set smartcase
" set linebreak " breaks lines by word rather than character

autocmd FileType asm setlocal tabstop=8 softtabstop=8 shiftwidth=8 noexpandtab
autocmd FileType proto3 setlocal tabstop=2 softtabstop=2 shiftwidth=2
autocmd FileType proto setlocal tabstop=2 softtabstop=2 shiftwidth=2
autocmd FileType tex setlocal tabstop=2 softtabstop=2 shiftwidth=2
autocmd FileType cls setlocal tabstop=2 softtabstop=2 shiftwidth=2

" Persistent undofiles in a consistent directory
if !isdirectory($HOME."/.vim/undo-dir")
    call mkdir($HOME."/.vim/undo-dir", "", 0700)
endif
set undodir=~/.vim/undo-dir
set undofile
set undolevels=2000

" User Keybindings
" -----------------------------------------------------------------------------
" disable F1 help
:nmap <F1> <nop>
:imap <F1> <C-o> <nop>

" run makeprg
nnoremap <F5> :make!<cr>

" Use ALT+{h,j,k,l} to navigate windows from any mode (terminal nvim only)
:tnoremap <C-h> <C-\><C-N><C-w>h
:tnoremap <C-j> <C-\><C-N><C-w>j
:tnoremap <C-k> <C-\><C-N><C-w>k
:tnoremap <C-l> <C-\><C-N><C-w>l
:inoremap <C-h> <C-\><C-N><C-w>h
:inoremap <C-j> <C-\><C-N><C-w>j
:inoremap <C-k> <C-\><C-N><C-w>k
:inoremap <C-l> <C-\><C-N><C-w>l
:nnoremap <C-h> <C-w>h
:nnoremap <C-j> <C-w>j
:nnoremap <C-k> <C-w>k
:nnoremap <C-l> <C-w>l

if has("nvim")
:tnoremap <Esc> <C-\><C-n>
endif

" Copy selection to clipboard in visual mode
" Detect whether session is in X or Wayland (value present == Wayland)
if !empty($WAYLAND_DISPLAY)
    xnoremap <silent> <leader>y :w !wl-copy<CR><CR>
else
    xnoremap <silent> <leader>y "+y
endif


" CoC bindings
" Remap keys for applying code actions at the cursor position
nmap <leader>ac  <Plug>(coc-codeaction-cursor)
" Remap keys for apply code actions affect whole buffer
nmap <leader>as  <Plug>(coc-codeaction-source)
" Apply the most preferred quickfix action to fix diagnostic on the current line
nmap <leader>qf  <Plug>(coc-fix-current)

" User Commands
" -----------------------------------------------------------------------------
" write to file when forgot to sudo
cmap w!! w !sudo tee > /dev/null %

" Automatic indent for other file types
filetype plugin indent on

" Display current buffer number id
command! -nargs=0 B :echo "bufnr:" bufnr('%')

" Okular markdown file preview
if has('unix')
  command! -complete=shellcmd -nargs=1 -bang Silent execute ':silent !' . (<bang>0 ? 'nohup ' . <q-args> . '</dev/null >/dev/null 2>&1 &' : <q-args>) | execute ':redraw!'
elseif has('win32')
  command! -complete=shellcmd -nargs=1 -bang Silent execute ':silent !start ' . (<bang>0 ? '/b ' : '') . <q-args> | execute ':redraw!'
endif
command! OK Silent! okular %:S

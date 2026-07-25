" Klaire's Neovim Configuration File

" This line should not be removed as it ensures that various options are
" properly set to work with the Vim-related packages.
runtime! archlinux.vim
set encoding=utf8
set t_Co=256

" True color support (allegedly)
if has('nvim')
  set t_8f=[38;2;%lu;%lu;%lum
  set t_8b=[48;2;%lu;%lu;%lum
  "set termguicolors
endif

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

Plug 'scrooloose/nerdcommenter' " easier commenting
Plug 'scrooloose/nerdtree' " file explorer
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } } " fuzzy finder
Plug 'junegunn/fzf.vim'
Plug 'tpope/vim-fugitive' " integrated Git
Plug 'tpope/vim-surround' " quick character surround modification
Plug 'airblade/vim-gitgutter' " git diff in sign column
Plug 'ap/vim-css-color' " view css hex colors in vim
Plug 'mtth/scratch.vim' " quick scratch buffer
Plug 'stevearc/overseer.nvim' " Run code, Task Runner
Plug 'psliwka/vim-dirtytalk', { 'do': ':DirtytalkUpdate' } " Extended spell file
Plug 'yegappan/lsp'

" Colorscheme
Plug 'noahfrederick/vim-noctu', {'as': 'vim-noctu'}
Plug 'catppuccin/vim', { 'as': 'catppuccin' }

call plug#end()

" Plugin specific Settings
" -----------------------------------------------------------------------------
" nerdcommenter
" Set a language to use its alternate delimiters by default
let g:NERDAltDelims_asm = 1

" neoclide/coc
" use <tab> to trigger completion and navigate to the next complete item
function! CheckBackspace() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" Having longer updatetime (default is 4000 ms = 4 s) leads to noticeable
" delays and poor user experience.
set updatetime=300

" yegappan/lsp
let lspOpts = #{autoHighlightDiags: v:true}
autocmd User LspSetup call LspOptionsSet(lspOpts)

let lspServers = [#{
	\	  name: 'clang',
	\	  filetype: ['c', 'cpp'],
	\	  path: '/usr/bin/clangd',
	\	  args: ['--background-index']
	\ }]
autocmd User LspSetup call LspAddServer(lspServers)

" Go language server
let lspServers = [#{
    \    name: 'golang',
    \    filetype: ['go', 'gomod'],
    \    path: '~/go/bin/gopls',
    \    args: ['serve'],
    \    syncInit: v:true
	\ }]
autocmd User LspSetup call LspAddServer(lspServers)

"let lspServers = [#{
    "\    name: 'python',
    "\    filetype: ['py', 'gomod'],
    "\    path: '~/.local/bin/ty',
    "\    syncInit: v:true
	"\ }]
"autocmd User LspSetup call LspAddServer(lspServers)

" Clangd language server
"call LspAddServer([#{
	"\    name: 'clangd',
	"\    filetype: ['c', 'cpp'],
	"\    path: '/usr/bin/clangd',
	"\    args: ['--background-index']
	"\  }])

" Javascript/Typescript language server
"call LspAddServer([#{
	"\    name: 'typescriptlang',
	"\    filetype: ['javascript', 'typescript'],
	"\    path: '/usr/local/bin/typescript-language-server',
	"\    args: ['--stdio'],
	"\  }])

" Rust language server
"call LspAddServer([#{
	"\    name: 'rustlang',
	"\    filetype: ['rust'],
	"\    path: '~/.cargo/bin/rust-analyzer',
	"\    args: [],
	"\    syncInit: v:true
	"\  }])

" GoTo code navigation.
"nmap <silent> gd <Plug>(coc-definition)
"nmap <silent> gy <Plug>(coc-type-definition)
"nmap <silent> gi <Plug>(coc-implementation)
"nmap <silent> gr <Plug>(coc-references)

" Use K to show documentation in preview window
"nnoremap <silent> K :call ShowDocumentation()<CR>
"function! ShowDocumentation()
  "if CocAction('hasProvider', 'hover')
    "call CocActionAsync('doHover')
  "else
    "call feedkeys('K', 'in')
  "endif
"endfunction

"" Use `[g` and `]g` to navigate diagnostics
"" Use `:CocDiagnostics` to get all diagnostics of current buffer in location list
"nmap <silent> [g <Plug>(coc-diagnostic-prev)
"nmap <silent> ]g <Plug>(coc-diagnostic-next)

" Use Tab to cycle between completion options
"inoremap <silent><expr> <Tab>
      "\ coc#pum#visible() ? coc#pum#next(1) :
      "\ CheckBackspace() ? "\<Tab>" :
      "\ coc#refresh()
"" Use Enter to confirm completion
"inoremap <expr> <cr> coc#pum#visible() ? coc#pum#confirm() : "\<CR>"

"" Remap <C-f> and <C-b> to scroll float windows/popups
"if has('nvim-0.4.0') || has('patch-8.2.0750')
  "nnoremap <silent><nowait><expr> <C-f> coc#float#has_scroll() ? coc#float#scroll(1) : "\<C-f>"
  "nnoremap <silent><nowait><expr> <C-b> coc#float#has_scroll() ? coc#float#scroll(0) : "\<C-b>"
  "inoremap <silent><nowait><expr> <C-f> coc#float#has_scroll() ? "\<c-r>=coc#float#scroll(1)\<cr>" : "\<Right>"
  "inoremap <silent><nowait><expr> <C-b> coc#float#has_scroll() ? "\<c-r>=coc#float#scroll(0)\<cr>" : "\<Left>"
  "vnoremap <silent><nowait><expr> <C-f> coc#float#has_scroll() ? coc#float#scroll(1) : "\<C-f>"
  "vnoremap <silent><nowait><expr> <C-b> coc#float#has_scroll() ? coc#float#scroll(0) : "\<C-b>"
"endif

" gitgutter
" Sign column color matching
highlight! link SignColumn LineNr
let g:gitgutter_set_sign_backgrounds = 1

" VimTex
let g:vimtex_view_general_viewer = 'okular'

" Appearance
" -----------------------------------------------------------------------------
syntax on
set number
"set relativenumber
autocmd FileType asm setlocal colorcolumn=80
autocmd FileType c setlocal colorcolumn=80
" Show tabs
" set listchars=tab:\|\
set nolist
colorscheme noctu
" vertical split separator
set fillchars+=vert:│
hi VertSplit ctermbg=NONE guibg=NONE ctermfg=Green

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
set spelllang=en,programming

autocmd FileType asm setlocal tabstop=8 softtabstop=8 shiftwidth=8 noexpandtab
autocmd FileType proto3,proto setlocal tabstop=2 softtabstop=2 shiftwidth=2
autocmd FileType tex,cls,latex,context setlocal tabstop=2 softtabstop=2 shiftwidth=2 noexpandtab spell

" Persistent undofiles in a consistent directory
if !isdirectory($HOME."/.vim/undo-dir")
    call mkdir($HOME."/.vim/undo-dir", "", 0700)
endif
set undodir=~/.vim/undo-dir
set undofile
set undolevels=2000

" Silence Ruby & Perl provider health warnings
if has("nvim")
    let g:loaded_ruby_provider=0
    let g:loaded_perl_provider=0
endif

" User Keybindings
" -----------------------------------------------------------------------------
" disable F1 help
:nmap <F1> <nop>
:imap <F1> <C-o> <nop>

" source vimrc
:nnoremap <F2> :source $MYVIMRC<cr>

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

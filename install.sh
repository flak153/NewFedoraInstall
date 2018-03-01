#!/bin/bash/
dnf update -y
wait
dnf install -y htop gnome-tweak-tool snapd KeepassXC atom vlc curl git zsh
chsh -s $(which zsh)
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
git clone https://github.com/bhilburn/powerlevel9k.git ~/.oh-my-zsh/custom/themes/powerlevel9k
cp .zshrc ~/
curl -sSL https://get.haskellstack.org/ | sh
dnf copr enable heliocastro/hack-fonts
dnf install hack-fonts



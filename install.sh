#!/bin/bash/

dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm

dnf config-manager --add-repo=https://negativo17.org/repos/fedora-nvidia.repo
dnf config-manager --add-repo=https://negativo17.org/repos/fedora-spotify.repo

dnf update -y

dnf install snapd

dnf install -y htop gnome-tweak-tool KeepassXC atom vlc curl git zsh parallel spotify-client

chsh -s $(which zsh)


curl -sSL https://get.haskellstack.org/ | sh &
dnf copr enable heliocastro/hack-fonts
dnf install hack-fonts
wait
echo All Done!!!



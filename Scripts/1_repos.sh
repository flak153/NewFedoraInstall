
#RPM Fusion Repo
dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm

#Nvidia Repo from Negativo17
dnf config-manager --add-repo=https://negativo17.org/repos/fedora-nvidia.repo

#Negativo's Spotify Repo
dnf config-manager --add-repo=https://negativo17.org/repos/fedora-spotify.repo

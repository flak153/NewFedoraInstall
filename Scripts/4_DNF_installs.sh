#!/bin/sh

cat ../DNF_Packages.txt | xargs dnf -y install

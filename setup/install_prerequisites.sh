#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo -e "Script requires 2 parameters. Git username and email"
    exit 1
fi

# apt-get update and upgrade
sudo apt-get -y update
sudo apt-get -y upgrade

# install diffuse
echo -e "\n\n"
echo -e "installing diffuse"
sudo apt-get install -y diffuse

# configure git
echo -e "\n\n"
echo -e "configuring git"
git config --global user.name $1
git config --global user.email $2
git config --global alias.st "status"
git config --global alias.stat "status"
git config --global alias.wdiff "diff --color-words"
git config --global merge.tool diffuse
git config --global merge.summary true
git config --global difftool.prompt false
git config --global diff.tool diffuse
git config --global color.ui true


# install python related stuff
echo -e "\n\n"
echo -e "installing python stuff"
sudo apt-get install -y build-essential python-dev python-yaml \
python-setuptools ipython pylint python-pip python-imaging virtualenvwrapper

# install vim
echo -e "\n\n"
echo -e "installing vim"
sudo apt-get install -y vim

# install ssh server
echo -e "\n\n"
echo -e "installing openssh server"
sudo apt-get install -y openssh-server

# install postgres
echo -e "\n\n"
echo -e "installing postgres"
sudo apt-get install -y postgresql pgadmin3

# final clean up
echo -e "\n\n"
echo -e "doing final clean up"
sudo apt-get -fy install
sudo apt-get -y update
sudo apt-get -y upgrade
sudo apt-get -y autoclean
sudo apt-get -y autoremove

echo -e "\n\n"
echo -e "done"


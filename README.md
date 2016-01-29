# xatsw
Console application for fast and convenient profile switching
# Installation

npm install huumanoid/xatsw -g

#Usage

Firstly, set up flash local storage with chat.sol file:
```sh
xatsw add-target name path
xatsw set-target name
```
For example, for chromium on my archlinux, it's:

```sh
$ xatsw add-target test ~/.config/chromium/Default/Pepper\ Data/Shockwave\ Flash/WritableRoot/#SharedObjects/HFPGSMU9/www.xatech.com/
$ xatsw set-target test
```
Secondly, set up where to store your profiles:

```sh
$ xatsw set-storage path
```

For example:
```sh
$ mkdir ~/xat-storage
$ xatsw set-storage ~/xat-storage
```

Well done! Now, to store your profile in storage, execute
```sh
$ xatsw load name
```
Name can be whatever you want. It is just for you, to distinguish different saved profiles.

To extract your profile to flash local storage, use
```sh
$ xatsw extract name
```

# Completion
Also, there is bash completion available. Execute
```sh
$ xatsw completion >> ~/.bashrc
```
to set up command line completion, which could suggest profile/target names to you.

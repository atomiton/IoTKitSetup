#!/bin/bash

JAVA_HOME="/usr/lib/jvm/jdk-8-oracle-arm32-vfp-hflt/"
TQL_HOME="/home/pi/atomiton-release"

cd /home/pi/atomiton-release/bin
sudo JAVA_HOME=$JAVA_HOME TQL_HOME=$TQL_HOME ./tql -engine -start Djava.library.path=syslib/bluetooth_driver/com/atomiton/sff/imp/netty/bluetooth/:syslib/serialbasedprotocols/library:/usr/lib/jni


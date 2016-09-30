#!/bin/bash

for i in $(seq 0 99); do
	[ -e "/dev/ttyACM$i" ] && break
done

if [ "$i" -lt "99" ]
then
	echo "/dev/ttyACM$i"
else
	for j in $(seq 0 99); do
		[ -e "/dev/ttyUSB$j" ] && break
	done

	if [ "$j" -lt "99" ]
	then
		echo "/dev/ttyUSB$j"
	fi
fi

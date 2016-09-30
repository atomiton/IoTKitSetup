#!/bin/bash
source /home/pi/atomiton-release/scripts/hotspot
CONFIG_FILE=/etc/wpa_supplicant/wpa_supplicant.conf
TEMP_FILE=/home/pi/wpa_supplicant.conf

if [ $# -lt 1 ]
    then
			echo "HotSpot is $HOTSPOT"
			wlan=`/sbin/ifconfig wlan0 | grep inet\ addr | wc -l`
			IpAddr="$(ifconfig wlan0 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://')"
			if [ $wlan -eq 0 ] 
				then
					echo " Not Connected to Wifi "
					cp -f /home/pi/atomiton-release/scripts/dhcpcd.conf.hotspot /etc/dhcpcd.conf
					cp -f /home/pi/atomiton-release/scripts/interfaces.hotspot /etc/network/interfaces
					cp -f /home/pi/atomiton-release/scripts/hostapd.conf.hotspot /etc/hostapd/hostapd.conf
					cp -f /home/pi/atomiton-release/scripts/hostapd.hotspot /etc/default/hostapd
					cp -f /home/pi/atomiton-release/scripts/dnsmasq.conf.hotspot /etc/dnsmasq.conf
					service dhcpcd restart
					ifdown wlan0
					ifup wlan0
					service hostapd start
					service dnsmasq start
					echo HOTSPOT=ON > /home/pi/atomiton-release/scripts/hotspot
					sudo reboot
			else
			  echo "connected to Wifi"
				  if [ "$IpAddr" == "1.1.1.1" ]
						then
							echo "Raspberry Pi acting as hotspot"
							echo HOTSPOT=ON > /home/pi/atomiton-release/scripts/hotspot
					else
						echo "Raspberry Pi acting as wifi end point"				
						MacAddr="$(ifconfig wlan0 | awk '/HWaddr/ {print $5}')"
						IpAddr="$(ifconfig wlan0 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://')"
						echo " Mac Address is --> $MacAddr"
						echo " Ip Address is ---> $IpAddr"
						echo HOTSPOT=OFF > /home/pi/atomiton-release/scripts/hotspot
					fi    
			fi
else
	if [ "$1" = "list" ]
		then
			WifiList=$(sudo grep "ssid=" ${CONFIG_FILE} | sed s/ssid=//g | tr -d '"')
			WifiList="$(echo "$WifiList" | sed ':a;N;$!ba;s/\n/#-#/g' | tr -d " ")"
			Email=$(sed -n '/Username/{s/.*<Username>//;s/<\/Username.*//;p;}' /home/pi/atomiton-release/.tql.ini)
			echo "<SSID>$WifiList</SSID> <Email>$Email</Email>"

	elif [ "$1" = "add" ] && [ $# -gt 2 ]
		then
			echo -e "network={ \n ssid=\"$2\" \n psk=\"$3\" \n}\n" >> ${CONFIG_FILE}

	elif [ "$1" = "reboot" ]
		then
			echo "Rebooting the Pi"
			echo HOTSPOT=OFF > /home/pi/atomiton-release/scripts/hotspot
			cp -f /home/pi/atomiton-release/scripts/dhcpcd.conf.original /etc/dhcpcd.conf
			cp -f /home/pi/atomiton-release/scripts/interfaces.original /etc/network/interfaces
			cp -f /home/pi/atomiton-release/scripts/hostapd.original /etc/default/hostapd
			cp -f /home/pi/atomiton-release/scripts/dnsmasq.conf.original /etc/dnsmasq.conf
			service hostapd stop
			service dnsmasq stop
			service dhcpcd restart
			ifdown wlan0
			ifup wlan0
			nohup /home/pi/atomiton-release/scripts/reboot.sh > /dev/null 2>&1 &
			exit 0;

	elif [ "$1" = "delete" ] && [ $# -gt 1 ]
		then
			nohup python /home/pi/atomiton-release/scripts/delete.py $2 > /dev/null 2>&1
	fi

fi






import sys

f = open('/etc/wpa_supplicant/wpa_supplicant.conf', 'r')
line = f.read()
f.close()
line = line.split('ssid="' + sys.argv[1]+'"')
if len(line) > 1:
    final_line = line[0][0:line[0].rindex("network")] + line[1][line[1].index("}")+1:len(line[1])]
    f = open('/etc/wpa_supplicant/wpa_supplicant.conf', 'w')
    f.write(final_line)
    f.close()

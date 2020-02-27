import sys
import os
import urllib
import urllib2


def get_snirh(url, site_id, parms_id, strdate, enddate):

    pars = ','.join(str(x) for x in parms_id)
    url = url + '?sites='+str(site_id)+'&pars='+pars+'&tmin='+strdate+'&tmax='+enddate+'&formato=csv'
    print ('   '+url)

    response = urllib2.urlopen(url)

    ## open file to download data
    #file_name = str(site_id) + '.csv'
    #file = open(file_name, 'wb')
    data = ""

    if response.code >= 200 and response.code < 300:
        meta = response.info()
        file_size = int(meta.getheaders("Content-Length")[0])

        file_size_dl = 0
        block_sz = 8192
        while True:
            buffer = response.read(block_sz)
            if not buffer:
                break

            file_size_dl += len(buffer)
            #file.write(buffer)
            data += buffer
            status = r"%10d  [%3.2f%%]" % (file_size_dl, file_size_dl * 100. / file_size)
            status = status + chr(8)*(len(status)+1)

        #file.close()
        response.close()

        '''# open file and read to variable
        with open(file_name, 'r') as content_file:
            #data = content_file.read()
            pass'''

        return data
    else:
        return False


''' converts csv given by snirh to format comaptible with omega platform
def convert(filename):
    f = open(filename, 'r')
    newFilename = "precipitacaoSH_med.dat"
    g = open(newFilename, 'w')

    for x in f:
        if x[1].isdigit():
            newLine = x[6:10] + "-" + x[3:5] + "-" + x[0:2] + "T" + x[11:16] + ":00," + x[17:-4] + "\n"
            g.write(newLine)

    f.close()
    g.close()
'''

def convertCSV(data):
    res = ""

    for line in data.split('\n'):
        if len(line) > 0 and line[0].isdigit():
            newLine = line[6:10] + "-" + line[3:5] + "-" + line[0:2] + "T" + line[11:16] + ":00," + line[17:-4]
            if newLine[-1] == ',':
                newLine += "0\n"
            else:
                newLine += "\n"
            res += newLine

    return res


''' Main '''
url = sys.argv[1]
params_id = [sys.argv[2]]
strdate = sys.argv[3]
enddate = sys.argv[4]
stationsStr = sys.argv[5] # string with stations in the form id1, name1, id2, name2, ...
stationsList = stationsStr.split(',')

station_ids = []
station_names = []
# splits ids and names in two separate lists
for x in stationsList:
    if x.isdigit():
        station_ids = station_ids + [x]
    else:
        station_names = station_names + [x]

# iterates through stations and processes information for each, storing it in the respective station files in mldata
for i in range(len(station_ids)): #len(station_ids)'''
    path = "/samba/mldata/MLDATA01/stations/" + station_names[i].strip() + "/precipitacaoSH_med.dat"
    data = convertCSV(get_snirh(url, station_ids[i], params_id, strdate, enddate))
    f = open(path, 'w')
    f.write(data)
    f.close()
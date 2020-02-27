import h5py
import math
import json
def readConfig():
    with open('HDFIndexer.json') as json_file:
        data = json.load(json_file)
        print(data['Barragens'])
readConfig()

f = h5py.File('MM5_D3_2019-07-15_2019-07-16.hdf5','r')
#f.visititems(print_attrs)
#print(list(f['Results']))
parameter = 'air temperature'
hdf_t2 = 'Results/' + parameter
hdf_times = 'Time'
#print(list(f['Grid']['Longitude']))
def findBest(lat,lon):
    p1 = [lat,lon]
    isFirst = True
    for t, key in enumerate(list(f['Grid']['Latitude'])):
        for t2, key2 in enumerate(list(f['Grid']['Latitude'])[t]):
            p2 = [f['Grid']['Latitude'][t][t2],f['Grid']['Longitude'][t][t2]]
            tmpDist = math.sqrt( ((p1[0]-p2[0])**2)+((p1[1]-p2[1])**2) )
            if(isFirst):
                isFirst = False
                distance = tmpDist
                positions = [t,t2]
            elif(tmpDist < distance):
                 distance = tmpDist
                 positions = [[t,t2], p2]
    return (positions, distance)
        
data = findBest(38.99992,-8.004456)
#print(data)

#print(len(f[hdf_t2]['air temperature_00022'].value[0]))
for t, key in enumerate(list(f[hdf_t2].keys())):
    try:
        t2 = f[hdf_t2][key].value
        #print(t2[0][0])
        time = f[hdf_times][key.replace(parameter,'Time')].value
        #print(t,key)
        break

    except:
        continue

    yyyy = time[0]
    mm = time[1]
    dd = time[2]
    HH = time[3]

    datetime = str(int(yyyy))+'-'+str(int(mm)).zfill(2)+'-'+str(int(dd)).zfill(2)+' '+str(int(HH)).zfill(2)


    #t2_p = t2[ix,jy]

    #print(datetime, t2)


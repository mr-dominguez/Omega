import json
import sys
import os
import stat
import datetime as dt
import argparse
import ntpath
import h5py
import copy
import math
import statistics

def readConfig(args):
    with open(args + 'HDFIndexer.json') as json_file:
        return json.load(json_file)

def getRecentFiles(num_files, directory):
    modified = []
    rootdir = os.path.join(os.getcwd(), directory)

    for root, sub_folders, files in os.walk(rootdir):
        for file in files:
            try:
                unix_modified_time = os.stat(os.path.join(root, file))[stat.ST_MTIME]
                human_modified_time = dt.datetime.fromtimestamp(unix_modified_time).strftime('%Y-%m-%d %H:%M:%S')
                filename = os.path.join(root, file)
                modified.append((ntpath.basename(filename),unix_modified_time))
            except Exception as e:
                pass

    modified.sort(key=lambda a: a[1], reverse=True)
    tmp = []
    for elm in modified[:num_files]:
        tmp.insert(0,elm[0])

    #print(tmp)
    return tmp

def hdfsExtractor(station,hdfParam,relPath,files,obj,args,positions,f):
    tmp = station
    station.update({"HdfParameters": copy.deepcopy(hdfParam)})
    for fileName in files:
        f = h5py.File(args + relPath + "/" + fileName,'r')
        for prop in station["HdfParameters"]:
            extractProperty(args + relPath + "/" + fileName, station, prop,positions,f)
    obj.append(station)

def findBest(lat,lon,latArr,latList,lonArr,lonList):
    p1 = [lat,lon]
    isFirst = True
    for t, key in enumerate(latList):
        for t2, key2 in enumerate(latList[t]):
            p2 = [latArr[t][t2],lonArr[t][t2]]
            tmpDist = ((p1[0]-p2[0])**2)+((p1[1]-p2[1])**2) 
            if(isFirst):
                isFirst = False
                distance = tmpDist
                positions = [t,t2]
                if(distance < 0.01):
                    return (positions)
            elif(tmpDist < distance):
                 distance = tmpDist
                 positions = [t,t2]
                 if(distance < 0.01):
                    return (positions)
    return (positions)

def extractProperty(name,station,prop,positions,f):
    hdf_t2 = 'Results/' + prop["Param"]
    hdf_times = 'Time'
    tmp = {}
    toIterate = []
    day = ""
    for t, key in enumerate(list(f[hdf_t2].keys())):
        try:
            t2 = f[hdf_t2][key].value
            #print(t2[0][0])
            time = f[hdf_times][key.replace(prop["Param"],'Time')].value
            #print(t,key)
        except Exception as e:
            continue

        yyyy = time[0]
        mm = time[1]
        dd = time[2]
        HH = time[3]

        datetime = str(int(dd)).zfill(2)+'-'+str(int(mm)).zfill(2)+'-'+str(int(yyyy))

        t2_p = t2[positions[0]][positions[1]]

        #print(datetime, t2_p, prop["Param"], name, station["Nome"])
        tmp["Date"] = datetime
        toIterate.append(float(t2_p))
    for elm in prop["Sub"]:
        subprop = list(elm.keys())[0]
        tmp[subprop] = calculateSubProp(toIterate,subprop)
    prop["Data"].append(tmp)
    #define max/med/min/som
        
    #print(tmp)
    #input("Press Enter to continue...")
    
def calculateSubProp(tmp,name):
    if(name=="med"):
        return statistics.mean(tmp)
    elif(name=="max"):
        return max(tmp)
    elif(name=="min"):
        return min(tmp)
    elif(name=="som"):
        return sum(tmp)


def parseArguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", help="needs to point to the forecast folder and ends with /", default="")
    return parser.parse_args().path

def main():
    args = parseArguments()
    jsonObject = {}
    jsonObject["Barragens"] = []

    indexer = readConfig(args)

    files = getRecentFiles(indexer["NumberOfDays"],indexer["RelativePath"])

    f = h5py.File(args + indexer["RelativePath"] + "/" + files[0],'r')
    latArr = f['Grid']['Latitude']
    latList = list(latArr)
    lonArr = f['Grid']['Longitude']
    lonList = list(lonArr)

    for station in indexer["Barragens"]:
        positions = findBest(station["Latitude"],station["Longitude"],latArr,latList,lonArr,lonList)
        hdfsExtractor(station,indexer["HdfParameters"] ,indexer["RelativePath"],files, jsonObject["Barragens"],args,positions,f)

    jsonObject = json.dumps(jsonObject)  
    print(jsonObject)
    #print(json.dumps({ "name":"John" }))
    sys.stdout.flush()

if __name__ == '__main__':
    main()

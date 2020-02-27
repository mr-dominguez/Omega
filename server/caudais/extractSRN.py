#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import math

def extractTimeSeriesSRN(pathToFile):
    ''' extracts different values from SRN type files to be used by OMEGA
        currently extracted parameters:
        - channel flow
        - cohesive sediment
        - nitrate
        - inorganic phosphorus '''

    f = open(pathToFile, 'r')

    lineCount = 0
    totalVolume = 0
    totalSediment = 0
    totalNitrate = 0
    totalPhosphorus = 0

    for line in f:
        lineCount += 1
        if lineCount >= 10 and lineCount <=34:
            words = line.split()
            if len(words) >= 10: 
            # so entra aqui se a quantidade de palavras numa linha for 10 ou mais AKA          
            # há informacao util e nao apenas cabecalhos

                # channel flow ----------------------------
                channel_flow = words[13] #channel flow
                cFbase = float(channel_flow[:-5])
                cFexp = float(channel_flow[-3:])
                cFsignal = channel_flow[-4]

                if cFsignal == '+':
                    secondTerm = 10**cFexp
                else:
                    secondTerm = 10**(cFexp*(-1))

                volume = cFbase*secondTerm
                totalVolume += volume

                # cohesive sediment --------------------
                sediment_reading = words[19]
                cSbase = float(sediment_reading[:-5])
                cSexp = float(sediment_reading[-3:])
                cSsignal = sediment_reading[-4]

                if cSsignal == '+':
                    secondTerm = 10**cSexp
                else:
                    secondTerm = 10**(cSexp*(-1))

                cohesive_sediment = cSbase*secondTerm  
                totalSediment += cohesive_sediment              

                # nitrate ------------------------------
                nitrate_reading = words[23]
                nbase = float(nitrate_reading[:-5])
                nexp = float(nitrate_reading[-3:])
                nsignal = nitrate_reading[-4]

                if nsignal == '+':
                    secondTerm = 10**nexp
                else:
                    secondTerm = 10**(nexp*(-1))

                nitrate = nbase*secondTerm
                totalNitrate += nitrate
                print(totalNitrate)

                # inorganic phosphorus -----------------
                phosphorus_reading = words[35]
                iPbase = float(phosphorus_reading[:-5])
                iPexp = float(phosphorus_reading[-3:])
                iPsignal = phosphorus_reading[-4]

                if iPsignal == '+':
                    secondTerm = 10**iPexp
                else:
                    secondTerm = 10**(iPexp*(-1))

                inorganic_phosphorus = iPbase*secondTerm
                totalPhosphorus += inorganic_phosphorus

    totalVolume *= 3600
    totalSediment *= totalVolume
    totalNitrate = totalNitrate*0.001*totalVolume
    totalPhosphorus = totalPhosphorus*0.001*totalVolume

    return [totalVolume, totalSediment, totalNitrate, totalPhosphorus]


def dailyExtract(pathToDirectory, node_list, outputPath):
    ''' iterate through the last 30 days in 
        \mldata/MLDATA01/Operational/OP<Nome>/Results_Timeseries 
        and extract info to write to OMEGA format in
        \mldata/MLDATA01/caudais/<Nome> 
        where <Nome> is maranhao or montargil (as of the writing of this) '''

    no_nodes = len(node_list)
    folders_list = os.listdir(pathToDirectory)
    no_days = len(folders_list)

    f = open(outputPath + "volume_val.dat", 'w')
    g = open(outputPath + "cohesivesediment_val.dat", 'w')
    h = open(outputPath + "nitrate_val.dat", 'w')
    m = open(outputPath + "inorganicphosphorus_val.dat", 'w')

    if no_days > 30:
        days = -30
    else:
        days = -1*no_days

    for i in range(days, 0):
        day = folders_list[i][:10]
        directory = pathToDirectory + folders_list[i] + "/"
        volume = 0
        cohesive_sediment = 0
        nitrate = 0
        inorganic_phosphorus = 0

        for j in range(no_nodes):
            pathToNode = directory + "Node_" + str(node_list[j]) + ".srn"
            exists = False
            if (os.path.isfile(pathToNode)):
                exists = True
                data = extractTimeSeriesSRN(pathToNode)
                volume += data[0]
                cohesive_sediment += data[1]
                nitrate += data[2]
                inorganic_phosphorus += data[3]

        if (exists):
            dataFormat = day + "T23:59:00,"
            volume =               dataFormat + str(math.trunc(volume)) + '\n'
            cohesive_sediment =    dataFormat + str(cohesive_sediment) + '\n'
            nitrate =              dataFormat + str(nitrate) + '\n'
            inorganic_phosphorus = dataFormat + str(inorganic_phosphorus) + '\n'

            f.write(volume)
            g.write(cohesive_sediment)
            h.write(nitrate)
            m.write(inorganic_phosphorus)

    f.close()
    g.close()
    h.close()
    m.close()
    return


def main():
    ''' iterates through the directories with the timeseries and extracts the necessary values for the caudais frame of OMEGA webserver '''

    inputPathMaranhao = "/samba/mldata/MLDATA01/Operational/OPMaranhao/Results_Timeseries/"
    outputPathMaranhao = "/samba/mldata/MLDATA01/caudais/maranhao/"
    nodesMaranhao = [7]
    inputPathMontargil = "/samba/mldata/MLDATA01/Operational/OPMontargil/Results_Timeseries/"
    outputPathMontargil = "/samba/mldata/MLDATA01/caudais/montargil/"
    nodesMontargil = [32]

    dailyExtract(inputPathMaranhao, nodesMaranhao, outputPathMaranhao)
    dailyExtract(inputPathMontargil, nodesMontargil, outputPathMontargil)
    return 


if __name__ == "__main__":
    main()
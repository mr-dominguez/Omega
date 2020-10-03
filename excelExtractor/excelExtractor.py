import xlrd,wget,xlwt,os,json,argparse,sys,datetime
from datetime import date
import requests
from bs4 import BeautifulSoup

#Keep track of last time data was extracted to avoid processing the same information twice
last_link_file = "/home/mbelem/Omega/excelExtractor/last_link.txt"

def parseJSON(args):
    with open(os.getcwd()+args+"volumes/data.json") as json_file:
        data = json.load(json_file)
        albufeiras = []
        for albufeira in data["volumes"]["albufeiras"]:
            albufeiras.append(albufeira)
        return albufeiras

def parseExcel(args):
    data = {"albufeiras": []}
    albufeiras = parseJSON(args)
    for albufeira in albufeiras:
        elm = albufeira["excelName"]
        elmFileName = albufeira["nome"]
        #with open(os.getcwd()+args+"volumes/"+elmFileName, "w") as file:
        workbook = xlrd.open_workbook(os.getcwd()+args+'barragens.xlsx')
        worksheet = workbook.sheet_by_name(elm)
        j = 677
        #file.write("Semana;Data;Cota;Total\n")
        content = []
        
        while(worksheet.cell_type(j, 4)!=xlrd.XL_CELL_EMPTY):
            #tmp = ""
            #tmp+=str(int(worksheet.cell(j, 2).value))+";"
            dateTuple = xlrd.xldate_as_tuple(worksheet.cell(j, 3).value, workbook.datemode)
            #tmp+=str(datetime.datetime(dateTuple[0],dateTuple[1],dateTuple[2]).strftime('%d/%m/%Y'))+";"
            #tmp+=str(worksheet.cell(j, 4).value)+";"
            #tmp+=str(worksheet.cell(j, 6).value)
            #tmp+="\n"
            #print((tmp,elm))
            #file.write(tmp)
            entry = {}
            entry["Semana"] = str(int(worksheet.cell(j, 2).value))
            entry["Data"] = str(datetime.datetime(dateTuple[0],dateTuple[1],dateTuple[2]).strftime('%d/%m/%Y'))
            entry["Cota"] = str(worksheet.cell(j, 4).value)
            entry["Total"] = str(worksheet.cell(j, 6).value)
            entry["VolumeArmazenado"] = str(worksheet.cell(j, 8).value)
            content.append(entry)
            j+=1
        data["albufeiras"].append((elm,content))
    print(json.dumps(data))
    sys.stdout.flush()

def parseArguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", help="needs to point to the excelTest folder and ends with /", default="/")
    return parser.parse_args().path


def main():
    args = parseArguments()
    if os.path.exists(os.getcwd()+args+"barragens.xlsx"):
        os.remove(os.getcwd()+args+"barragens.xlsx")


    #Get page with barragens
    page = requests.get("http://sir.dgadr.gov.pt/reservas")

    #Transform into soup for parsing
    soup = BeautifulSoup(page.content, 'html.parser')

    #Find all hrefs and compare contents with result intended
    for a in soup.find_all('a', href=True):
        if a.contents and "Boletim das Albufeiras" in a.contents[0]:
            #Link for download is in a href tag
            pathToBoletim = a['href']

            #Extract date to display in website
            if pathToBoletim[-6] != "_":
                date = pathToBoletim[-15:-5]
            else:
                date = pathToBoletim[-16:-6]

    link = "http://sir.dgadr.gov.pt" + pathToBoletim

    #Check if new information is available
    f = open(last_link_file, 'r')
    line = f.readline
    f.close()

    #If new link is different that the last link downloaded then download new info
    if line and line != link:
        wget.download(link ,os.getcwd() + args + "barragens.xlsx")
        with open(os.getcwd()+args+"volumes/data.json",encoding='utf8') as json_file:
            data = json.load(json_file)
            data["data"]["semana"][0]["numero"] = 1
            data["data"]["semana"][0]["dia"] = date
        with open(os.getcwd()+args+"volumes/data.json","w",encoding='utf8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
        parseExcel(args)

        #Write new link in file
        g = open(last_link_file, 'w')
        g.write(link)
        g.close()

    #Else give incorrect link to report error and reload previous info (bad implementation - should have a cleaner solution)
    else:
        wget.download("blah" + link + "blah" ,os.getcwd() + args + "barragens.xlsx")

'''
def main():
    args = parseArguments()
    #year = date.today().strftime("%Y")
    #month = date.today().strftime("%m")
    year = "2020"
    month = "1"
    toExit = False
    for m in range(int(month)-1,int(month)+1):
        for d in range(1,32):
            try:
                if os.path.exists(os.getcwd()+args+"barragens.xlsx"):
                    os.remove(os.getcwd()+args+"barragens.xlsx")
                #HENRIQUE TENS DE CORRIGIR A MANEIRA COMO ELE VAI BUSCAR O FICHEIRO, METE A ANDAR A DATA PARA TRAS UM MEZ E VARRER TUDO QUE ISTO QUE EU FIZ DA MERDA NA MUDANÇA DO ANO
                #wget.download("http://sir.dgadr.gov.pt/images/BOL_ALB_ATUALIZADO_A_"+str(d).zfill(2)+"."+str(m).zfill(2)+"."+year+".xlsx",os.getcwd()+args+"barragens.xlsx")
                wget.download("sir.dgadr.gov.pt/images/BOL_ALB_ATUALIZADO_A_24012020.xlsx",os.getcwd()+args+"barragens.xlsx")
                #print("Success " + "http://sir.dgadr.gov.pt/images/BOL_ALB_ATUALIZADO_A_"+str(d).zfill(2)+"."+str(m).zfill(2)+"."+year+".xlsx",args+"/"+"barragens.xlsx")
                recentDate = str(d).zfill(2)+"/"+str(m).zfill(2)+"/"+year
                recentWeek = datetime.date(int(year), m, d).isocalendar()[1]
                with open(os.getcwd()+args+"volumes/data.json",encoding='utf8') as json_file:
                    data = json.load(json_file)
                    data["data"]["semana"][0]["numero"] = recentWeek
                    data["data"]["semana"][0]["dia"] = recentDate
                with open(os.getcwd()+args+"volumes/data.json","w",encoding='utf8') as json_file:
                    json.dump(data, json_file, indent=4, ensure_ascii=False)
                toExit = True
                parseExcel(args)
                break
            except Exception as e:
                #print((e,str(d).zfill(2)+"."+str(m).zfill(2)+"."+year))
                #print(e)
                pass
        if(toExit):
            break
'''
if __name__ == '__main__':
    main()

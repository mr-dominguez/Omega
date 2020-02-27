import xlrd,wget,xlwt,os,json,argparse,sys,datetime
from datetime import date

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
    wget.download("http://sir.dgadr.gov.pt/images/BOL_ALB_ATUALIZADO_A_07.02.2020.xlsx",os.getcwd()+args+"barragens.xlsx")
    with open(os.getcwd()+args+"volumes/data.json",encoding='utf8') as json_file:
        data = json.load(json_file)
        data["data"]["semana"][0]["numero"] = 1
        data["data"]["semana"][0]["dia"] = "24/01/2020"
    with open(os.getcwd()+args+"volumes/data.json","w",encoding='utf8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)
    parseExcel(args)

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

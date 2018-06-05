import * as XLSX from "xlsx";
import * as fs from "fs-extra";
export class xls {
  workbook: XLSX.WorkBook;
  constructor(filename: string) {
    this.workbook = XLSX.readFile(filename);
  }

  public readCell(address_of_cell: string): any {
    let first_sheet_name = this.workbook.SheetNames[0];
    /* Get worksheet */
    let worksheet = this.workbook.Sheets[first_sheet_name];
    /* Find desired cell */
    let desired_cell = worksheet[address_of_cell];
    /* Get the value */
    let desired_value = desired_cell ? desired_cell.v : undefined;

    return desired_value;
  }

  public CopyFile(source: string, destination: string) {
    fs.copy(source, destination, err => {
      if (err) return console.error(err);
      console.log("success!");
    });
  }

  public VerifModification(pathSource: string, pathCopy) {
    fs.stat(pathSource, function(error, stats) {
      let dateSource = stats.mtime;
      let sizeSource = stats.size
    });
    fs.stat(pathCopy, function(error, stats) {
      let dateCopy = stats.mtime;
      let sizeCopy = stats.size;
    });

  }
}

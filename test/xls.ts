import { xls } from '../classes/xls';

let test = new xls('./xls/testxls.xls');

let cell = 'A1';
let result = test.readCell(cell);

console.log(cell + ' : ' + result);

test.CopyFile('./xls/testxls.xls','./xls/xlscopy/test.xls');

test.VerifModification('./xls/testxls.xls');
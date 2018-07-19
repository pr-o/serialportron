import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../services/electron.service';

declare interface dataRow {
  id?: number;
  comName?: string;
  manufacturer?: string;
  vendorId?: string;
  productId?: string;
}

declare interface TableData {
  headerRow: string[];
  dataRows: dataRow[];
}

@Component({
  selector: 'app-serialportron',
  templateUrl: 'serialportron.component.html',
})
export class SerialportronComponent implements OnInit {
  constructor(public electronService: ElectronService) { }

  public tableData: TableData;
  public port: any;
  public selectedPortId: string;
  public command: string = '';
  public CR = '\r';
  public readBuffer = '';
  public readBufferLength = 58;
  public portOpts = { baudRate: 115200, autoOpen: false };
  public screen: string = '[LOG] Open port not found';

  public timeout: any;

  ngOnInit() {
    this.tableData = {
      headerRow: ['#', 'COM name', 'Manuf.', 'Vendor ID', 'Product ID'],
      dataRows: [],
    };
  }

  scan() {
    this.selectedPortId = '';
    let index = 1;
    let portDetails: any;
    this.tableData.dataRows = []; // clear array
    this.electronService.serialPort.list().then(ports => {
      ports.forEach(port => {
        portDetails = {
          id: index,
          comName: port.comName,
          manufacturer: port.manufacturer,
          vendorId: port.vendorId,
          productId: port.productId,
        };
        this.tableData.dataRows.push(portDetails);
        index++;
      });
    });
  }

  getPort($event) {
    console.log($event.target.textContent);
    this.selectedPortId = $event.target.textContent;
    this.tableData.dataRows = this.tableData.dataRows.filter(
      element => element.comName === this.selectedPortId
    );
    this.screen = '[LOG] Port selected: ' + this.selectedPortId;
  }

  closePort() {
    this.port.close(err => {
      if (err) {
        console.log(err.message);
      }
    });
    this.screen = '[LOG] Port closed: ' + this.selectedPortId;
    this.selectedPortId = '';
    this.port = null;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.scan();
  }

  openPort() {
    this.port = new this.electronService.serialPort(
      this.selectedPortId,
      this.portOpts,
      err => {
        if (err) {
          this.screen = '[ERR] Error opening port: ' + err.message;
          return console.log('Error opening port: ', err.message);
        }
      }
    );

    this.port.on('open', () => {
      this.screen = '[LOG] Port opened: ' + this.selectedPortId;
    });

    this.port.on('data', data => {
      this.screen = '[DATA]: ' + data;
    });

    this.port.open(err => {
      if (err) {
        this.screen = '[ERR] Error opening port: ' + this.selectedPortId;
      }
    });
  }

  send() {
    this.command = this.command.toString(); // force conversion
    let buf = new Buffer(this.command + this.CR, 'ascii'); // append CR

    this.port.write(buf, err => {
      if (err) {
        this.screen =
          `[LOG] Error on <${this.command}> command: ` + err.message;
        return console.log(
          `[LOG] Error on <${this.command}> command: `,
          err.message
        );
      }
    });
  }

  auto() {
    this.send();
    this.timeout = setInterval(() => {
      console.log('[LOG] Interval: 3 seconds'), this.send();
    }, 3000);
  }

  str2hex(str: string): Buffer {
    let arr = [];
    for (let i = 0, l = str.length; i < l; i++) {
      let ascii = str.charCodeAt(i);
      arr.push(ascii);
    }
    arr.push(255);
    arr.push(255);
    arr.push(255);
    return new Buffer(arr);
  }

  hex2ascii(hexString) {
    let hex = hexString.toString(); //force conversion
    let str = '';
    for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
}

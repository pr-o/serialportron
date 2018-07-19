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
  constructor(
    public electronService: ElectronService,
  ) { }

  public tableData: TableData;
  public port: any;
  public selectedPortId: string;
  public portOpts = { baudRate: 115200, autoOpen: false };

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
    this.tableData.dataRows = []; // clear
    this.electronService.serialPort.list().then(ports => {
      console.log('[LOG] List of ports: ', ports)
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
    console.log('[LOG] Selected port ID: ', $event.target.textContent);
    this.selectedPortId = $event.target.textContent;
    this.tableData.dataRows = this.tableData.dataRows.filter(
      element => element.comName === this.selectedPortId
    );
  }

  openPort() {
    this.port = new this.electronService.serialPort(
      this.selectedPortId,
      this.portOpts,
      err => {
        if (err) {
          return console.log('[ERR] Error opening port: ', err.message);
        }
      }
    );

    this.port.on('open', () => {
      console.log('[LOG] Port opened: ', this.selectedPortId)
    });

    this.port.on('error', err => {
      if (err) {
        console.log('[ERR] Error: ', err.message)
      }
    });

    this.port.open(err => {
      if (err) {
        console.log('[ERR] Error opening port: ', this.selectedPortId)
      }
    });
  }

  closePort() {
    this.port.close(err => {
      if (err) {
        console.log('[ERR] Error: ', err.message);
      }
    });
    console.log('[LOG] Port closed: ', this.selectedPortId)
    this.selectedPortId = null;
    this.port = null;
    this.scan();
  }
}

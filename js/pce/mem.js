'use strict';
class RAM {
  constructor(core) {
    this.Core = core;
    this.MPR = new Array(8);
    this.MPRSelect = 0;
    this.RAM = new Array(0x8000);
    this.RAMMask = 0x1fff;
    this.BRAM = new Array(0x2000).fill(0x00);
    this.BRAMUse = false;
  }
  Get(address) {
    address = this.MPR[address >> 13] | (address & 0x1fff);

    if (address < 0x100000) {
      return this.Core.Mapper.Read(address);
    } else if (address < 0x1ee000) {
      return 0xff;
    } else if (address < 0x1f0000) {
      if (this.BRAMUse) return this.BRAM[address & 0x1fff];
      else return 0xff;
    } else if (address < 0x1f8000) {
      return this.RAM[address & this.RAMMask];
    } else if (address < 0x1fe000) {
      return 0xff;
    } else if (address < 0x1fe400) {
      switch (address & 0x000003) {
        case 0x00:
          return this.Core.vdc.GetVDCStatus(0);
        case 0x01:
          return 0x00;
        case 0x02:
          return this.Core.vdc.GetVDCLow(0);
        case 0x03:
          return this.Core.vdc.GetVDCHigh(0);
      }
    } else if (address < 0x1fe800) {
      switch (address & 0x000007) {
        case 0x04:
          return this.Core.vce.GetVCEDataLow();
        case 0x05:
          return this.Core.vce.GetVCEDataHigh();
        default:
          return 0x00;
      }
    } else if (address < 0x1fec00) {
      return this.Core.psg.GetPSG(address & 0x00000f);
    } else if (address < 0x1ff000) {
      return this.Core.timer.ReadTimerCounter();
    } else if (address < 0x1ff400) {
      return this.Core.io.GetJoystick();
    } else if (address < 0x1ff800) {
      switch (address & 0x000003) {
        case 0x02:
          return this.Core.irq.GetIntDisable();
        case 0x03:
          return this.Core.irq.GetIntReqest();
        default:
          return 0x00;
      }
    }
    return 0xff;
  }
  Set(address, data) {
    address = this.MPR[address >> 13] | (address & 0x1fff);

    if (address < 0x100000) {
      this.Core.Mapper.Write(address, data);
      return;
    } else if (address < 0x1ee000) {
      return;
    } else if (address < 0x1f0000) {
      if (this.BRAMUse) this.BRAM[address & 0x1fff] = data;
      return;
    } else if (address < 0x1f8000) {
      this.RAM[address & this.RAMMask] = data;
      return;
    } else if (address < 0x1fe000) {
      return;
    } else if (address < 0x1fe400) {
      switch (address & 0x000003) {
        case 0x00:
          this.Core.vdc.SetVDCRegister(data, 0);
          break;
        case 0x01:
          break;
        case 0x02:
          this.Core.vdc.SetVDCLow(data, 0);
          break;
        case 0x03:
          this.Core.vdc.SetVDCHigh(data, 0);
          break;
      }
      return;
    } else if (address < 0x1fe800) {
      switch (address & 0x000007) {
        case 0x00:
          this.Core.vce.SetVCEControl(data);
          break;
        case 0x02:
          this.Core.vce.SetVCEAddressLow(data);
          break;
        case 0x03:
          this.Core.vce.SetVCEAddressHigh(data);
          break;
        case 0x04:
          this.Core.vce.SetVCEDataLow(data);
          break;
        case 0x05:
          this.Core.vce.SetVCEDataHigh(data);
          break;
      }
      return;
    } else if (address < 0x1fec00) {
      this.Core.psg.SetPSG(address & 0x00000f, data);
      return;
    } else if (address < 0x1ff000) {
      switch (address & 0x000001) {
        case 0x00:
          this.Core.timer.WirteTimerReload(data);
          break;
        case 0x01:
          this.Core.timer.WirteTimerControl(data);
          break;
      }
      return;
    } else if (address < 0x1ff400) {
      this.Core.io.SetJoystick(data);
      return;
    } else if (address < 0x1ff800) {
      switch (address & 0x000003) {
        case 0x02:
          this.Core.irq.SetIntDisable(data);
          break;
        case 0x03:
          this.Core.irq.SetIntReqest(data);
          break;
      }
      return;
    }
  }
  Get16(address) {
    return (this.Get(address + 1) << 8) | this.Get(address);
  }
  StorageReset() {
    for (let i = 0; i < 7; i++) this.MPR[i] = 0xff << 13;
    this.MPR[7] = 0x00;
    this.MPRSelect = 0x01;
  }
  Init() {
    this.RAM.fill(0x00);
    this.RAMMask = 0x1fff;
    this.StorageReset();
  }
}

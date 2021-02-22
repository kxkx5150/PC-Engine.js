'use strict';
class IRQ {
  constructor(core){
    this.Core = core;
    this.TIQFlag = 0x04;
    this.IRQ1Flag = 0x02;
    this.IRQ2Flag = 0x01;
    this.INTTIQ = 0x00;
    this.INTIRQ2 = 0x00;
    this.IntDisableRegister = 0x00; 
  }
  GetIntStatus() {
    return ~this.IntDisableRegister & this.GetIntReqest();
  }
  GetIntDisable() {
    return this.IntDisableRegister;
  }
  SetIntDisable(data) {
    this.IntDisableRegister = data;
    this.Core.timer.TimerAcknowledge();
  }
  GetIntReqest() {
    return (
      (((this.Core.vdc.VDC[0].VDCStatus | this.Core.vdc.VDC[1].VDCStatus) & 0x3f) != 0x00 ? this.IRQ1Flag : 0x00) |
      this.INTIRQ2 |
      this.INTTIQ
    );
  }
  SetIntReqest(data) {
    this.Core.timer.TimerAcknowledge();
  }
  Init() {
    this.Reset();
  }
  Reset() {
    this.TIQFlag = 0x04;
    this.IRQ1Flag = 0x02;
    this.IRQ2Flag = 0x01;
    this.INTTIQ = 0x00;
    this.INTIRQ2 = 0x00;
    this.IntDisableRegister = 0x00; 
  }
}

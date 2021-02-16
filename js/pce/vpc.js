class VPC {
  constructor(core) {
    this.Core = core;
    this.VPCRegister = new Array(8);
    this.VDCSelect = 0;
    this.VPCWindow1 = 0;
    this.VPCWindow2 = 0;
    this.VPCPriority = new Array(4);
  }

  VPCInit() {
    this.VPCRegister.fill(0x00);
    this.VPCRegister[0] = 0x11;
    this.VPCRegister[1] = 0x11;
    this.VPCRegister[7] = 0xff;

    this.VDCSelect = 0;
    this.VPCWindow1 = 0;
    this.VPCWindow2 = 0;
    this.VPCPriority.fill(0x01);
  }

  SetVPC(no, data) {
    if (no == 0x07) return;

    this.VPCRegister[no] = data;
    if (no == 0x06) this.VDCSelect = data & 0x01;

    if (no == 0x02 || no == 0x03) {
      this.VPCWindow1 = (this.VPCRegister[0x02] | ((this.VPCRegister[0x03] & 0x03) << 8)) - 64;
      if (this.VPCWindow1 < 0) this.VPCWindow1 = 1024;
    }

    if (no == 0x04 || no == 0x05) {
      this.VPCWindow2 = (this.VPCRegister[0x04] | ((this.VPCRegister[0x05] & 0x03) << 8)) - 64;
      if (this.VPCWindow2 < 0) this.VPCWindow2 = -1;
    }

    if (no == 0x00) {
      this.VPCPriority[2] = this.VPCRegister[0x00] >> 4;
      this.VPCPriority[3] = this.VPCRegister[0x00] & 0x0f;
    }

    if (no == 0x01) {
      this.VPCPriority[0] = this.VPCRegister[0x01] >> 4;
      this.VPCPriority[1] = this.VPCRegister[0x01] & 0x0f;
    }
  }

  GetVPC(no) {
    return this.VPCRegister[no];
  }
}

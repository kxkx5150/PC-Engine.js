"use strict";
class CPU {
  constructor(core, mem) {
    this.Core = core;
    this.mem = mem;
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.PC = 0;
    this.S = 0;
    this.P = 0;
    this.NFlag = 0x80;
    this.VFlag = 0x40;
    this.TFlag = 0x20;
    this.BFlag = 0x10;
    this.DFlag = 0x08;
    this.IFlag = 0x04;
    this.ZFlag = 0x02;
    this.CFlag = 0x01;
    this.ProgressClock = 0;
    this.CPUBaseClock = 0;
    this.BaseClock1 = 12;
    this.BaseClock3 = 6;
    this.BaseClock5 = 4;
    this.BaseClock7 = 3;
    this.BaseClock10 = 2;
    this.TransferSrc = 0;
    this.TransferDist = 0;
    this.TransferLen = 0;
    this.TransferAlt = 0;

    this.NZCacheTable = new Array(0x100).fill(0x00);
    this.NZCacheTable = this.NZCacheTable.map((d, i) => {
      return i & 0x80;
    });
    this.NZCacheTable[0x00] = 0x02;
    this.OpCycles = [
      8, 7, 3, 4, 6, 4, 6, 7, 3, 2, 2, 2, 7, 5, 7, 6, 2, 7, 7, 4, 6, 4, 6, 7, 2,
      5, 2, 2, 7, 5, 7, 6, 7, 7, 3, 4, 4, 4, 6, 7, 3, 2, 2, 2, 5, 5, 7, 6, 2, 7,
      7, 2, 4, 4, 6, 7, 2, 5, 2, 2, 5, 5, 7, 6, 7, 7, 3, 4, 8, 4, 6, 7, 3, 2, 2,
      2, 4, 5, 7, 6, 2, 7, 7, 5, 2, 4, 6, 7, 2, 5, 3, 2, 2, 5, 7, 6, 7, 7, 2, 2,
      4, 4, 6, 7, 3, 2, 2, 2, 7, 5, 7, 6, 2, 7, 7, 0, 4, 4, 6, 7, 2, 5, 3, 2, 7,
      5, 7, 6, 4, 7, 2, 7, 4, 4, 4, 7, 2, 2, 2, 2, 5, 5, 5, 6, 2, 7, 7, 8, 4, 4,
      4, 7, 2, 5, 2, 2, 5, 5, 5, 6, 2, 7, 2, 7, 4, 4, 4, 7, 2, 2, 2, 2, 5, 5, 5,
      6, 2, 7, 7, 8, 4, 4, 4, 7, 2, 5, 2, 2, 5, 5, 5, 6, 2, 7, 2, 0, 4, 4, 6, 7,
      2, 2, 2, 2, 5, 5, 7, 6, 2, 7, 7, 0, 2, 4, 6, 7, 2, 5, 3, 2, 2, 5, 7, 6, 2,
      7, 2, 0, 4, 4, 6, 7, 2, 2, 2, 2, 5, 5, 7, 6, 2, 7, 7, 0, 2, 4, 6, 7, 2, 5,
      3, 2, 2, 5, 7, 6,
    ];
    this.OpBytes = [
      0, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 1, 3, 3, 3, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1,
      3, 1, 1, 3, 3, 3, 0, 0, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 1, 3, 3, 3, 0, 0, 2,
      2, 1, 2, 2, 2, 2, 1, 3, 1, 1, 3, 3, 3, 0, 0, 2, 1, 2, 0, 2, 2, 2, 1, 2, 1,
      1, 0, 3, 3, 0, 0, 2, 2, 2, 1, 2, 2, 2, 1, 3, 1, 1, 1, 3, 3, 0, 0, 2, 1, 1,
      2, 2, 2, 2, 1, 2, 1, 1, 0, 3, 3, 0, 0, 2, 2, 0, 2, 2, 2, 2, 1, 3, 1, 1, 0,
      3, 3, 0, 0, 2, 1, 3, 2, 2, 2, 2, 1, 2, 1, 1, 3, 3, 3, 0, 0, 2, 2, 4, 2, 2,
      2, 2, 1, 3, 1, 1, 3, 3, 3, 0, 2, 2, 2, 3, 2, 2, 2, 2, 1, 2, 1, 1, 3, 3, 3,
      0, 0, 2, 2, 4, 2, 2, 2, 2, 1, 3, 1, 1, 3, 3, 3, 0, 2, 2, 1, 0, 2, 2, 2, 2,
      1, 2, 1, 1, 3, 3, 3, 0, 0, 2, 2, 0, 1, 2, 2, 2, 1, 3, 1, 1, 1, 3, 3, 0, 2,
      2, 1, 0, 2, 2, 2, 2, 1, 2, 1, 1, 3, 3, 3, 0, 0, 2, 2, 0, 1, 2, 2, 2, 1, 3,
      1, 1, 1, 3, 3, 0,
    ];
  }
  CPUReset() {
    this.TransferSrc = 0;
    this.TransferDist = 0;
    this.TransferLen = 0;
    this.TransferAlt = 0;
    this.CPUBaseClock = this.BaseClock1;
    this.P |= this.IFlag;
    this.PC = this.mem.Get16(0xfffe);
  }
  CPUInit() {
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.PC = 0;
    this.S = 0;
    this.P = 0x00;
    this.ProgressClock = 0;
    this.CPUBaseClock = this.BaseClock1;
    this.TransferSrc = 0;
    this.TransferDist = 0;
    this.TransferLen = 0;
    this.TransferAlt = 0;
    this.LastInt = 0x00;
  }
  CPURun() {
    this.ProgressClock = 0;
    let tmp = this.LastInt;
    this.LastInt =
      (this.P & this.IFlag) == 0x00 ? this.Core.irq.GetIntStatus() : 0x00;
    if (tmp != 0x00 && this.TransferLen == 0) {
      this.LastInt = 0x00;
      if ((tmp & this.Core.irq.TIQFlag) == this.Core.irq.TIQFlag) {
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Push(this.P);
        this.P = 0x04;
        this.PC = this.mem.Get16(0xfffa);
      } else if ((tmp & this.Core.irq.IRQ1Flag) == this.Core.irq.IRQ1Flag) {
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Push(this.P);
        this.P = 0x04;
        this.PC = this.mem.Get16(0xfff8);
      } else if ((tmp & this.Core.irq.IRQ2Flag) == this.Core.irq.IRQ2Flag) {
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Push(this.P);
        this.P |= this.IFlag;
        this.PC = this.mem.Get16(0xfff6);
      }
      this.ProgressClock = 8 * this.CPUBaseClock;
    } else {
      let op = this.mem.Get(this.PC);
      this.OpExec(op);
    }
  }
  OpExec(op) {
    switch (op) {
      case 0x69:
        this.ADC(this.PC + 1);
        break;
      case 0x65:
        this.ADC(this.ZP());
        break;
      case 0x75:
        this.ADC(this.ZP_X());
        break;
      case 0x72:
        this.ADC(this.IND());
        break;
      case 0x61:
        this.ADC(this.IND_X());
        break;
      case 0x71:
        this.ADC(this.IND_Y());
        break;
      case 0x6d:
        this.ADC(this.ABS());
        break;
      case 0x7d:
        this.ADC(this.ABS_X());
        break;
      case 0x79:
        this.ADC(this.ABS_Y());
        break;
      case 0xe9:
        this.SBC(this.PC + 1);
        break;
      case 0xe5:
        this.SBC(this.ZP());
        break;
      case 0xf5:
        this.SBC(this.ZP_X());
        break;
      case 0xf2:
        this.SBC(this.IND());
        break;
      case 0xe1:
        this.SBC(this.IND_X());
        break;
      case 0xf1:
        this.SBC(this.IND_Y());
        break;
      case 0xed:
        this.SBC(this.ABS());
        break;
      case 0xfd:
        this.SBC(this.ABS_X());
        break;
      case 0xf9:
        this.SBC(this.ABS_Y());
        break;
      case 0x29:
        this.AND(this.PC + 1);
        break;
      case 0x25:
        this.AND(this.ZP());
        break;
      case 0x35:
        this.AND(this.ZP_X());
        break;
      case 0x32:
        this.AND(this.IND());
        break;
      case 0x21:
        this.AND(this.IND_X());
        break;
      case 0x31:
        this.AND(this.IND_Y());
        break;
      case 0x2d:
        this.AND(this.ABS());
        break;
      case 0x3d:
        this.AND(this.ABS_X());
        break;
      case 0x39:
        this.AND(this.ABS_Y());
        break;
      case 0x49:
        this.EOR(this.PC + 1);
        break;
      case 0x45:
        this.EOR(this.ZP());
        break;
      case 0x55:
        this.EOR(this.ZP_X());
        break;
      case 0x52:
        this.EOR(this.IND());
        break;
      case 0x41:
        this.EOR(this.IND_X());
        break;
      case 0x51:
        this.EOR(this.IND_Y());
        break;
      case 0x4d:
        this.EOR(this.ABS());
        break;
      case 0x5d:
        this.EOR(this.ABS_X());
        break;
      case 0x59:
        this.EOR(this.ABS_Y());
        break;
      case 0x09:
        this.ORA(this.PC + 1);
        break;
      case 0x05:
        this.ORA(this.ZP());
        break;
      case 0x15:
        this.ORA(this.ZP_X());
        break;
      case 0x12:
        this.ORA(this.IND());
        break;
      case 0x01:
        this.ORA(this.IND_X());
        break;
      case 0x11:
        this.ORA(this.IND_Y());
        break;
      case 0x0d:
        this.ORA(this.ABS());
        break;
      case 0x1d:
        this.ORA(this.ABS_X());
        break;
      case 0x19:
        this.ORA(this.ABS_Y());
        break;
      case 0x06:
        var address = this.ZP();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x16:
        var address = this.ZP_X();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x0e:
        var address = this.ABS();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x1e:
        var address = this.ABS_X();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x0a:
        this.A = this.ASL(this.A);
        break;
      case 0x46:
        var address = this.ZP();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x56:
        var address = this.ZP_X();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x4e:
        var address = this.ABS();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x5e:
        var address = this.ABS_X();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x4a:
        this.A = this.LSR(this.A);
        break;
      case 0x26:
        var address = this.ZP();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x36:
        var address = this.ZP_X();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x2e:
        var address = this.ABS();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x3e:
        var address = this.ABS_X();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x2a:
        this.A = this.ROL(this.A);
        break;
      case 0x66:
        var address = this.ZP();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x76:
        var address = this.ZP_X();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x6e:
        var address = this.ABS();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x7e:
        var address = this.ABS_X();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x6a:
        this.A = this.ROR(this.A);
        break;
      case 0x0f:
        this.BBRi(0);
        break;
      case 0x1f:
        this.BBRi(1);
        break;
      case 0x2f:
        this.BBRi(2);
        break;
      case 0x3f:
        this.BBRi(3);
        break;
      case 0x4f:
        this.BBRi(4);
        break;
      case 0x5f:
        this.BBRi(5);
        break;
      case 0x6f:
        this.BBRi(6);
        break;
      case 0x7f:
        this.BBRi(7);
        break;
      case 0x8f:
        this.BBSi(0);
        break;
      case 0x9f:
        this.BBSi(1);
        break;
      case 0xaf:
        this.BBSi(2);
        break;
      case 0xbf:
        this.BBSi(3);
        break;
      case 0xcf:
        this.BBSi(4);
        break;
      case 0xdf:
        this.BBSi(5);
        break;
      case 0xef:
        this.BBSi(6);
        break;
      case 0xff:
        this.BBSi(7);
        break;
      case 0x90:
        this.Branch((this.P & this.CFlag) == 0x00, 1);
        break;
      case 0xb0:
        this.Branch((this.P & this.CFlag) == this.CFlag, 1);
        break;
      case 0xd0:
        this.Branch((this.P & this.ZFlag) == 0x00, 1);
        break;
      case 0xf0:
        this.Branch((this.P & this.ZFlag) == this.ZFlag, 1);
        break;
      case 0x10:
        this.Branch((this.P & this.NFlag) == 0x00, 1);
        break;
      case 0x30:
        this.Branch((this.P & this.NFlag) == this.NFlag, 1);
        break;
      case 0x50:
        this.Branch((this.P & this.VFlag) == 0x00, 1);
        break;
      case 0x70:
        this.Branch((this.P & this.VFlag) == this.VFlag, 1);
        break;
      case 0x80:
        this.Branch(true, 1);
        break;
      case 0x44:
        this.PC++;
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Branch(true, 0);
        break;
      case 0x20:
        var tmp = this.ABS();
        this.PC += 2;
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.PC = tmp;
        this.P &= ~this.TFlag;
        break;
      case 0x40:
        this.P = this.Pull();
        this.toPCL(this.Pull());
        this.toPCH(this.Pull());
        break;
      case 0x60:
        this.P &= ~this.TFlag;
        this.toPCL(this.Pull());
        this.toPCH(this.Pull());
        this.PC++;
        break;
      case 0x4c:
        this.PC = this.ABS();
        this.P &= ~this.TFlag;
        break;
      case 0x6c:
        this.PC = this.ABS_IND();
        this.P &= ~this.TFlag;
        break;
      case 0x7c:
        this.PC = this.ABS_X_IND();
        this.P &= ~this.TFlag;
        break;
      case 0x00:
        this.PC += 2;
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.P |= this.BFlag;
        this.Push(this.P);
        this.P &= ~this.DFlag;
        this.P &= ~this.TFlag;
        this.P |= this.IFlag;
        this.PC = this.mem.Get16(0xfff6);
        break;
      case 0x62:
        this.A = 0x00;
        this.P &= ~this.TFlag;
        break;
      case 0x82:
        this.X = 0x00;
        this.P &= ~this.TFlag;
        break;
      case 0xc2:
        this.Y = 0x00;
        this.P &= ~this.TFlag;
        break;

      case 0x18:
        this.P &= ~this.CFlag;
        this.P &= ~this.TFlag;
        break;
      case 0xd8:
        this.P &= ~this.DFlag;
        this.P &= ~this.TFlag;
        break;
      case 0x58:
        this.P &= ~this.IFlag;
        this.P &= ~this.TFlag;
        break;
      case 0xb8:
        this.P &= ~this.VFlag;
        this.P &= ~this.TFlag;
        break;
      case 0x38:
        this.P |= this.CFlag;
        this.P &= ~this.TFlag;
        break;
      case 0xf8:
        this.P |= this.DFlag;
        this.P &= ~this.TFlag;
        break;
      case 0x78:
        this.P |= this.IFlag;
        this.P &= ~this.TFlag;
        break;
      case 0xf4:
        this.P |= this.TFlag;
        break;
      case 0xc9:
        this.Compare(this.A, this.PC + 1);
        break;
      case 0xc5:
        this.Compare(this.A, this.ZP());
        break;
      case 0xd5:
        this.Compare(this.A, this.ZP_X());
        break;
      case 0xd2:
        this.Compare(this.A, this.IND());
        break;
      case 0xc1:
        this.Compare(this.A, this.IND_X());
        break;
      case 0xd1:
        this.Compare(this.A, this.IND_Y());
        break;
      case 0xcd:
        this.Compare(this.A, this.ABS());
        break;
      case 0xdd:
        this.Compare(this.A, this.ABS_X());
        break;
      case 0xd9:
        this.Compare(this.A, this.ABS_Y());
        break;
      case 0xe0:
        this.Compare(this.X, this.PC + 1);
        break;
      case 0xe4:
        this.Compare(this.X, this.ZP());
        break;
      case 0xec:
        this.Compare(this.X, this.ABS());
        break;
      case 0xc0:
        this.Compare(this.Y, this.PC + 1);
        break;
      case 0xc4:
        this.Compare(this.Y, this.ZP());
        break;
      case 0xcc:
        this.Compare(this.Y, this.ABS());
        break;
      case 0xc6:
        var address = this.ZP();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0xd6:
        var address = this.ZP_X();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0xce:
        var address = this.ABS();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0xde:
        var address = this.ABS_X();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0x3a:
        this.A = this.Decrement(this.A);
        break;
      case 0xca:
        this.X = this.Decrement(this.X);
        break;
      case 0x88:
        this.Y = this.Decrement(this.Y);
        break;
      case 0xe6:
        var address = this.ZP();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0xf6:
        var address = this.ZP_X();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0xee:
        var address = this.ABS();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0xfe:
        var address = this.ABS_X();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0x1a:
        this.A = this.Increment(this.A);
        break;
      case 0xe8:
        this.X = this.Increment(this.X);
        break;
      case 0xc8:
        this.Y = this.Increment(this.Y);
        break;
      case 0x48:
        this.Push(this.A);
        this.P &= ~this.TFlag;
        break;
      case 0x08:
        this.Push(this.P);
        this.P &= ~this.TFlag;
        break;
      case 0xda:
        this.Push(this.X);
        this.P &= ~this.TFlag;
        break;
      case 0x5a:
        this.Push(this.Y);
        this.P &= ~this.TFlag;
        break;
      case 0x68:
        this.A = this.Pull();
        this.SetNZFlag(this.A);
        this.P &= ~this.TFlag;
        break;
      case 0x28:
        this.P = this.Pull();
        break;
      case 0xfa:
        this.X = this.Pull();
        this.SetNZFlag(this.X);
        this.P &= ~this.TFlag;
        break;
      case 0x7a:
        this.Y = this.Pull();
        this.SetNZFlag(this.Y);
        this.P &= ~this.TFlag;
        break;
      case 0x07:
        this.RMBi(0);
        break;
      case 0x17:
        this.RMBi(1);
        break;
      case 0x27:
        this.RMBi(2);
        break;
      case 0x37:
        this.RMBi(3);
        break;
      case 0x47:
        this.RMBi(4);
        break;
      case 0x57:
        this.RMBi(5);
        break;
      case 0x67:
        this.RMBi(6);
        break;
      case 0x77:
        this.RMBi(7);
        break;
      case 0x87:
        this.SMBi(0);
        break;
      case 0x97:
        this.SMBi(1);
        break;
      case 0xa7:
        this.SMBi(2);
        break;
      case 0xb7:
        this.SMBi(3);
        break;
      case 0xc7:
        this.SMBi(4);
        break;
      case 0xd7:
        this.SMBi(5);
        break;
      case 0xe7:
        this.SMBi(6);
        break;
      case 0xf7:
        this.SMBi(7);
        break;
      case 0x22:
        var tmp = this.A;
        this.A = this.X;
        this.X = tmp;
        this.P &= ~this.TFlag;
        break;
      case 0x42:
        var tmp = this.A;
        this.A = this.Y;
        this.Y = tmp;
        this.P &= ~this.TFlag;
        break;
      case 0x02:
        var tmp = this.X;
        this.X = this.Y;
        this.Y = tmp;
        this.P &= ~this.TFlag;
        break;
      case 0xaa:
        this.X = this.A;
        this.SetNZFlag(this.X);
        this.P &= ~this.TFlag;
        break;
      case 0xa8:
        this.Y = this.A;
        this.SetNZFlag(this.Y);
        this.P &= ~this.TFlag;
        break;
      case 0xba:
        this.X = this.S;
        this.SetNZFlag(this.X);
        this.P &= ~this.TFlag;
        break;
      case 0x8a:
        this.A = this.X;
        this.SetNZFlag(this.A);
        this.P &= ~this.TFlag;
        break;
      case 0x9a:
        this.S = this.X;
        this.P &= ~this.TFlag;
        break;
      case 0x98:
        this.A = this.Y;
        this.SetNZFlag(this.A);
        this.P &= ~this.TFlag;
        break;
      case 0x89:
        this.BIT(this.PC + 1);
        break;
      case 0x24:
        this.BIT(this.ZP());
        break;
      case 0x34:
        this.BIT(this.ZP_X());
        break;
      case 0x2c:
        this.BIT(this.ABS());
        break;
      case 0x3c:
        this.BIT(this.ABS_X());
        break;
      case 0x83:
        this.TST(this.PC + 1, 0x2000 | this.mem.Get(this.PC + 2));
        break;
      case 0xa3:
        this.TST(
          this.PC + 1,
          0x2000 | ((this.mem.Get(this.PC + 2) + this.X) & 0xff)
        );
        break;
      case 0x93:
        this.TST(this.PC + 1, this.mem.Get16(this.PC + 2));
        break;
      case 0xb3:
        this.TST(this.PC + 1, (this.mem.Get16(this.PC + 2) + this.X) & 0xffff);
        break;
      case 0x14:
        this.TRB(this.ZP());
        break;
      case 0x1c:
        this.TRB(this.ABS());
        break;
      case 0x04:
        this.TSB(this.ZP());
        break;
      case 0x0c:
        this.TSB(this.ABS());
        break;
      case 0xa9:
        this.A = this.Load(this.PC + 1);
        break;
      case 0xa5:
        this.A = this.Load(this.ZP());
        break;
      case 0xb5:
        this.A = this.Load(this.ZP_X());
        break;
      case 0xb2:
        this.A = this.Load(this.IND());
        break;
      case 0xa1:
        this.A = this.Load(this.IND_X());
        break;
      case 0xb1:
        this.A = this.Load(this.IND_Y());
        break;
      case 0xad:
        this.A = this.Load(this.ABS());
        break;
      case 0xbd:
        this.A = this.Load(this.ABS_X());
        break;
      case 0xb9:
        this.A = this.Load(this.ABS_Y());
        break;
      case 0xa2:
        this.X = this.Load(this.PC + 1);
        break;
      case 0xa6:
        this.X = this.Load(this.ZP());
        break;
      case 0xb6:
        this.X = this.Load(this.ZP_Y());
        break;
      case 0xae:
        this.X = this.Load(this.ABS());
        break;
      case 0xbe:
        this.X = this.Load(this.ABS_Y());
        break;
      case 0xa0:
        this.Y = this.Load(this.PC + 1);
        break;
      case 0xa4:
        this.Y = this.Load(this.ZP());
        break;
      case 0xb4:
        this.Y = this.Load(this.ZP_X());
        break;
      case 0xac:
        this.Y = this.Load(this.ABS());
        break;
      case 0xbc:
        this.Y = this.Load(this.ABS_X());
        break;
      case 0x85:
        this.Store(this.ZP(), this.A);
        break;
      case 0x95:
        this.Store(this.ZP_X(), this.A);
        break;
      case 0x92:
        this.Store(this.IND(), this.A);
        break;
      case 0x81:
        this.Store(this.IND_X(), this.A);
        break;
      case 0x91:
        this.Store(this.IND_Y(), this.A);
        break;
      case 0x8d:
        this.Store(this.ABS(), this.A);
        break;
      case 0x9d:
        this.Store(this.ABS_X(), this.A);
        break;
      case 0x99:
        this.Store(this.ABS_Y(), this.A);
        break;
      case 0x86:
        this.Store(this.ZP(), this.X);
        break;
      case 0x96:
        this.Store(this.ZP_Y(), this.X);
        break;
      case 0x8e:
        this.Store(this.ABS(), this.X);
        break;
      case 0x84:
        this.Store(this.ZP(), this.Y);
        break;
      case 0x94:
        this.Store(this.ZP_X(), this.Y);
        break;
      case 0x8c:
        this.Store(this.ABS(), this.Y);
        break;
      case 0x64:
        this.Store(this.ZP(), 0x00);
        break;
      case 0x74:
        this.Store(this.ZP_X(), 0x00);
        break;
      case 0x9c:
        this.Store(this.ABS(), 0x00);
        break;
      case 0x9e:
        this.Store(this.ABS_X(), 0x00);
        break;
      case 0xea:
        this.P &= ~this.TFlag;
        break;
      case 0x03:
        this.Core.vdc.SetVDCRegister(
          this.mem.Get(this.PC + 1),
          this.Core.vpc.VDCSelect
        );
        this.P &= ~this.TFlag;
        break;
      case 0x13:
        this.Core.vdc.SetVDCLow(
          this.mem.Get(this.PC + 1),
          this.Core.vpc.VDCSelect
        );
        this.P &= ~this.TFlag;
        break;
      case 0x23:
        this.Core.vdc.SetVDCHigh(
          this.mem.Get(this.PC + 1),
          this.Core.vpc.VDCSelect
        );
        this.P &= ~this.TFlag;
        break;
      case 0x53:
        var data = this.mem.Get(this.PC + 1);
        var bit = 0x01;
        if (data == 0x00) data = this.mem.MPRSelect;
        else this.mem.MPRSelect = data;
        for (var i = 0; i < 8; i++)
          if ((data & (bit << i)) != 0x00) this.mem.MPR[i] = this.A << 13;
        break;
      case 0x43:
        var data = this.mem.Get(this.PC + 1);
        var bit = 0x01;
        if (data == 0x00) data = this.mem.MPRSelect;
        else this.mem.MPRSelect = data;
        for (var i = 0; i < 8; i++)
          if ((data & (bit << i)) != 0x00) this.A = this.mem.MPR[i] >>> 13;
        break;
      case 0xf3:
        if (this.TransferLen == 0) {
          this.TransferSrc = this.mem.Get16(this.PC + 1);
          this.TransferDist = this.mem.Get16(this.PC + 3);
          this.TransferLen = this.mem.Get16(this.PC + 5);
          this.TransferAlt = 1;
          this.ProgressClock = 17;
        }
        this.mem.Set(this.TransferDist, this.mem.Get(this.TransferSrc));
        this.TransferSrc = (this.TransferSrc + this.TransferAlt) & 0xffff;
        this.TransferDist = (this.TransferDist + 1) & 0xffff;
        this.TransferLen = (this.TransferLen - 1) & 0xffff;
        this.TransferAlt = this.TransferAlt == 1 ? -1 : 1;
        this.ProgressClock += 6;
        if (this.TransferLen == 0) {
          this.P &= ~this.TFlag;
          this.PC += 7;
        }
        break;
      case 0xc3:
        if (this.TransferLen == 0) {
          this.TransferSrc = this.mem.Get16(this.PC + 1);
          this.TransferDist = this.mem.Get16(this.PC + 3);
          this.TransferLen = this.mem.Get16(this.PC + 5);
          this.ProgressClock = 17;
        }
        this.mem.Set(this.TransferDist, this.mem.Get(this.TransferSrc));
        this.TransferSrc = (this.TransferSrc - 1) & 0xffff;
        this.TransferDist = (this.TransferDist - 1) & 0xffff;
        this.TransferLen = (this.TransferLen - 1) & 0xffff;
        this.ProgressClock += 6;
        if (this.TransferLen == 0) {
          this.P &= ~this.TFlag;
          this.PC += 7;
        }
        break;
      case 0xe3:
        if (this.TransferLen == 0) {
          this.TransferSrc = this.mem.Get16(this.PC + 1);
          this.TransferDist = this.mem.Get16(this.PC + 3);
          this.TransferLen = this.mem.Get16(this.PC + 5);
          this.TransferAlt = 1;
          this.ProgressClock = 17;
        }
        this.mem.Set(this.TransferDist, this.mem.Get(this.TransferSrc));
        this.TransferSrc = (this.TransferSrc + 1) & 0xffff;
        this.TransferDist = (this.TransferDist + this.TransferAlt) & 0xffff;
        this.TransferLen = (this.TransferLen - 1) & 0xffff;
        this.TransferAlt = this.TransferAlt == 1 ? -1 : 1;
        this.ProgressClock += 6;
        if (this.TransferLen == 0) {
          this.P &= ~this.TFlag;
          this.PC += 7;
        }
        break;
      case 0x73:
        if (this.TransferLen == 0) {
          this.TransferSrc = this.mem.Get16(this.PC + 1);
          this.TransferDist = this.mem.Get16(this.PC + 3);
          this.TransferLen = this.mem.Get16(this.PC + 5);
          this.ProgressClock = 17;
        }
        this.mem.Set(this.TransferDist, this.mem.Get(this.TransferSrc));
        this.TransferSrc = (this.TransferSrc + 1) & 0xffff;
        this.TransferDist = (this.TransferDist + 1) & 0xffff;
        this.TransferLen = (this.TransferLen - 1) & 0xffff;
        this.ProgressClock += 6;
        if (this.TransferLen == 0) {
          this.P &= ~this.TFlag;
          this.PC += 7;
        }
        break;
      case 0xd3:
        if (this.TransferLen == 0) {
          this.TransferSrc = this.mem.Get16(this.PC + 1);
          this.TransferDist = this.mem.Get16(this.PC + 3);
          this.TransferLen = this.mem.Get16(this.PC + 5);
          this.ProgressClock = 17;
        }
        this.mem.Set(this.TransferDist, this.mem.Get(this.TransferSrc));
        this.TransferSrc = (this.TransferSrc + 1) & 0xffff;
        this.TransferLen = (this.TransferLen - 1) & 0xffff;
        this.ProgressClock += 6;
        if (this.TransferLen == 0) {
          this.P &= ~this.TFlag;
          this.PC += 7;
        }
        break;
      case 0xd4:
        this.P &= ~this.TFlag;
        this.CPUBaseClock = this.BaseClock7;
        break;
      case 0x54:
        this.P &= ~this.TFlag;
        this.CPUBaseClock = this.BaseClock1;
        break;
      default:
        this.P &= ~this.TFlag;
        break;
    }
    this.PC += this.OpBytes[op];
    this.ProgressClock =
      (this.ProgressClock + this.OpCycles[op]) * this.CPUBaseClock;
  }
  Adder(address, neg) {
    let data0;
    let data1 = this.mem.Get(address);
    if (!neg && (this.P & this.TFlag) == this.TFlag) {
      this.ProgressClock = 3;
      data0 = this.mem.Get(0x2000 | this.X);
    } else data0 = this.A;
    if (neg) data1 = ~data1 & 0xff;
    let carry = this.P & 0x01;
    let tmp = data0 + data1 + carry;
    if ((this.P & this.DFlag) == 0x00) {
      if ((((~data0 & ~data1 & tmp) | (data0 & data1 & ~tmp)) & 0x80) == 0x80)
        this.P |= this.VFlag;
      else this.P &= ~this.VFlag;
    } else {
      this.ProgressClock += 1;
      if (neg) {
        if ((tmp & 0x0f) > 0x09) tmp -= 0x06;
        if ((tmp & 0xf0) > 0x90) tmp -= 0x60;
      } else {
        if ((data0 & 0x0f) + (data1 & 0x0f) + carry > 0x09) tmp += 0x06;
        if ((tmp & 0x1f0) > 0x90) tmp += 0x60;
      }
    }
    if (tmp > 0xff) this.P |= this.CFlag;
    else this.P &= ~this.CFlag;
    tmp &= 0xff;
    this.SetNZFlag(tmp);
    if (!neg && (this.P & this.TFlag) == this.TFlag)
      this.mem.Set(0x2000 | this.X, tmp);
    else this.A = tmp;
    this.P &= ~this.TFlag;
  }
  ADC(address) {
    this.Adder(address, false);
  }
  SBC(address) {
    this.Adder(address, true);
  }
  AND(address) {
    let data0;
    let data1 = this.mem.Get(address);
    if ((this.P & this.TFlag) == 0x00) {
      data0 = this.A;
    } else {
      this.ProgressClock = 3;
      data0 = this.mem.Get(0x2000 | this.X);
    }
    let tmp = data0 & data1;
    this.SetNZFlag(tmp);
    if ((this.P & this.TFlag) == 0x00) this.A = tmp;
    else this.mem.Set(0x2000 | this.X, tmp);
    this.P &= ~this.TFlag;
  }
  EOR(address) {
    let data0;
    let data1 = this.mem.Get(address);
    if ((this.P & this.TFlag) == 0x00) {
      data0 = this.A;
    } else {
      this.ProgressClock = 3;
      data0 = this.mem.Get(0x2000 | this.X);
    }
    let tmp = data0 ^ data1;
    this.SetNZFlag(tmp);
    if ((this.P & this.TFlag) == 0x00) this.A = tmp;
    else this.mem.Set(0x2000 | this.X, tmp);
    this.P &= ~this.TFlag;
  }
  ORA(address) {
    let data0;
    let data1 = this.mem.Get(address);
    if ((this.P & this.TFlag) == 0x00) {
      data0 = this.A;
    } else {
      this.ProgressClock = 3;
      data0 = this.mem.Get(0x2000 | this.X);
    }
    let tmp = data0 | data1;
    this.SetNZFlag(tmp);
    if ((this.P & this.TFlag) == 0x00) this.A = tmp;
    else this.mem.Set(0x2000 | this.X, tmp);
    this.P &= ~this.TFlag;
  }
  ASL(data) {
    data <<= 1;
    if (data > 0xff) this.P |= this.CFlag;
    else this.P &= ~this.CFlag;
    data &= 0xff;
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  LSR(data) {
    if ((data & 0x01) == 0x01) this.P |= this.CFlag;
    else this.P &= ~this.CFlag;
    data >>= 1;
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  ROL(data) {
    data = (data << 1) | (this.P & 0x01);
    if (data > 0xff) this.P |= this.CFlag;
    else this.P &= ~this.CFlag;
    data &= 0xff;
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  ROR(data) {
    let tmp = this.P & this.CFlag;
    if ((data & 0x01) == 0x01) this.P |= this.CFlag;
    else this.P &= ~this.CFlag;
    data = (data >> 1) | (tmp << 7);
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  BBRi(bit) {
    let tmp = this.mem.Get(this.ZP());
    tmp = (tmp >> bit) & 0x01;
    this.Branch(tmp == 0, 2);
  }
  BBSi(bit) {
    let tmp = this.mem.Get(this.ZP());
    tmp = (tmp >> bit) & 0x01;
    this.Branch(tmp == 1, 2);
  }
  Branch(status, adr) {
    this.P &= ~this.TFlag;
    if (status) {
      let tmp = this.mem.Get(this.PC + adr);
      if (tmp >= 0x80) tmp |= 0xff00;
      this.PC = (this.PC + adr + 1 + tmp) & 0xffff;
      this.ProgressClock = 2;
    } else this.PC += adr + 1;
  }
  Compare(data0, data1) {
    data0 -= this.mem.Get(data1);
    if (data0 < 0) this.P &= ~this.CFlag;
    else this.P |= this.CFlag;
    this.P &= ~this.TFlag;
    this.SetNZFlag(data0 & 0xff);
  }
  Decrement(data) {
    data = (data - 1) & 0xff;
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  Increment(data) {
    data = (data + 1) & 0xff;
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  Push(data) {
    this.mem.Set(0x2100 | this.S, data);
    this.S = (this.S - 1) & 0xff;
  }
  Pull() {
    this.S = (this.S + 1) & 0xff;
    return this.mem.Get(0x2100 | this.S);
  }
  RMBi(bit) {
    let address = this.ZP();
    this.mem.Set(address, this.mem.Get(address) & ~(0x01 << bit));
    this.P &= ~this.TFlag;
  }
  SMBi(bit) {
    let address = this.ZP();
    this.mem.Set(address, this.mem.Get(address) | (0x01 << bit));
    this.P &= ~this.TFlag;
  }
  BIT(address) {
    let tmp = this.mem.Get(address);
    this.SetNZFlag(this.A & tmp);
    this.P =
      (this.P & ~(this.NFlag | this.VFlag)) | (tmp & (this.NFlag | this.VFlag));
    this.P &= ~this.TFlag;
  }
  TST(address0, address1) {
    let tmp0 = this.mem.Get(address0);
    let tmp1 = this.mem.Get(address1);
    this.SetNZFlag(tmp0 & tmp1);
    this.P =
      (this.P & ~(this.NFlag | this.VFlag)) |
      (tmp1 & (this.NFlag | this.VFlag));
    this.P &= ~this.TFlag;
  }
  TRB(address) {
    let tmp = this.mem.Get(address);
    let res = ~this.A & tmp;
    this.mem.Set(address, res);
    this.SetNZFlag(res);
    this.P =
      (this.P & ~(this.NFlag | this.VFlag)) | (tmp & (this.NFlag | this.VFlag));
    this.P &= ~this.TFlag;
  }
  TSB(address) {
    let tmp = this.mem.Get(address);
    let res = this.A | tmp;
    this.mem.Set(address, res);
    this.SetNZFlag(res);
    this.P =
      (this.P & ~(this.NFlag | this.VFlag)) | (tmp & (this.NFlag | this.VFlag));
    this.P &= ~this.TFlag;
  }
  Load(address) {
    let data = this.mem.Get(address);
    this.SetNZFlag(data);
    this.P &= ~this.TFlag;
    return data;
  }
  Store(address, data) {
    this.mem.Set(address, data);
    this.P &= ~this.TFlag;
  }
  ZP() {
    return 0x2000 | this.mem.Get(this.PC + 1);
  }
  ZP_X() {
    return 0x2000 | ((this.mem.Get(this.PC + 1) + this.X) & 0xff);
  }
  ZP_Y() {
    return 0x2000 | ((this.mem.Get(this.PC + 1) + this.Y) & 0xff);
  }
  IND() {
    return this.mem.Get16(0x2000 | this.mem.Get(this.PC + 1));
  }
  IND_X() {
    return this.mem.Get16(
      0x2000 | ((this.mem.Get(this.PC + 1) + this.X) & 0xff)
    );
  }
  IND_Y() {
    return (
      (this.mem.Get16(0x2000 | this.mem.Get(this.PC + 1)) + this.Y) & 0xffff
    );
  }
  ABS() {
    return this.mem.Get16(this.PC + 1);
  }
  ABS_X() {
    return (this.mem.Get16(this.PC + 1) + this.X) & 0xffff;
  }
  ABS_Y() {
    return (this.mem.Get16(this.PC + 1) + this.Y) & 0xffff;
  }
  ABS_IND() {
    return this.mem.Get16(this.mem.Get16(this.PC + 1));
  }
  ABS_X_IND() {
    return this.mem.Get16((this.mem.Get16(this.PC + 1) + this.X) & 0xffff);
  }
  SetNZFlag(data) {
    this.P = (this.P & ~(this.NFlag | this.ZFlag)) | this.NZCacheTable[data];
  }
  PCH() {
    return this.PC >> 8;
  }
  PCL() {
    return this.PC & 0x00ff;
  }
  toPCH(data) {
    this.PC = (this.PC & 0x00ff) | (data << 8);
  }
  toPCL(data) {
    this.PC = (this.PC & 0xff00) | data;
  }
}

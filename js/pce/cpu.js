class CPU {
  constructor(core,mem) {
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
      8,
      7,
      3,
      4,
      6,
      4,
      6,
      7,
      3,
      2,
      2,
      2,
      7,
      5,
      7,
      6, // 0x00
      2,
      7,
      7,
      4,
      6,
      4,
      6,
      7,
      2,
      5,
      2,
      2,
      7,
      5,
      7,
      6, // 0x10
      7,
      7,
      3,
      4,
      4,
      4,
      6,
      7,
      3,
      2,
      2,
      2,
      5,
      5,
      7,
      6, // 0x20
      2,
      7,
      7,
      2,
      4,
      4,
      6,
      7,
      2,
      5,
      2,
      2,
      5,
      5,
      7,
      6, // 0x30
      7,
      7,
      3,
      4,
      8,
      4,
      6,
      7,
      3,
      2,
      2,
      2,
      4,
      5,
      7,
      6, // 0x40
      2,
      7,
      7,
      5,
      2,
      4,
      6,
      7,
      2,
      5,
      3,
      2,
      2,
      5,
      7,
      6, // 0x50
      7,
      7,
      2,
      2,
      4,
      4,
      6,
      7,
      3,
      2,
      2,
      2,
      7,
      5,
      7,
      6, // 0x60
      2,
      7,
      7,
      0,
      4,
      4,
      6,
      7,
      2,
      5,
      3,
      2,
      7,
      5,
      7,
      6, // 0x70
      4,
      7,
      2,
      7,
      4,
      4,
      4,
      7,
      2,
      2,
      2,
      2,
      5,
      5,
      5,
      6, // 0x80
      2,
      7,
      7,
      8,
      4,
      4,
      4,
      7,
      2,
      5,
      2,
      2,
      5,
      5,
      5,
      6, // 0x90
      2,
      7,
      2,
      7,
      4,
      4,
      4,
      7,
      2,
      2,
      2,
      2,
      5,
      5,
      5,
      6, // 0xA0
      2,
      7,
      7,
      8,
      4,
      4,
      4,
      7,
      2,
      5,
      2,
      2,
      5,
      5,
      5,
      6, // 0xB0
      2,
      7,
      2,
      0,
      4,
      4,
      6,
      7,
      2,
      2,
      2,
      2,
      5,
      5,
      7,
      6, // 0xC0
      2,
      7,
      7,
      0,
      2,
      4,
      6,
      7,
      2,
      5,
      3,
      2,
      2,
      5,
      7,
      6, // 0xD0
      2,
      7,
      2,
      0,
      4,
      4,
      6,
      7,
      2,
      2,
      2,
      2,
      5,
      5,
      7,
      6, // 0xE0
      2,
      7,
      7,
      0,
      2,
      4,
      6,
      7,
      2,
      5,
      3,
      2,
      2,
      5,
      7,
      6,
    ]; //0xF0
    this.OpBytes = [
      0,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      3,
      3,
      3,
      0, // 0x00
      0,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      3,
      3,
      3,
      0, // 0x10
      0,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      3,
      3,
      3,
      0, // 0x20
      0,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      3,
      3,
      3,
      0, // 0x30
      0,
      2,
      1,
      2,
      0,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      0,
      3,
      3,
      0, // 0x40
      0,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      1,
      3,
      3,
      0, // 0x50
      0,
      2,
      1,
      1,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      0,
      3,
      3,
      0, // 0x60
      0,
      2,
      2,
      0,
      2,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      0,
      3,
      3,
      0, // 0x70
      0,
      2,
      1,
      3,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      3,
      3,
      3,
      0, // 0x80
      0,
      2,
      2,
      4,
      2,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      3,
      3,
      3,
      0, // 0x90
      2,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      3,
      3,
      3,
      0, // 0xA0
      0,
      2,
      2,
      4,
      2,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      3,
      3,
      3,
      0, // 0xB0
      2,
      2,
      1,
      0,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      3,
      3,
      3,
      0, // 0xC0
      0,
      2,
      2,
      0,
      1,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      1,
      3,
      3,
      0, // 0xD0
      2,
      2,
      1,
      0,
      2,
      2,
      2,
      2,
      1,
      2,
      1,
      1,
      3,
      3,
      3,
      0, // 0xE0
      0,
      2,
      2,
      0,
      1,
      2,
      2,
      2,
      1,
      3,
      1,
      1,
      1,
      3,
      3,
      0,
    ]; //0xF0
  }
  CPUReset() {
    this.TransferSrc = 0;
    this.TransferDist = 0;
    this.TransferLen = 0;
    this.TransferAlt = 0;
    this.CPUBaseClock = this.BaseClock1;
    this.SetIFlag();
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
    this.LastInt = (this.P & this.IFlag) == 0x00 ? this.Core.irq.GetIntStatus() : 0x00;
    if (tmp != 0x00 && this.TransferLen == 0) {
      this.LastInt = 0x00;
      if ((tmp & this.Core.irq.TIQFlag) == this.Core.irq.TIQFlag) {
        //TIQ
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Push(this.P);
        this.P = 0x04;
        this.PC = this.mem.Get16(0xfffa);
      } else if ((tmp & this.Core.irq.IRQ1Flag) == this.Core.irq.IRQ1Flag) {
        //IRQ1
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Push(this.P);
        this.P = 0x04;
        this.PC = this.mem.Get16(0xfff8);
      } else if ((tmp & this.Core.irq.IRQ2Flag) == this.Core.irq.IRQ2Flag) {
        //IRQ2
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Push(this.P);
        this.SetIFlag();
        this.PC = this.mem.Get16(0xfff6);
      }
      this.ProgressClock = 8 * this.CPUBaseClock;
    } else {
      let op = this.mem.Get(this.PC);
      // console.log(this.PC.toString(16));
      this.OpExec(op);
    }
  }
  OpExec(op) {
    let address;
    let tmp;
    let data;
    let bit;
    let i;
    switch (op) {
      case 0x69: // ADC IMM
        this.ADC(this.PC + 1);
        break;
      case 0x65: // ADC ZP
        this.ADC(this.ZP());
        break;
      case 0x75: // ADC ZP, X
        this.ADC(this.ZP_X());
        break;
      case 0x72: // ADC (IND)
        this.ADC(this.IND());
        break;
      case 0x61: // ADC (IND, X)
        this.ADC(this.IND_X());
        break;
      case 0x71: // ADC (IND), Y
        this.ADC(this.IND_Y());
        break;
      case 0x6d: // ADC ABS
        this.ADC(this.ABS());
        break;
      case 0x7d: // ADC ABS, X
        this.ADC(this.ABS_X());
        break;
      case 0x79: // ADC ABS, Y
        this.ADC(this.ABS_Y());
        break;
      case 0xe9: // SBC IMM
        this.SBC(this.PC + 1);
        break;
      case 0xe5: // SBC ZP
        this.SBC(this.ZP());
        break;
      case 0xf5: // SBC ZP, X
        this.SBC(this.ZP_X());
        break;
      case 0xf2: // SBC (IND)
        this.SBC(this.IND());
        break;
      case 0xe1: // SBC (IND, X)
        this.SBC(this.IND_X());
        break;
      case 0xf1: // SBC (IND), Y
        this.SBC(this.IND_Y());
        break;
      case 0xed: // SBC ABS
        this.SBC(this.ABS());
        break;
      case 0xfd: // SBC ABS, X
        this.SBC(this.ABS_X());
        break;
      case 0xf9: // SBC ABS, Y
        this.SBC(this.ABS_Y());
        break;
      case 0x29: // AND IMM
        this.AND(this.PC + 1);
        break;
      case 0x25: // AND ZP
        this.AND(this.ZP());
        break;
      case 0x35: // AND ZP, X
        this.AND(this.ZP_X());
        break;
      case 0x32: // AND (IND)
        this.AND(this.IND());
        break;
      case 0x21: // AND (IND, X)
        this.AND(this.IND_X());
        break;
      case 0x31: // AND (IND), Y
        this.AND(this.IND_Y());
        break;
      case 0x2d: // AND ABS
        this.AND(this.ABS());
        break;
      case 0x3d: // AND ABS, X
        this.AND(this.ABS_X());
        break;
      case 0x39: // AND ABS, Y
        this.AND(this.ABS_Y());
        break;
      case 0x49: // EOR IMM
        this.EOR(this.PC + 1);
        break;
      case 0x45: // EOR ZP
        this.EOR(this.ZP());
        break;
      case 0x55: // EOR ZP, X
        this.EOR(this.ZP_X());
        break;
      case 0x52: // EOR (IND)
        this.EOR(this.IND());
        break;
      case 0x41: // EOR (IND, X)
        this.EOR(this.IND_X());
        break;
      case 0x51: // EOR (IND), Y
        this.EOR(this.IND_Y());
        break;
      case 0x4d: // EOR ABS
        this.EOR(this.ABS());
        break;
      case 0x5d: // EOR ABS, X
        this.EOR(this.ABS_X());
        break;
      case 0x59: // EOR ABS, Y
        this.EOR(this.ABS_Y());
        break;
      case 0x09: // ORA IMM
        this.ORA(this.PC + 1);
        break;
      case 0x05: // ORA ZP
        this.ORA(this.ZP());
        break;
      case 0x15: // ORA ZP, X
        this.ORA(this.ZP_X());
        break;
      case 0x12: // ORA (IND)
        this.ORA(this.IND());
        break;
      case 0x01: // ORA (IND, X)
        this.ORA(this.IND_X());
        break;
      case 0x11: // ORA (IND), Y
        this.ORA(this.IND_Y());
        break;
      case 0x0d: // ORA ABS
        this.ORA(this.ABS());
        break;
      case 0x1d: // ORA ABS, X
        this.ORA(this.ABS_X());
        break;
      case 0x19: // ORA ABS, Y
        this.ORA(this.ABS_Y());
        break;
      case 0x06: // ASL ZP
        address = this.ZP();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x16: // ASL ZP, X
        address = this.ZP_X();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x0e: // ASL ABS
        address = this.ABS();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x1e: // ASL ABS, X
        address = this.ABS_X();
        this.mem.Set(address, this.ASL(this.mem.Get(address)));
        break;
      case 0x0a: // ASL A
        this.A = this.ASL(this.A);
        break;
      case 0x46: // LSR ZP
        address = this.ZP();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x56: // LSR ZP, X
        address = this.ZP_X();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x4e: // LSR ABS
        address = this.ABS();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x5e: // LSR ABS, X
        address = this.ABS_X();
        this.mem.Set(address, this.LSR(this.mem.Get(address)));
        break;
      case 0x4a: // LSR A
        this.A = this.LSR(this.A);
        break;
      case 0x26: // ROL ZP
        address = this.ZP();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x36: // ROL ZP, X
        address = this.ZP_X();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x2e: // ROL ABS
        address = this.ABS();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x3e: // ROL ABS, X
        address = this.ABS_X();
        this.mem.Set(address, this.ROL(this.mem.Get(address)));
        break;
      case 0x2a: // ROL A
        this.A = this.ROL(this.A);
        break;
      case 0x66: // ROR ZP
        address = this.ZP();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x76: // ROR ZP, X
        address = this.ZP_X();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x6e: // ROR ABS
        address = this.ABS();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x7e: // ROR ABS, X
        address = this.ABS_X();
        this.mem.Set(address, this.ROR(this.mem.Get(address)));
        break;
      case 0x6a: // ROR A
        this.A = this.ROR(this.A);
        break;
      case 0x0f: // BBR0
        this.BBRi(0);
        break;
      case 0x1f: // BBR1
        this.BBRi(1);
        break;
      case 0x2f: // BBR2
        this.BBRi(2);
        break;
      case 0x3f: // BBR3
        this.BBRi(3);
        break;
      case 0x4f: // BBR4
        this.BBRi(4);
        break;
      case 0x5f: // BBR5
        this.BBRi(5);
        break;
      case 0x6f: // BBR6
        this.BBRi(6);
        break;
      case 0x7f: // BBR7
        this.BBRi(7);
        break;
      case 0x8f: // BBS0
        this.BBSi(0);
        break;
      case 0x9f: // BBS1
        this.BBSi(1);
        break;
      case 0xaf: // BBS2
        this.BBSi(2);
        break;
      case 0xbf: // BBS3
        this.BBSi(3);
        break;
      case 0xcf: // BBS4
        this.BBSi(4);
        break;
      case 0xdf: // BBS5
        this.BBSi(5);
        break;
      case 0xef: // BBS6
        this.BBSi(6);
        break;
      case 0xff: // BBS7
        this.BBSi(7);
        break;
      case 0x90: // BCC
        this.Branch((this.P & this.CFlag) == 0x00, 1);
        break;
      case 0xb0: // BCS
        this.Branch((this.P & this.CFlag) == this.CFlag, 1);
        break;
      case 0xd0: // BNE
        this.Branch((this.P & this.ZFlag) == 0x00, 1);
        break;
      case 0xf0: // BEQ
        this.Branch((this.P & this.ZFlag) == this.ZFlag, 1);
        break;
      case 0x10: // BPL
        this.Branch((this.P & this.NFlag) == 0x00, 1);
        break;
      case 0x30: // BMI
        this.Branch((this.P & this.NFlag) == this.NFlag, 1);
        break;
      case 0x50: // BVC
        this.Branch((this.P & this.VFlag) == 0x00, 1);
        break;
      case 0x70: // BVS
        this.Branch((this.P & this.VFlag) == this.VFlag, 1);
        break;
      case 0x80: // BRA
        this.Branch(true, 1);
        break;
      case 0x44: // BSR
        this.PC++;
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.Branch(true, 0);
        break;
      case 0x20: // JSR ABS
        tmp = this.ABS();
        this.PC += 2;
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.PC = tmp;
        this.ClearTFlag();
        break;
      case 0x40: // RTI
        this.P = this.Pull();
        this.toPCL(this.Pull());
        this.toPCH(this.Pull());
        break;
      case 0x60: // RTS
        this.ClearTFlag();
        this.toPCL(this.Pull());
        this.toPCH(this.Pull());
        this.PC++;
        break;
      case 0x4c: // JMP ABS
        this.PC = this.ABS();
        this.ClearTFlag();
        break;
      case 0x6c: // JMP (ABS)
        this.PC = this.ABS_IND();
        this.ClearTFlag();
        break;
      case 0x7c: // JMP (ABS, X)
        this.PC = this.ABS_X_IND();
        this.ClearTFlag();
        break;
      case 0x00: // BRK
        this.PC += 2;
        this.Push(this.PCH());
        this.Push(this.PCL());
        this.SetBFlag();
        this.Push(this.P);
        this.ClearDFlag();
        this.ClearTFlag();
        this.SetIFlag();
        this.PC = this.mem.Get16(0xfff6);
        break;
      case 0x62: // CLA
        this.A = 0x00;
        this.ClearTFlag();
        break;
      case 0x82: // CLX
        this.X = 0x00;
        this.ClearTFlag();
        break;
      case 0xc2: // CLY
        this.Y = 0x00;
        this.ClearTFlag();
        break;
      case 0x18: // CLC
        this.ClearCFlag();
        this.ClearTFlag();
        break;
      case 0xd8: // CLD
        this.ClearDFlag();
        this.ClearTFlag();
        break;
      case 0x58: // CLI
        this.ClearIFlag();
        this.ClearTFlag();
        break;
      case 0xb8: // CLV
        this.ClearVFlag();
        this.ClearTFlag();
        break;
      case 0x38: // SEC
        this.SetCFlag();
        this.ClearTFlag();
        break;
      case 0xf8: // SED
        this.SetDFlag();
        this.ClearTFlag();
        break;
      case 0x78: // SEI
        this.SetIFlag();
        this.ClearTFlag();
        break;
      case 0xf4: // SET
        this.SetTFlag();
        break;
      case 0xc9: // CMP IMM
        this.Compare(this.A, this.PC + 1);
        break;
      case 0xc5: // CMP ZP
        this.Compare(this.A, this.ZP());
        break;
      case 0xd5: // CMP ZP, X
        this.Compare(this.A, this.ZP_X());
        break;
      case 0xd2: // CMP (IND)
        this.Compare(this.A, this.IND());
        break;
      case 0xc1: // CMP (IND, X)
        this.Compare(this.A, this.IND_X());
        break;
      case 0xd1: // CMP (IND), Y
        this.Compare(this.A, this.IND_Y());
        break;
      case 0xcd: // CMP ABS
        this.Compare(this.A, this.ABS());
        break;
      case 0xdd: // CMP ABS, X
        this.Compare(this.A, this.ABS_X());
        break;
      case 0xd9: // CMP ABS, Y
        this.Compare(this.A, this.ABS_Y());
        break;
      case 0xe0: // CPX IMM
        this.Compare(this.X, this.PC + 1);
        break;
      case 0xe4: // CPX ZP
        this.Compare(this.X, this.ZP());
        break;
      case 0xec: // CPX ABS
        this.Compare(this.X, this.ABS());
        break;
      case 0xc0: // CPY IMM
        this.Compare(this.Y, this.PC + 1);
        break;
      case 0xc4: // CPY ZP
        this.Compare(this.Y, this.ZP());
        break;
      case 0xcc: // CPY ABS
        this.Compare(this.Y, this.ABS());
        break;
      case 0xc6: // DEC ZP
        address = this.ZP();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0xd6: // DEC ZP, X
        address = this.ZP_X();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0xce: // DEC ABS
        address = this.ABS();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0xde: // DEC ABS, X
        address = this.ABS_X();
        this.mem.Set(address, this.Decrement(this.mem.Get(address)));
        break;
      case 0x3a: // DEC A
        this.A = this.Decrement(this.A);
        break;
      case 0xca: // DEX
        this.X = this.Decrement(this.X);
        break;
      case 0x88: // DEY
        this.Y = this.Decrement(this.Y);
        break;
      case 0xe6: // INC ZP
        address = this.ZP();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0xf6: // INC ZP, X
        address = this.ZP_X();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0xee: // INC ABS
        address = this.ABS();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0xfe: // INC ABS, X
        address = this.ABS_X();
        this.mem.Set(address, this.Increment(this.mem.Get(address)));
        break;
      case 0x1a: // INC A
        this.A = this.Increment(this.A);
        break;
      case 0xe8: // INX
        this.X = this.Increment(this.X);
        break;
      case 0xc8: // INY
        this.Y = this.Increment(this.Y);
        break;
      case 0x48: // PHA
        this.Push(this.A);
        this.ClearTFlag();
        break;
      case 0x08: // PHP
        this.Push(this.P);
        this.ClearTFlag();
        break;
      case 0xda: // PHX
        this.Push(this.X);
        this.ClearTFlag();
        break;
      case 0x5a: // PHY
        this.Push(this.Y);
        this.ClearTFlag();
        break;
      case 0x68: // PLA
        this.A = this.Pull();
        this.SetNZFlag(this.A);
        this.ClearTFlag();
        break;
      case 0x28: // PLP
        this.P = this.Pull();
        break;
      case 0xfa: // PLX
        this.X = this.Pull();
        this.SetNZFlag(this.X);
        this.ClearTFlag();
        break;
      case 0x7a: // PLY
        this.Y = this.Pull();
        this.SetNZFlag(this.Y);
        this.ClearTFlag();
        break;
      case 0x07: // RMB0
        this.RMBi(0);
        break;
      case 0x17: // RMB1
        this.RMBi(1);
        break;
      case 0x27: // RMB2
        this.RMBi(2);
        break;
      case 0x37: // RMB3
        this.RMBi(3);
        break;
      case 0x47: // RMB4
        this.RMBi(4);
        break;
      case 0x57: // RMB5
        this.RMBi(5);
        break;
      case 0x67: // RMB6
        this.RMBi(6);
        break;
      case 0x77: // RMB7
        this.RMBi(7);
        break;
      case 0x87: // SMB0
        this.SMBi(0);
        break;
      case 0x97: // SMB1
        this.SMBi(1);
        break;
      case 0xa7: // SMB2
        this.SMBi(2);
        break;
      case 0xb7: // SMB3
        this.SMBi(3);
        break;
      case 0xc7: // SMB4
        this.SMBi(4);
        break;
      case 0xd7: // SMB5
        this.SMBi(5);
        break;
      case 0xe7: // SMB6
        this.SMBi(6);
        break;
      case 0xf7: // SMB7
        this.SMBi(7);
        break;
      case 0x22: // SAX
        tmp = this.A;
        this.A = this.X;
        this.X = tmp;
        this.ClearTFlag();
        break;
      case 0x42: // SAY
        tmp = this.A;
        this.A = this.Y;
        this.Y = tmp;
        this.ClearTFlag();
        break;
      case 0x02: // SXY
        tmp = this.X;
        this.X = this.Y;
        this.Y = tmp;
        this.ClearTFlag();
        break;
      case 0xaa: // TAX
        this.X = this.A;
        this.SetNZFlag(this.X);
        this.ClearTFlag();
        break;
      case 0xa8: // TAY
        this.Y = this.A;
        this.SetNZFlag(this.Y);
        this.ClearTFlag();
        break;
      case 0xba: // TSX
        this.X = this.S;
        this.SetNZFlag(this.X);
        this.ClearTFlag();
        break;
      case 0x8a: // TXA
        this.A = this.X;
        this.SetNZFlag(this.A);
        this.ClearTFlag();
        break;
      case 0x9a: // TXS
        this.S = this.X;
        this.ClearTFlag();
        break;
      case 0x98: // TYA
        this.A = this.Y;
        this.SetNZFlag(this.A);
        this.ClearTFlag();
        break;
      case 0x89: // BIT IMM
        this.BIT(this.PC + 1);
        break;
      case 0x24: // BIT ZP
        this.BIT(this.ZP());
        break;
      case 0x34: // BIT ZP, X
        this.BIT(this.ZP_X());
        break;
      case 0x2c: // BIT ABS
        this.BIT(this.ABS());
        break;
      case 0x3c: // BIT ABS, X
        this.BIT(this.ABS_X());
        break;
      case 0x83: // TST IMM ZP
        this.TST(this.PC + 1, 0x2000 | this.mem.Get(this.PC + 2));
        break;
      case 0xa3: // TST IMM ZP, X
        this.TST(this.PC + 1, 0x2000 | ((this.mem.Get(this.PC + 2) + this.X) & 0xff));
        break;
      case 0x93: // TST IMM ABS
        this.TST(this.PC + 1, this.mem.Get16(this.PC + 2));
        break;
      case 0xb3: // TST IMM ABS, X
        this.TST(this.PC + 1, (this.mem.Get16(this.PC + 2) + this.X) & 0xffff);
        break;
      case 0x14: // TRB ZP
        this.TRB(this.ZP());
        break;
      case 0x1c: // TRB ABS
        this.TRB(this.ABS());
        break;
      case 0x04: // TSB ZP
        this.TSB(this.ZP());
        break;
      case 0x0c: // TSB ABS
        this.TSB(this.ABS());
        break;
      case 0xa9: // LDA IMM
        this.A = this.Load(this.PC + 1);
        break;
      case 0xa5: // LDA ZP
        this.A = this.Load(this.ZP());
        break;
      case 0xb5: // LDA ZP, X
        this.A = this.Load(this.ZP_X());
        break;
      case 0xb2: // LDA (IND)
        this.A = this.Load(this.IND());
        break;
      case 0xa1: // LDA (IND, X)
        this.A = this.Load(this.IND_X());
        break;
      case 0xb1: // LDA (IND), Y
        this.A = this.Load(this.IND_Y());
        break;
      case 0xad: // LDA ABS
        this.A = this.Load(this.ABS());
        break;
      case 0xbd: // LDA ABS, X
        this.A = this.Load(this.ABS_X());
        break;
      case 0xb9: // LDA ABS, Y
        this.A = this.Load(this.ABS_Y());
        break;
      case 0xa2: // LDX IMM
        this.X = this.Load(this.PC + 1);
        break;
      case 0xa6: // LDX ZP
        this.X = this.Load(this.ZP());
        break;
      case 0xb6: // LDX ZP, Y
        this.X = this.Load(this.ZP_Y());
        break;
      case 0xae: // LDX ABS
        this.X = this.Load(this.ABS());
        break;
      case 0xbe: // LDX ABS, Y
        this.X = this.Load(this.ABS_Y());
        break;
      case 0xa0: // LDY IMM
        this.Y = this.Load(this.PC + 1);
        break;
      case 0xa4: // LDY ZP
        this.Y = this.Load(this.ZP());
        break;
      case 0xb4: // LDY ZP, X
        this.Y = this.Load(this.ZP_X());
        break;
      case 0xac: // LDY ABS
        this.Y = this.Load(this.ABS());
        break;
      case 0xbc: // LDY ABS, X
        this.Y = this.Load(this.ABS_X());
        break;
      case 0x85: // STA ZP
        this.Store(this.ZP(), this.A);
        break;
      case 0x95: // STA ZP, X
        this.Store(this.ZP_X(), this.A);
        break;
      case 0x92: // STA (IND)
        this.Store(this.IND(), this.A);
        break;
      case 0x81: // STA (IND, X)
        this.Store(this.IND_X(), this.A);
        break;
      case 0x91: // STA (IND), Y
        this.Store(this.IND_Y(), this.A);
        break;
      case 0x8d: // STA ABS
        this.Store(this.ABS(), this.A);
        break;
      case 0x9d: // STA ABS, X
        this.Store(this.ABS_X(), this.A);
        break;
      case 0x99: // STA ABS, Y
        this.Store(this.ABS_Y(), this.A);
        break;
      case 0x86: // STX ZP
        this.Store(this.ZP(), this.X);
        break;
      case 0x96: // STX ZP, Y
        this.Store(this.ZP_Y(), this.X);
        break;
      case 0x8e: // STX ABS
        this.Store(this.ABS(), this.X);
        break;
      case 0x84: // STY ZP
        this.Store(this.ZP(), this.Y);
        break;
      case 0x94: // STY ZP, X
        this.Store(this.ZP_X(), this.Y);
        break;
      case 0x8c: // STY ABS
        this.Store(this.ABS(), this.Y);
        break;
      case 0x64: // STZ ZP
        this.Store(this.ZP(), 0x00);
        break;
      case 0x74: // STZ ZP, X
        this.Store(this.ZP_X(), 0x00);
        break;
      case 0x9c: // STZ ABS
        this.Store(this.ABS(), 0x00);
        break;
      case 0x9e: // STZ ABS, X
        this.Store(this.ABS_X(), 0x00);
        break;
      case 0xea: // NOP
        this.ClearTFlag();
        break;
      case 0x03: // ST0
        this.Core.vdc.SetVDCRegister(this.mem.Get(this.PC + 1), this.Core.vpc.VDCSelect);
        this.ClearTFlag();
        break;
      case 0x13: // ST1
        this.Core.vdc.SetVDCLow(this.mem.Get(this.PC + 1), this.Core.vpc.VDCSelect);
        this.ClearTFlag();
        break;
      case 0x23: // ST2
        this.Core.vdc.SetVDCHigh(this.mem.Get(this.PC + 1), this.Core.vpc.VDCSelect);
        this.ClearTFlag();
        break;
      case 0x53: // TAMi
        data = this.mem.Get(this.PC + 1);
        bit = 0x01;
        if (data == 0x00) data = this.mem.MPRSelect;
        else this.mem.MPRSelect = data;
        for (i = 0; i < 8; i++) if ((data & (bit << i)) != 0x00) this.mem.MPR[i] = this.A << 13;
        break;
      case 0x43: // TMAi
        data = this.mem.Get(this.PC + 1);
        bit = 0x01;
        if (data == 0x00) data = this.mem.MPRSelect;
        else this.mem.MPRSelect = data;
        for (i = 0; i < 8; i++) if ((data & (bit << i)) != 0x00) this.A = this.mem.MPR[i] >>> 13;
        break;
      case 0xf3: // TAI
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
          this.ClearTFlag();
          this.PC += 7;
        }
        break;
      case 0xc3: // TDD
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
          this.ClearTFlag();
          this.PC += 7;
        }
        break;
      case 0xe3: // TIA
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
          this.ClearTFlag();
          this.PC += 7;
        }
        break;
      case 0x73: // TII
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
          this.ClearTFlag();
          this.PC += 7;
        }
        break;
      case 0xd3: // TIN
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
          this.ClearTFlag();
          this.PC += 7;
        }
        break;
      case 0xd4: // CSH
        this.ClearTFlag();
        this.CPUBaseClock = this.BaseClock7;
        break;
      case 0x54: // CSL
        this.ClearTFlag();
        this.CPUBaseClock = this.BaseClock1;
        break;
      default:
        this.ClearTFlag(); //NOP
        break;
    }
    this.PC += this.OpBytes[op];
    this.ProgressClock = (this.ProgressClock + this.OpCycles[op]) * this.CPUBaseClock;
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
      if ((((~data0 & ~data1 & tmp) | (data0 & data1 & ~tmp)) & 0x80) == 0x80) this.SetVFlag();
      else this.ClearVFlag();
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
    if (tmp > 0xff) this.SetCFlag();
    else this.ClearCFlag();
    tmp &= 0xff;
    this.SetNZFlag(tmp);
    if (!neg && (this.P & this.TFlag) == this.TFlag) this.mem.Set(0x2000 | this.X, tmp);
    else this.A = tmp;
    this.ClearTFlag();
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
    this.ClearTFlag();
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
    this.ClearTFlag();
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
    this.ClearTFlag();
  }
  ASL(data) {
    data <<= 1;
    if (data > 0xff) this.SetCFlag();
    else this.ClearCFlag();
    data &= 0xff;
    this.SetNZFlag(data);
    this.ClearTFlag();
    return data;
  }
  LSR(data) {
    if ((data & 0x01) == 0x01) this.SetCFlag();
    else this.ClearCFlag();
    data >>= 1;
    this.SetNZFlag(data);
    this.ClearTFlag();
    return data;
  }
  ROL(data) {
    data = (data << 1) | (this.P & 0x01);
    if (data > 0xff) this.SetCFlag();
    else this.ClearCFlag();
    data &= 0xff;
    this.SetNZFlag(data);
    this.ClearTFlag();
    return data;
  }
  ROR(data) {
    let tmp = this.P & this.CFlag;
    if ((data & 0x01) == 0x01) this.SetCFlag();
    else this.ClearCFlag();
    data = (data >> 1) | (tmp << 7);
    this.SetNZFlag(data);
    this.ClearTFlag();
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
    this.ClearTFlag();
    if (status) {
      let tmp = this.mem.Get(this.PC + adr);
      if (tmp >= 0x80) tmp |= 0xff00;
      this.PC = (this.PC + adr + 1 + tmp) & 0xffff;
      this.ProgressClock = 2;
    } else this.PC += adr + 1;
  }
  Compare(data0, data1) {
    data0 -= this.mem.Get(data1);
    if (data0 < 0) this.ClearCFlag();
    else this.SetCFlag();
    this.ClearTFlag();
    this.SetNZFlag(data0 & 0xff);
  }
  Decrement(data) {
    data = (data - 1) & 0xff;
    this.SetNZFlag(data);
    this.ClearTFlag();
    return data;
  }
  Increment(data) {
    data = (data + 1) & 0xff;
    this.SetNZFlag(data);
    this.ClearTFlag();
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
    this.ClearTFlag();
  }
  SMBi(bit) {
    let address = this.ZP();
    this.mem.Set(address, this.mem.Get(address) | (0x01 << bit));
    this.ClearTFlag();
  }
  BIT(address) {
    let tmp = this.mem.Get(address);
    this.SetNZFlag(this.A & tmp);
    this.P = (this.P & ~(this.NFlag | this.VFlag)) | (tmp & (this.NFlag | this.VFlag));
    this.ClearTFlag();
  }
  TST(address0, address1) {
    let tmp0 = this.mem.Get(address0);
    let tmp1 = this.mem.Get(address1);
    this.SetNZFlag(tmp0 & tmp1);
    this.P = (this.P & ~(this.NFlag | this.VFlag)) | (tmp1 & (this.NFlag | this.VFlag));
    this.ClearTFlag();
  }
  TRB(address) {
    let tmp = this.mem.Get(address);
    let res = ~this.A & tmp;
    this.mem.Set(address, res);
    this.SetNZFlag(res);
    this.P = (this.P & ~(this.NFlag | this.VFlag)) | (tmp & (this.NFlag | this.VFlag));
    this.ClearTFlag();
  }
  TSB(address) {
    let tmp = this.mem.Get(address);
    let res = this.A | tmp;
    this.mem.Set(address, res);
    this.SetNZFlag(res);
    this.P = (this.P & ~(this.NFlag | this.VFlag)) | (tmp & (this.NFlag | this.VFlag));
    this.ClearTFlag();
  }
  Load(address) {
    let data = this.mem.Get(address);
    this.SetNZFlag(data);
    this.ClearTFlag();
    return data;
  }
  Store(address, data) {
    this.mem.Set(address, data);
    this.ClearTFlag();
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
    return this.mem.Get16(0x2000 | ((this.mem.Get(this.PC + 1) + this.X) & 0xff));
  }
  IND_Y() {
    return (this.mem.Get16(0x2000 | this.mem.Get(this.PC + 1)) + this.Y) & 0xffff;
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
    // Set N Z Flags
    this.P = (this.P & ~(this.NFlag | this.ZFlag)) | this.NZCacheTable[data];
  }
  SetVFlag() {
    // Set V Flag
    this.P |= this.VFlag;
  }
  ClearVFlag() {
    // Clear V Flag
    this.P &= ~this.VFlag;
  }
  SetTFlag() {
    // Set T Flag
    this.P |= this.TFlag;
  }
  ClearTFlag() {
    // Clear T Flag
    this.P &= ~this.TFlag;
  }
  SetBFlag() {
    // Set B Flag
    this.P |= this.BFlag;
  }
  ClearBFlag() {
    // Clear B Flag
    this.P &= ~this.BFlag;
  }
  SetDFlag() {
    // Set D Flag
    this.P |= this.DFlag;
  }
  ClearDFlag() {
    // Clear D Flag
    this.P &= ~this.DFlag;
  }
  SetIFlag() {
    // Set I Flag
    this.P |= this.IFlag;
  }
  ClearIFlag() {
    // Clear I Flag
    this.P &= ~this.IFlag;
  }
  SetCFlag() {
    // Set C Flag
    this.P |= this.CFlag;
  }
  ClearCFlag() {
    // Clear C Flag
    this.P &= ~this.CFlag;
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

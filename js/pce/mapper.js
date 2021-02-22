'use strict';
class MapperBase {
  constructor(core) {
    this.ROM = null;
    this.Core = core;
  }
  Init() {}
  Read(address) {
    return 0xff;
  }
  Write(address, data) {}
}
class Mapper0 extends MapperBase {
  constructor(rom, core) {
    super(core);
    this.ROM = rom;
    let tmp = this.ROM.length - 1;
    this.Address = 0x80000;
    while (this.Address > 0x0000) {
      if ((this.Address & tmp) != 0x0000) break;
      this.Address >>>= 1;
    }
  }
  Read(address) {
    if (address >= this.ROM.length) return this.ROM[(address & (this.Address - 1)) | this.Address];
    else return this.ROM[address];
  }
}
class Mapper1 extends MapperBase {
  constructor(rom, core) {
    super(core);
    this.ROM = rom;
    this.Address = 0;
  }
  Init() {
    this.Address = 0;
  }
  Read(address) {
    if (address < 0x80000) return this.ROM[address];
    else return this.ROM[this.Address | (address & 0x7ffff)];
  }
  Write(address, data) {
    this.Address = ((address & 0x000f) + 1) << 19;
  }
}
class Mapper2 extends MapperBase {
  constructor(rom, core) {
    super(core);
    this.ROM = rom.concat(new Array(0x80000).fill(0x00));
  }
  Read(address) {
    return this.ROM[address];
  }
  Write(address, data) {
    if (address >= 0x80000) this.ROM[address] = data;
  }
}

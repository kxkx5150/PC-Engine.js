class VCE {
  constructor(core) {
    this.Core = core;
    this.Palette = new Array(512);
    this.PaletteData = new Array(512);
    this.MonoPaletteData = new Array(512);
    this.VCEBaseClock = 0;
    this.VCEControl = 0;
    this.VCEAddress = 0;
    this.VCEData = 0;
  }
  VCEInit() {
    this.Palette.fill(0x0000);
    for (let i = 0; i < 512; i++) {
      this.PaletteData[i] = { r: 0, g: 0, b: 0 };
      this.MonoPaletteData[i] = { r: 0, g: 0, b: 0 };
    }
    this.VCEBaseClock = this.Core.cpu.BaseClock5;
    this.VCEControl = 0x00;
    this.VCEAddress = 0x00;
    this.VCEData = 0x00;
  }
  SetVCEControl(data) {
    this.VCEControl = data;
    switch (data & 0x03) {
      case 0x00:
        this.VCEBaseClock = this.Core.cpu.BaseClock5;
        break;
      case 0x01:
        this.VCEBaseClock = this.Core.cpu.BaseClock7;
        break;
      case 0x02:
      case 0x03:
        this.VCEBaseClock = this.Core.cpu.BaseClock10;
        break;
    }
  }
  SetVCEAddressLow(data) {
    this.VCEAddress = (this.VCEAddress & 0xff00) | data;
  }
  SetVCEAddressHigh(data) {
    this.VCEAddress = ((this.VCEAddress & 0x00ff) | (data << 8)) & 0x01ff;
  }
  GetVCEDataLow() {
    return this.Palette[this.VCEAddress] & 0x00ff;
  }
  GetVCEDataHigh() {
    let tmp = (this.Palette[this.VCEAddress] & 0xff00) >> 8;
    this.VCEAddress = (this.VCEAddress + 1) & 0x01ff;
    return tmp;
  }
  SetVCEDataLow(data) {
    this.Palette[this.VCEAddress] = (this.Palette[this.VCEAddress] & 0xff00) | data;
    this.ToPalettes();
  }
  SetVCEDataHigh(data) {
    this.Palette[this.VCEAddress] = (this.Palette[this.VCEAddress] & 0x00ff) | (data << 8);
    this.ToPalettes();
    this.VCEAddress = (this.VCEAddress + 1) & 0x01ff;
  }
  ToPalettes() {
    let color = this.Palette[this.VCEAddress];
    let tmp = this.PaletteData[this.VCEAddress];
    tmp.r = ((color >> 3) & 0x07) * 36;
    tmp.g = ((color >> 6) & 0x07) * 36;
    tmp.b = (color & 0x07) * 36;
    let mono = tmp.r * 0.299 + tmp.g * 0.587 + tmp.b * 0.114;
    this.MonoPaletteData[this.VCEAddress].r = mono;
    this.MonoPaletteData[this.VCEAddress].g = mono;
    this.MonoPaletteData[this.VCEAddress].b = mono;
  }
}

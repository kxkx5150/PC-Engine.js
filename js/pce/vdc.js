class VDC {
  constructor(core) {
    this.Core = core;
    this.VDCPutLineProgressClock = 0;
    this.VDCPutLine = 0;
    this.VDC = new Array(2);
    this.VDCLineClock = 1368;
    this.ScreenSize = [];
    this.ScreenSize[this.Core.cpu.BaseClock5] = 342;
    this.ScreenSize[this.Core.cpu.BaseClock7] = 456;
    this.ScreenSize[this.Core.cpu.BaseClock10] = 684;
    this.PutScreenSize = [];
    this.PutScreenSize[this.Core.cpu.BaseClock5] = 320;
    this.PutScreenSize[this.Core.cpu.BaseClock7] = 428;
    this.PutScreenSize[this.Core.cpu.BaseClock10] = 640;
    this.ScreenHeightMAX = 262;
    this.ScreenWidthMAX = 684;
    this.VScreenWidthArray = [];
    this.VScreenWidthArray[0x00] = 32;
    this.VScreenWidthArray[0x10] = 64;
    this.VScreenWidthArray[0x20] = 128;
    this.VScreenWidthArray[0x30] = 128;
    this.ReverseBit = new Array(0x100).fill(0x00);
    this.ReverseBit = this.ReverseBit.map((d, i) => {
      return (
        ((i & 0x80) >> 7) |
        ((i & 0x40) >> 5) |
        ((i & 0x20) >> 3) |
        ((i & 0x10) >> 1) |
        ((i & 0x08) << 1) |
        ((i & 0x04) << 3) |
        ((i & 0x02) << 5) |
        ((i & 0x01) << 7)
      );
    });
    this.ReverseBit16 = new Array(0x10000).fill(0x00);
    this.ReverseBit16 = this.ReverseBit16.map((d, i) => {
      return (this.ReverseBit[i & 0x00ff] << 8) | this.ReverseBit[(i & 0xff00) >> 8];
    });
    this.ReverseBit256 = new Array(0x100).fill(0x00);
    this.ReverseBit256 = this.ReverseBit256.map((d, i) => {
      let b = this.ReverseBit[i];
      return (
        ((b & 0x80) << (28 - 7)) |
        ((b & 0x40) << (24 - 6)) |
        ((b & 0x20) << (20 - 5)) |
        ((b & 0x10) << (16 - 4)) |
        ((b & 0x08) << (12 - 3)) |
        ((b & 0x04) << (8 - 2)) |
        ((b & 0x02) << (4 - 1)) |
        ((b & 0x01) << (0 - 0))
      );
    });
    this.SPAddressMask = [];
    this.SPAddressMask[16] = [];
    this.SPAddressMask[32] = [];
    this.SPAddressMask[16][16] = 0x07fe;
    this.SPAddressMask[16][32] = 0x07fe & 0x07fa;
    this.SPAddressMask[16][64] = 0x07fe & 0x07f2;
    this.SPAddressMask[32][16] = 0x07fc;
    this.SPAddressMask[32][32] = 0x07fc & 0x07fa;
    this.SPAddressMask[32][64] = 0x07fc & 0x07f2;
  }
  VDCInit() {
    this.VDCPutLineProgressClock = 0;
    this.VDCPutLine = 0;
    for (let vdcno = 0; vdcno < 2; vdcno++) {
      this.VDC[vdcno] = {
        VDCRegister: new Array(20).fill(0x0000),
        VRAM: new Array(0x10000).fill(0x0000),
        SATB: new Array(256).fill(0x0000),
        VDCBurst: false,
        SpriteLimit: false,
        SPLine: new Array(this.ScreenWidthMAX),
        BGLine: new Array(this.ScreenWidthMAX).fill(0x00),
        VDCStatus: 0x00,
        VDCRegisterSelect: 0x00,
        WriteVRAMData: 0x0000,
        VRAMtoSATBStartFlag: false,
        VRAMtoSATBCount: 0,
        VRAMtoVRAMCount: 0,
        RasterCount: 64,
        VDCProgressClock: 0,
        DrawBGYLine: 0,
        DrawBGLine: 0,
        VScreenWidth: 0,
        VScreenHeight: 0,
        VScreenHeightMask: 0,
        ScreenWidth: 0,
        ScreenSize: 0,
        DrawLineWidth: 0,
        DrawBGIndex: 0,
        HDS: 0,
        HSW: 0,
        HDE: 0,
        HDW: 0,
        VDS: 0,
        VSW: 0,
        VDW: 0,
        VCR: 0,
      };
      for (let i = 0; i < this.VDC[vdcno].SPLine.length; i++)
        this.VDC[vdcno].SPLine[i] = { data: 0x00, no: 255, priority: 0x00 };
      this.VDC[vdcno].VDCRegister[0x09] = 0x0010;
      this.VDC[vdcno].VDCRegister[0x0a] = 0x0202;
      this.VDC[vdcno].VDCRegister[0x0b] = 0x031f;
      this.VDC[vdcno].VDCRegister[0x0c] = 0x0f02;
      this.VDC[vdcno].VDCRegister[0x0d] = 0x00ef;
      this.VDC[vdcno].VDCRegister[0x0e] = 0x0003;
    }
    this.GetScreenSize(0);
    this.GetScreenSize(1);
  }
  VDCRun() {
    this.VDCProcessDMA(0);
    this.VDC[0].VDCProgressClock += this.Core.cpu.ProgressClock;
    if (this.Core.SuperGrafx) {
      this.VDCProcessDMA(1);
      this.VDC[1].VDCProgressClock += this.Core.cpu.ProgressClock;
    }
    while (this.VDC[0].VDCProgressClock >= this.VDCLineClock) {
      this.VDCProcess(0);
      if (this.Core.SuperGrafx) this.VDCProcess(1);
    }
    this.VDCPutLineProgressClock += this.Core.cpu.ProgressClock;
    if (this.VDCPutLineProgressClock >= this.VDCLineClock) {
      this.VDCPutLineProgressClock -= this.VDCLineClock;
      this.VDCPutLine++;
      if (this.VDCPutLine == this.ScreenHeightMAX) {
        this.VDCPutLine = 0;
        this.GetScreenSize(0);
        this.VDC[0].DrawBGYLine = 0;
        if (this.Core.SuperGrafx) {
          this.GetScreenSize(1);
          this.VDC[1].DrawBGYLine = 0;
        }
        this.Core.DrawFlag = true;
        this.Core.Ctx.putImageData(this.Core.ImageData, 0, 0);
      }
      let palettes =
        (this.Core.vce.VCEControl & 0x80) == 0x00
          ? this.Core.vce.PaletteData
          : this.Core.vce.MonoPaletteData;
      let data = this.Core.ImageData.data;
      let imageIndex = this.VDCPutLine * this.ScreenWidthMAX * 4;
      let black = palettes[0x100];
      let sw = this.ScreenSize[this.Core.vce.VCEBaseClock];
      let bgl0 = this.VDC[0].BGLine;
      if (this.Core.SuperGrafx) {
        //VPC
        let window1 = this.Core.vpc.VPCWindow1;
        let window2 = this.Core.vpc.VPCWindow2;
        let priority = this.Core.vpc.VPCPriority;
        let bgl1 = this.VDC[1].BGLine;
        for (let bgx = 0; bgx < sw; bgx++, imageIndex += 4) {
          let wflag = 0x00;
          if (bgx >= window1) wflag |= 0x01;
          if (bgx <= window2) wflag |= 0x02;
          let bg0 = bgl0[bgx];
          let bg1 = bgl1[bgx];
          let color;
          switch (priority[wflag]) {
            case 0x04 | 0x03:
              if (bg0 > 0x100 || bg1 > 0x100) color = palettes[bg0 > 0x100 ? bg0 : bg1];
              else color = palettes[(bg0 & 0x0ff) != 0x000 ? bg0 : bg1];
              break;
            case 0x08 | 0x03:
              if (bg0 < 0x100 && bg0 != 0x000) color = palettes[bg0];
              else color = palettes[(bg1 & 0x0ff) != 0x000 ? bg1 : bg0];
              break;
            case 0x00 | 0x03:
            case 0x0c | 0x03:
              color = palettes[(bg0 & 0x0ff) != 0x000 ? bg0 : bg1];
              break;
            case 0x00 | 0x01:
            case 0x04 | 0x01:
            case 0x08 | 0x01:
            case 0x0c | 0x01:
              color = palettes[bg0];
              break;
            case 0x00 | 0x02:
            case 0x04 | 0x02:
            case 0x08 | 0x02:
            case 0x0c | 0x02:
              color = palettes[bg1];
              break;
            default:
              color = black;
              break;
          }
          data[imageIndex] = color.r;
          data[imageIndex + 1] = color.g;
          data[imageIndex + 2] = color.b;
        }
      } else {
        for (let bgx = 0; bgx < sw; bgx++, imageIndex += 4) {
          let color = palettes[bgl0[bgx]];
          data[imageIndex] = color.r;
          data[imageIndex + 1] = color.g;
          data[imageIndex + 2] = color.b;
        }
      }
    }
  }
  VDCProcess(vdcno) {
    let vdcc = this.VDC[vdcno];
    vdcc.VDCProgressClock -= this.VDCLineClock;
    vdcc.DrawBGIndex = 0;
    vdcc.BGLine.fill(0x100);
    for (let i = 0; i < vdcc.ScreenSize; i += vdcc.DrawLineWidth) {
      vdcc.DrawBGYLine++;
      if (vdcc.DrawBGYLine == this.ScreenHeightMAX) vdcc.DrawBGYLine = 0;
      if (vdcc.DrawBGYLine < vdcc.VDS + vdcc.VSW) {
        //OVER SCAN
        this.MakeBGColorLineVDC(vdcno);
      } else if (vdcc.DrawBGYLine <= vdcc.VDS + vdcc.VSW + vdcc.VDW) {
        //ACTIVE DISPLAY
        vdcc.DrawBGLine =
          (vdcc.DrawBGYLine == vdcc.VDS + vdcc.VSW ? vdcc.VDCRegister[0x08] : vdcc.DrawBGLine + 1) &
          vdcc.VScreenHeightMask;
        if (!vdcc.VDCBurst) {
          this.MakeSpriteLine(vdcno);
          this.MakeBGLine(vdcno);
        } else this.MakeBGColorLineVDC(vdcno);
      } else {
        //OVER SCAN
        this.MakeBGColorLineVDC(vdcno);
      }
      let vline = vdcc.VDS + vdcc.VSW + vdcc.VDW + 1;
      if (vline > 261) vline -= 261;
      if (vdcc.DrawBGYLine == vline) {
        vdcc.VDCStatus |= (vdcc.VDCRegister[0x05] & 0x0008) << 2; //SetVSync INT
        if (vdcc.VRAMtoSATBStartFlag) {
          //VRAMtoSATB
          for (let i = 0, addr = vdcc.VDCRegister[0x13]; i < 256; i++, addr++)
            vdcc.SATB[i] = vdcc.VRAM[addr];
          vdcc.VRAMtoSATBCount = 256 * this.Core.vce.VCEBaseClock;
          vdcc.VDCStatus |= 0x40;
          vdcc.VRAMtoSATBStartFlag = (vdcc.VDCRegister[0x0f] & 0x0010) == 0x0010;
        }
      }
      vdcc.RasterCount++;
      if (vdcc.DrawBGYLine == vdcc.VDS + vdcc.VSW - 1) vdcc.RasterCount = 64;
      if (vdcc.RasterCount == vdcc.VDCRegister[0x06] && (vdcc.VDCStatus & 0x20) == 0x00)
        vdcc.VDCStatus |= vdcc.VDCRegister[0x05] & 0x0004; //SetRaster INT
      vdcc.DrawBGIndex += vdcc.DrawLineWidth;
    }
  }
  MakeSpriteLine(vdcno) {
    let vdcc = this.VDC[vdcno];
    let sp = vdcc.SPLine;
    for (let i = 0; i < vdcc.ScreenWidth; i++) {
      let spi = sp[i];
      spi.data = 0x00;
      spi.palette = 0x000;
      spi.no = 255;
      spi.priority = 0x00;
    }
    if ((vdcc.VDCRegister[0x05] & 0x0040) == 0x0000) return;
    let dotcount = 0;
    let line = vdcc.DrawBGYLine - (vdcc.VDS + vdcc.VSW) + 64;
    let vram = vdcc.VRAM;
    let satb = vdcc.SATB;
    let revbit16 = this.ReverseBit16;
    for (let i = 0, s = 0; i < 64; i++, s += 4) {
      let y = satb[s] & 0x3ff;
      let attribute = satb[s + 3];
      let height = ((attribute & 0x3000) >> 8) + 16;
      height = height > 32 ? 64 : height;
      if (line < y || line > y + height - 1) continue;
      let x = (satb[s + 1] & 0x3ff) - 32;
      let width = ((attribute & 0x0100) >> 4) + 16;
      if (x + width <= 0) continue;
      let spy = line - y;
      if ((attribute & 0x8000) == 0x8000) spy = height - 1 - spy;
      let index =
        ((satb[s + 2] & this.SPAddressMask[width][height]) << 5) | (((spy & 0x30) << 3) | (spy & 0x0f));
      let data0;
      let data1;
      let data2;
      let data3;
      if ((attribute & 0x0800) == 0x0000) {
        data0 = revbit16[vram[index]];
        data1 = revbit16[vram[index + 16]];
        data2 = revbit16[vram[index + 32]];
        data3 = revbit16[vram[index + 48]];
        if (width == 32) {
          data0 |= revbit16[vram[index | 0x0040]] << 16;
          data1 |= revbit16[vram[(index | 0x0040) + 16]] << 16;
          data2 |= revbit16[vram[(index | 0x0040) + 32]] << 16;
          data3 |= revbit16[vram[(index | 0x0040) + 48]] << 16;
        }
      } else {
        data0 = vram[index];
        data1 = vram[index + 16];
        data2 = vram[index + 32];
        data3 = vram[index + 48];
        if (width == 32) {
          data0 = (data0 << 16) | vram[index | 0x0040];
          data1 = (data1 << 16) | vram[(index | 0x0040) + 16];
          data2 = (data2 << 16) | vram[(index | 0x0040) + 32];
          data3 = (data3 << 16) | vram[(index | 0x0040) + 48];
        }
      }
      let palette = ((attribute & 0x000f) << 4) | 0x0100;
      let priority = attribute & 0x0080;
      let j = 0;
      if (x < 0) {
        j -= x;
        x = 0;
      }
      for (; j < width && x < vdcc.ScreenWidth; j++, x++) {
        let spx = sp[x];
        if (spx.data == 0x00) {
          let dot =
            ((data0 >>> j) & 0x0001) |
            (((data1 >>> j) << 1) & 0x0002) |
            (((data2 >>> j) << 2) & 0x0004) |
            (((data3 >>> j) << 3) & 0x0008);
          if (dot != 0x00) {
            spx.data = dot;
            spx.palette = palette;
            spx.priority = priority;
          }
        }
        if (spx.no == 255) spx.no = i;
        if (i != 0 && spx.no == 0) vdcc.VDCStatus |= vdcc.VDCRegister[0x05] & 0x0001; //SetSpriteCollisionINT
        if (++dotcount == 256) {
          vdcc.VDCStatus |= vdcc.VDCRegister[0x05] & 0x0002; //SetSpriteOverINT
          if (vdcc.SpriteLimit) return;
        }
      }
    }
  }
  MakeBGLine(vdcno) {
    let vdcc = this.VDC[vdcno];
    let sp = vdcc.SPLine;
    let bg = vdcc.BGLine;
    let sw = vdcc.ScreenWidth;
    let leftblank = ((vdcc.HDS + vdcc.HSW) << 3) + vdcc.DrawBGIndex;
    if ((vdcc.VDCRegister[0x05] & 0x0080) == 0x0080) {
      let WidthMask = vdcc.VScreenWidth - 1;
      let x = vdcc.VDCRegister[0x07];
      let index_x = (x >> 3) & WidthMask;
      x = (x & 0x07) << 2;
      let y = vdcc.DrawBGLine;
      let index_y = ((y >> 3) & (vdcc.VScreenHeight - 1)) * vdcc.VScreenWidth;
      y = y & 0x07;
      let vram = vdcc.VRAM;
      let bgx = 0;
      let revbit = this.ReverseBit256;
      while (bgx < sw) {
        let tmp = vram[index_x + index_y];
        let address = ((tmp & 0x0fff) << 4) + y;
        let palette = (tmp & 0xf000) >> 8;
        let data0 = vram[address];
        let data1 = vram[address + 8];
        let data =
          revbit[data0 & 0x00ff] |
          (revbit[(data0 & 0xff00) >> 8] << 1) |
          (revbit[data1 & 0x00ff] << 2) |
          (revbit[(data1 & 0xff00) >> 8] << 3);
        for (; x < 32 && bgx < sw; x += 4, bgx++) {
          let dot = (data >>> x) & 0x0f;
          let spbgx = sp[bgx];
          bg[bgx + leftblank] =
            spbgx.data != 0x00 && (dot == 0x00 || spbgx.priority == 0x0080)
              ? spbgx.data | spbgx.palette
              : dot | (dot == 0x00 ? 0x00 : palette);
        }
        x = 0;
        index_x = (index_x + 1) & WidthMask;
      }
    } else {
      for (let i = 0; i < sw; i++) bg[i + leftblank] = sp[i].data | sp[i].palette;
    }
  }
  MakeBGColorLineVDC(vdcno) {
    this.VDC[vdcno].BGLine.fill(0x100);
  }
  VDCProcessDMA(vdcno) {
    let vdcc = this.VDC[vdcno];
    if (vdcc.VRAMtoSATBCount > 0) {
      //VRAMtoSATB
      vdcc.VRAMtoSATBCount -= this.Core.cpu.ProgressClock;
      if (vdcc.VRAMtoSATBCount <= 0)
        vdcc.VDCStatus = (vdcc.VDCStatus & 0xbf) | ((vdcc.VDCRegister[0x0f] & 0x0001) << 3); //VRAMtoSATB INT
    }
    if (vdcc.VRAMtoVRAMCount > 0) {
      //VRAMtoVRAM
      vdcc.VRAMtoVRAMCount -= this.Core.cpu.ProgressClock;
      if (vdcc.VRAMtoVRAMCount <= 0)
        vdcc.VDCStatus = (vdcc.VDCStatus & 0xbf) | ((vdcc.VDCRegister[0x0f] & 0x0002) << 3); //VRAMtoVRAM INT
    }
  }
  GetScreenSize(vdcno) {
    let vdcc = this.VDC[vdcno];
    let r = vdcc.VDCRegister;
    vdcc.VScreenWidth = this.VScreenWidthArray[r[0x09] & 0x0030];
    vdcc.VScreenHeight = (r[0x09] & 0x0040) == 0x0000 ? 32 : 64;
    vdcc.VScreenHeightMask = vdcc.VScreenHeight * 8 - 1;
    vdcc.ScreenWidth = ((r[0x0b] & 0x007f) + 1) * 8;
    if (vdcc.ScreenWidth > this.ScreenWidthMAX) vdcc.ScreenWidth = this.ScreenWidthMAX;
    vdcc.HDS = (r[0x0a] & 0x7f00) >> 8;
    vdcc.HSW = r[0x0a] & 0x001f;
    vdcc.HDE = (r[0x0b] & 0x7f00) >> 8;
    vdcc.HDW = r[0x0b] & 0x007f;
    vdcc.VDS = (r[0x0c] & 0xff00) >> 8;
    vdcc.VSW = r[0x0c] & 0x001f;
    vdcc.VDW = r[0x0d] & 0x01ff;
    vdcc.VCR = r[0x0e] & 0x00ff;
    vdcc.ScreenSize = this.ScreenSize[this.Core.vce.VCEBaseClock];
    if (this.Core.MainCanvas.width != vdcc.ScreenSize) {
      //this.Core.MainCanvas.style.width = (this.PutScreenSize[this.Core.vce.VCEBaseClock] * 2) + 'px';
      this.Core.MainCanvas.width = this.PutScreenSize[this.Core.vce.VCEBaseClock];
    }
    vdcc.DrawLineWidth = (vdcc.HDS + vdcc.HSW + vdcc.HDE + vdcc.HDW + 1) << 3;
    if (vdcc.DrawLineWidth <= this.ScreenSize[this.Core.cpu.BaseClock5])
      vdcc.DrawLineWidth = this.ScreenSize[this.Core.cpu.BaseClock5];
    else if (vdcc.DrawLineWidth <= this.ScreenSize[this.Core.cpu.BaseClock7])
      vdcc.DrawLineWidth = this.ScreenSize[this.Core.cpu.BaseClock7];
    else vdcc.DrawLineWidth = this.ScreenSize[this.Core.cpu.BaseClock10];
    vdcc.VDCBurst = (r[0x05] & 0x00c0) == 0x0000 ? true : false;
  }
  SetVDCRegister(data, vdcno) {
    this.VDC[vdcno].VDCRegisterSelect = data & 0x1f;
  }
  SetVDCLow(data, vdcno) {
    let vdcc = this.VDC[vdcno];
    if (vdcc.VDCRegisterSelect == 0x02) vdcc.WriteVRAMData = data;
    else
      vdcc.VDCRegister[vdcc.VDCRegisterSelect] =
        (vdcc.VDCRegister[vdcc.VDCRegisterSelect] & 0xff00) | data;
    if (vdcc.VDCRegisterSelect == 0x01) {
      vdcc.VDCRegister[0x02] = vdcc.VRAM[vdcc.VDCRegister[0x01]];
      return;
    }
    if (vdcc.VDCRegisterSelect == 0x08) {
      vdcc.DrawBGLine = vdcc.VDCRegister[0x08];
      return;
    }
    if (vdcc.VDCRegisterSelect == 0x0f)
      vdcc.VRAMtoSATBStartFlag = (vdcc.VDCRegister[0x0f] & 0x10) == 0x10;
  }
  SetVDCHigh(data, vdcno) {
    let vdcc = this.VDC[vdcno];
    if (vdcc.VDCRegisterSelect == 0x02) {
      vdcc.VRAM[vdcc.VDCRegister[0x00]] = vdcc.WriteVRAMData | (data << 8);
      vdcc.VDCRegister[0x00] = (vdcc.VDCRegister[0x00] + this.GetVRAMIncrement(vdcno)) & 0xffff;
      return;
    }
    vdcc.VDCRegister[vdcc.VDCRegisterSelect] =
      (vdcc.VDCRegister[vdcc.VDCRegisterSelect] & 0x00ff) | (data << 8);
    if (vdcc.VDCRegisterSelect == 0x01) {
      vdcc.VDCRegister[0x02] = vdcc.VRAM[vdcc.VDCRegister[0x01]];
      vdcc.VDCRegister[0x03] = vdcc.VDCRegister[0x02];
      vdcc.VDCRegister[0x01] = (vdcc.VDCRegister[0x01] + this.GetVRAMIncrement(vdcno)) & 0xffff;
      return;
    }
    if (vdcc.VDCRegisterSelect == 0x08) {
      vdcc.DrawBGLine = vdcc.VDCRegister[0x08];
      return;
    }
    if (vdcc.VDCRegisterSelect == 0x12) {
      //VRAMtoVRAM
      let si = (vdcc.VDCRegister[0x0f] & 0x0004) == 0x0000 ? 1 : -1;
      let di = (vdcc.VDCRegister[0x0f] & 0x0008) == 0x0000 ? 1 : -1;
      let s = vdcc.VDCRegister[0x10];
      let d = vdcc.VDCRegister[0x11];
      let l = vdcc.VDCRegister[0x12] + 1;
      vdcc.VRAMtoVRAMCount = l * this.Core.vce.VCEBaseClock;
      vdcc.VDCStatus |= 0x40;
      let vram = vdcc.VRAM;
      for (; l > 0; l--) {
        vram[d] = vram[s];
        s = (s + si) & 0xffff;
        d = (d + di) & 0xffff;
      }
      return;
    }
    if (vdcc.VDCRegisterSelect == 0x13)
      //VRAMtoSATB
      vdcc.VRAMtoSATBStartFlag = true;
  }
  GetVRAMIncrement(vdcno) {
    switch (this.VDC[vdcno].VDCRegister[0x05] & 0x1800) {
      case 0x0000:
        return 1;
      case 0x0800:
        return 32;
      case 0x1000:
        return 64;
      case 0x1800:
        return 128;
    }
  }
  GetVDCStatus(vdcno) {
    let tmp = this.VDC[vdcno].VDCStatus;
    this.VDC[vdcno].VDCStatus &= 0x40;
    return tmp;
  }
  GetVDCLow(vdcno) {
    return this.VDC[vdcno].VDCRegister[this.VDC[vdcno].VDCRegisterSelect] & 0x00ff;
  }
  GetVDCHigh(vdcno) {
    let vdcc = this.VDC[vdcno];
    if (vdcc.VDCRegisterSelect == 0x02 || vdcc.VDCRegisterSelect == 0x03) {
      let tmp = (vdcc.VDCRegister[0x02] & 0xff00) >> 8;
      vdcc.VDCRegister[0x02] = vdcc.VRAM[vdcc.VDCRegister[0x01]];
      vdcc.VDCRegister[0x03] = vdcc.VDCRegister[0x02];
      vdcc.VDCRegister[0x01] = (vdcc.VDCRegister[0x01] + this.GetVRAMIncrement(vdcno)) & 0xffff;
      return tmp;
    }
    return (vdcc.VDCRegister[vdcc.VDCRegisterSelect] & 0xff00) >> 8;
  }
}

'use strict';
class PCE {
  constructor(canvas_id) {
    this.MainCanvas = null;
    this.Ctx = null;
    this.ImageData = null;
    this.framebuffer_u32 = null;
    this.ACtx = new AudioContext();
    this.sampleRate = 48000;
    this.CountryTypePCE = 0x40;
    this.CountryTypeTG16 = 0x00;
    this.CountryType = this.CountryTypePCE;
    this.TimerID = null;
    this.Count = 0;
    this.BRAKE = false;

    this.Mapper = null;
    this.mem = new RAM(this);
    this.cpu = new CPU(this, this.mem);
    this.vce = new VCE(this);
    this.vpc = new VPC(this);
    this.vdc = new VDC(this);
    this.sound = new SOUND(this, this.ACtx);
    this.psg = new PSG(this);
    this.irq = new IRQ(this);
    this.timer = new TIMER(this);
    this.io = new IO(this);
    this.SetCanvas(canvas_id);
    this.psg.PSGInit();
  }
  Init() {
    this.irq.Init();
    this.mem.Init();
    this.cpu.CPUInit();
    this.vce.VCEInit();
    this.vpc.VPCInit();
    this.vdc.VDCInit();
    this.timer.TimerInit();
    this.io.JoystickInit();
  }
  Reset() {
    this.irq.Reset();
    this.mem.StorageReset();
    this.cpu.CPUInit();
    this.vce.VCEInit();
    this.vpc.VPCInit();
    this.vdc.VDCInit();
    this.timer.TimerInit();
    this.io.JoystickInit();
    this.psg.PSGInit();
    this.cpu.CPUReset();
  }
  Start() {
    if (this.TimerID == null) {
      this.io.JoystickEventInit();
      this.UpdateAnimationFrame();
    }
    this.ACtx.resume();
    this.Run();
  }
  SetCanvas(canvasID) {
    this.MainCanvas = document.getElementById(canvasID);
    if (!this.MainCanvas.getContext) return false;
    this.Ctx = this.MainCanvas.getContext("2d");
    this.ImageData = this.Ctx.createImageData(this.vdc.ScreenWidthMAX, this.vdc.ScreenHeightMAX);
    this.framebuffer_u32 = new Uint32Array(this.ImageData.data.buffer);
    let fb32 = this.framebuffer_u32;
    for (let i = 0; i < this.vdc.ScreenWidthMAX * this.vdc.ScreenHeightMAX * 4; i += 4) {
      fb32[i / 4] = (255 << 24) | (0 << 16) | (0 << 8) | 0;
    }
    this.Ctx.putImageData(this.ImageData, 0, 0);
    return true;
  }
  UpdateAnimationFrame() {
    this.TimerID = requestAnimationFrame(this.UpdateAnimationFrame.bind(this));
    this.Run();
    if (this.BRAKE) cancelAnimationFrame(this.TimerID);
  }
  Run() {
    this.io.CheckGamePad();
    this.DrawFlag = false;
    while (!this.DrawFlag) {
      this.cpu.CPURun();
      this.vdc.VDCRun();
      this.timer.TimerRun();
      this.psg.PSGRun();
      if (this.BRAKE) break;
    }
  }
  SetROM(rom) {
    this.Init();
    let tmp = rom.slice(rom.length % 8192);
    this.Mapper = new Mapper0(tmp, this);
    this.Reset();
    this.Start();
  }
}

class TIMER {
  constructor(core) {
    this.Core = core;

    this.TimerBaseClock = this.BaseClock7;
    this.TimerReload = 0;
    this.TimerFlag = false;
    this.TimerCounter = 0;
    this.TimerPrescaler = 0;
    this.INTTIQ = 0;
  }

  TimerInit() {
    this.TimerReload = 0x00;
    this.TimerFlag = false;
    this.TimerCounter = 0x00;
    this.TimerPrescaler = 0;
    this.INTTIQ = 0x00;
  }

  ReadTimerCounter() {
    return this.TimerCounter;
  }

  TimerAcknowledge() {
    this.INTTIQ = 0x00;
  }

  WirteTimerReload(data) {
    this.TimerReload = data & 0x7f;
  }

  WirteTimerControl(data) {
    if (!this.TimerFlag && (data & 0x01) == 0x01) {
      this.TimerCounter = this.TimerReload;
      this.TimerPrescaler = 0;
    }
    this.TimerFlag = (data & 0x01) == 0x01 ? true : false;
  }

  TimerRun() {
    if (this.TimerFlag) {
      this.TimerPrescaler += this.Core.cpu.ProgressClock;
      while (this.TimerPrescaler >= 1024 * this.TimerBaseClock) {
        this.TimerPrescaler -= 1024 * this.TimerBaseClock;
        this.TimerCounter--;
        if (this.TimerCounter < 0) {
          this.TimerCounter = this.TimerReload;
          this.INTTIQ = this.TIQFlag;
        }
      }
    }
  }
}

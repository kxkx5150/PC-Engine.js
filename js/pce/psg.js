class PSG {
  constructor(core) {
    this.Core = core;

    this.PSGChannel = new Array(6);
    this.PSGBaseClock = this.Core.cpu.BaseClock3;
    this.PSGProgressClock = 0;
    this.WaveVolumeLeft = 0;
    this.WaveVolumeRight = 0;
    this.WaveLfoOn = false;
    this.WaveLfoControl = 0;
    this.WaveLfoFreqency = 0;
  }

  PSGInit() {
    this.Core.sound.SoundInit();

    for (let i = 0; i < this.PSGChannel.length; i++)
      this.PSGChannel[i] = {
        R: new Array(10).fill(0),
        keyon: false,
        dda: false,
        freq: 0,
        count: 0,
        vol: 0,
        leftvol: 0,
        rightvol: 0,
        noiseon: false,
        noisefreq: 0,
        noise: 0x8000,
        noisestate: 0,
        index: 0,
        wave: new Array(32).fill(0),
      };
  }

  PSGRun() {
    if (this.Core.ACtx == null) return;

    let ch;
    let i;
    let j;
    let ch0;
    let ch1;
    let freqtmp;

    this.PSGProgressClock += this.Core.cpu.ProgressClock;
    i = (this.PSGProgressClock / this.PSGBaseClock) | 0;
    this.PSGProgressClock %= this.PSGBaseClock;

    while (i > 0) {
      i--;
      j = 0;

      if (this.WaveLfoOn) {
        ch0 = this.PSGChannel[0];
        ch1 = this.PSGChannel[1];
        if (ch0.keyon) {
          if (ch0.count == 0) {
            ch0.index = (ch0.index + 1) & 0x1f;
            freqtmp = 0;
            if (this.WaveLfoControl != 0x00) {
              freqtmp = ch1.wave[ch1.index];
              freqtmp = freqtmp > 0x0f ? freqtmp - 0x20 : freqtmp & 0x0f;
              freqtmp <<= 4 * (this.WaveLfoControl - 1);
            }
            freqtmp = ch0.freq + freqtmp;
            if (freqtmp < 0) freqtmp = 0;
            ch0.count = freqtmp;
          } else ch0.count--;

          if (ch1.count == 0) {
            ch1.index = (ch1.index + 1) & 0x1f;
            ch1.count = ch1.freq * this.WaveLfoFreqency;
          } else ch1.count--;
        }
        j = 2;
      }

      for (; j < 6; j++) {
        ch = this.PSGChannel[j];
        if (j < 4 || !ch.noiseon) {
          if (ch.keyon && !ch.dda) {
            if (ch.count == 0) {
              ch.index = (ch.index + 1) & 0x1f;
              ch.count = ch.freq;
            } else ch.count--;
          }
        } else {
          if (ch.keyon && !ch.dda) {
            if (ch.count == 0) {
              ch.index = (ch.index + 1) & 0x1f;
              if (ch.index == 0)
                ch.noise = (ch.noise >> 1) | (((ch.noise << 12) ^ (ch.noise << 15)) & 0x8000);
              ch.count = ch.noisefreq;
            } else ch.count--;
          }
        }
      }
      this.Core.sound.SoundSet();
    }
  }

  SetPSG(r, data) {
    if (r == 0) {
      this.PSGChannel[0].R[0] = data & 0x07;
      return;
    }

    if (this.PSGChannel[0].R[0] > 5) return;

    let ch = this.PSGChannel[this.PSGChannel[0].R[0]];
    ch.R[r] = data;

    switch (r) {
      case 1:
        this.PSGChannel[0].R[1] = data;
        this.WaveVolumeLeft = (data & 0xf0) >> 4;
        this.WaveVolumeRight = data & 0x0f;
        return;

      case 2:
      case 3:
        ch.freq = ((ch.R[3] << 8) | ch.R[2]) & 0x0fff;
        return;

      case 4:
        ch.keyon = (data & 0x80) == 0x80 ? true : false;
        ch.dda = (data & 0x40) == 0x40 ? true : false;
        if ((data & 0x40) == 0x40) ch.index = 0;
        ch.vol = data & 0x1f;
      case 5:
        let vol = ch.R[4] & 0x1f;
        ch.leftvol = ((ch.R[5] & 0xf0) >> 4) * vol;
        ch.rightvol = (ch.R[5] & 0x0f) * vol;
        return;

      case 6:
        if (!ch.dda) {
          ch.wave[ch.index] = data & 0x1f;
          ch.index = (ch.index + 1) & 0x1f;
        }
        return;

      case 7:
        ch.noiseon = (data & 0x80) == 0x80 ? true : false;
        ch.noisefreq = (data & 0x1f) ^ 0x1f;
        return;

      case 8:
        this.PSGChannel[0].R[8] = data;
        this.WaveLfoFreqency = data;
        return;

      case 9:
        this.PSGChannel[0].R[9] = data;
        this.WaveLfoOn = (data & 0x80) == 0x80 ? true : false;
        this.WaveLfoControl = data & 0x03;
        return;
    }
  }

  GetPSG(r) {
    if (r > 9) return 0xff;
    if (r == 0 || r == 1 || r == 8 || r == 9) return this.PSGChannel[0].R[r];
    if (this.PSGChannel[0].R[0] > 5) return 0xff;
    return this.PSGChannel[this.PSGChannel[0].R[0]].R[r];
  }
}

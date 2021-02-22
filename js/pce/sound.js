'use strict';
class SOUND {
  constructor(core,actx) {
    this.Core = core;
    this.ACtx = actx
    this.WaveDataArray = [];
    this.WaveClockCounter = 0;
    this.WebAudioJsNode = null;
    this.WebAudioBufferSize = 2048;
    this.PSGClock = 3579545;
  }

  audioCallback(e) {
    let output = [];
    let data = [];

    for (let i = 0; i < 2; i++) {
      output[i] = e.outputBuffer.getChannelData(i);
      data[i] = new Float32Array(this.WebAudioBufferSize);
      if (this.WaveDataArray[i].length < this.WebAudioBufferSize) {
        data[i].fill(0.0);
      } else {
        for (let j = 0; j < data[i].length; j++)
          data[i][j] = this.WaveDataArray[i].shift() / (32 * 16 * 32 * 8 * 16);
        if (this.WaveDataArray[i].length > this.WebAudioBufferSize * 2)
          this.WaveDataArray[i] = this.WaveDataArray[i].slice(this.WebAudioBufferSize);
      }
      output[i].set(data[i]);
    }
  }

  SoundInit() {
    this.WaveClockCounter = 0;
    this.WaveDataArray = [];
    this.WaveDataArray[0] = [];
    this.WaveDataArray[1] = [];
    this.atx_scr = this.ACtx.createScriptProcessor(this.WebAudioBufferSize, 0, 2);
    this.atx_scr.addEventListener("audioprocess", this.audioCallback.bind(this));
    this.atx_scr.connect(this.ACtx.destination);
    this.sampleRate = this.ACtx.sampleRate;
  }

  SoundSet() {
    let waveoutleft;
    let waveoutright;
    let ch;
    let j;
    let out;

    this.WaveClockCounter += this.ACtx.sampleRate;
    if (this.WaveClockCounter >= this.PSGClock) {
      this.WaveClockCounter -= this.PSGClock;

      waveoutleft = 0;
      waveoutright = 0;
      for (j = 0; j < 6; j++) {
        if (j != 1 || !this.Core.psg.WaveLfoOn) {
          ch = this.Core.psg.PSGChannel[j];

          if (j < 4 || !ch.noiseon) out = ch.keyon ? (ch.dda ? ch.R[6] & 0x1f : ch.wave[ch.index]) : 0;
          else out = (ch.noise & 0x0001) == 0x0001 ? 0x0f : 0;

          waveoutleft += out * ch.leftvol;
          waveoutright += out * ch.rightvol;
        }
      }
      this.WaveDataArray[0].push(waveoutleft * this.Core.psg.WaveVolumeLeft);
      this.WaveDataArray[1].push(waveoutright * this.Core.psg.WaveVolumeRight);
    }
  }
}

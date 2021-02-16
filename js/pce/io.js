class IO {
  constructor() {
    this.JoystickSEL = 0;
    this.JoystickCLR = 0;
    this.KeyUpFunction = null;
    this.KeyDownFunction = null;

    this.Keybord = new Array(5).fill([]);
    this.Keybord = this.Keybord.map((d) => {
      return new Array(4);
    });

    this.GamePad = new Array(5).fill([]);
    this.GamePad = this.Keybord.map((d) => {
      return new Array(4);
    });

    this.GamePadSelect = 0x00;
    this.GamePadButtonSelect = 0x00;
    this.GamePadBuffer = 0x00;

    this.GamePadData = [];
    this.GamePadData["STANDARD PAD"] = [
      [
        [{ type: "B", index: 1 }], // SHOT1
        [{ type: "B", index: 0 }], // SHOT2
        [{ type: "B", index: 8 }], // SELECT
        [
          { type: "B", index: 9 },
          { type: "B", index: 2 },
        ], // RUN
        [{ type: "B", index: 12 }], // UP
        [{ type: "B", index: 13 }], // DOWN
        [{ type: "B", index: 14 }], // LEFT
        [{ type: "B", index: 15 }],
      ], // RIGHT

      [
        [{ type: "B", index: 1 }], // SHOT1
        [{ type: "B", index: 0 }], // SHOT2
        [{ type: "B", index: 8 }], // SELECT
        [{ type: "B", index: 9 }], // RUN
        [{ type: "B", index: 12 }], // UP
        [{ type: "B", index: 13 }], // DOWN
        [{ type: "B", index: 14 }], // LEFT
        [{ type: "B", index: 15 }], // RIGHT
        [{ type: "B", index: 7 }], // SHOT3
        [{ type: "B", index: 5 }], // SHOT4
        [{ type: "B", index: 2 }], // SHOT5
        [{ type: "B", index: 3 }],
      ],
    ]; // SHOT6

    this.GamePadData["HORI PAD 3 TURBO (Vendor: 0f0d Product: 0009)"] = [
      // Chrome
      [
        [{ type: "B", index: 2 }], // SHOT1
        [{ type: "B", index: 1 }], // SHOT2
        [{ type: "B", index: 8 }], // SELECT
        [
          { type: "B", index: 9 },
          { type: "B", index: 0 },
        ], // RUN
        [{ type: "P", index: 9 }], // UP (POV)
        [{ type: "N", index: 0 }], // DOWN (POV)
        [{ type: "N", index: 0 }], // LEFT (POV)
        [{ type: "N", index: 0 }],
      ], // RIGHT (POV)

      [
        [{ type: "B", index: 2 }], // SHOT1
        [{ type: "B", index: 1 }], // SHOT2
        [{ type: "B", index: 8 }], // SELECT
        [{ type: "B", index: 9 }], // RUN
        [{ type: "P", index: 9 }], // UP (POV)
        [{ type: "N", index: 0 }], // DOWN (POV)
        [{ type: "N", index: 0 }], // LEFT (POV)
        [{ type: "N", index: 0 }], // RIGHT (POV)
        [{ type: "B", index: 7 }], // SHOT3
        [{ type: "B", index: 5 }], // SHOT4
        [{ type: "B", index: 0 }], // SHOT5
        [{ type: "B", index: 3 }],
      ],
    ]; // SHOT6

    this.GamePadData["0f0d-0009-HORI PAD 3 TURBO"] = this.GamePadData[
      "HORI PAD 3 TURBO (Vendor: 0f0d Product: 0009)"
    ]; // Firefox
    this.GamePadData["UNKNOWN PAD"] = this.GamePadData["HORI PAD 3 TURBO (Vendor: 0f0d Product: 0009)"];

    this.GamePadKeyData = [
      { index: 0, data: 0x01 },
      { index: 0, data: 0x02 },
      { index: 0, data: 0x04 },
      { index: 0, data: 0x08 },
      { index: 1, data: 0x01 },
      { index: 1, data: 0x04 },
      { index: 1, data: 0x08 },
      { index: 1, data: 0x02 },
      { index: 2, data: 0x01 },
      { index: 2, data: 0x02 },
      { index: 2, data: 0x04 },
      { index: 2, data: 0x08 },
    ];

    this.GamePadPovData = [0x01, 0x01 | 0x02, 0x02, 0x02 | 0x04, 0x04, 0x04 | 0x08, 0x08, 0x01 | 0x08];
  }

  JoystickInit() {
    this.JoystickSEL = 0;
    this.JoystickCLR = 0;

    for (let i = 0; i < this.Keybord.length; i++) {
      this.Keybord[i][0] = 0xbf;
      this.Keybord[i][1] = 0xbf;
      this.Keybord[i][2] = 0xbf;
      this.Keybord[i][3] = 0xb0;
    }

    this.GamePadSelect = 0;
    this.GamePadButtonSelect = 0x00;
    this.GamePadBuffer = 0x00;
  }

  SetJoystick(data) {
    let sel = data & 0x01;
    let clr = (data & 0x02) >> 1;

    if (this.JoystickSEL == 1 && this.JoystickCLR == 0 && sel == 1 && clr == 1) {
      this.JoystickSEL = 0;
      this.JoystickCLR = 0;
      this.GamePadSelect = 0;
      if (this.GamePadButton6) this.GamePadButtonSelect = this.GamePadButtonSelect ^ 0x02;
      this.GamePadBuffer = 0xb0 | this.CountryType;
      return;
    }

    if (this.JoystickSEL == 0 && this.JoystickCLR == 0 && sel == 1 && clr == 0) this.GamePadSelect++;

    this.JoystickSEL = sel;
    this.JoystickCLR = clr;

    let no = this.MultiTap ? this.GamePadSelect - 1 : 0;
    if (no < 5) {
      let tmp = this.GamePadButtonSelect | this.JoystickSEL;
      this.GamePadBuffer = (this.Keybord[no][tmp] & this.GamePad[no][tmp]) | this.CountryType;
    } else this.GamePadBuffer = 0xb0 | this.CountryType;
  }

  GetJoystick() {
    return this.GamePadBuffer;
  }

  UnsetButtonRUN(no) {
    this.Keybord[no][0] |= 0x08;
  }

  UnsetButtonSELECT(no) {
    this.Keybord[no][0] |= 0x04;
  }

  UnsetButtonSHOT2(no) {
    this.Keybord[no][0] |= 0x02;
  }

  UnsetButtonSHOT1(no) {
    this.Keybord[no][0] |= 0x01;
  }

  UnsetButtonLEFT(no) {
    this.Keybord[no][1] |= 0x08;
  }

  UnsetButtonDOWN(no) {
    this.Keybord[no][1] |= 0x04;
  }

  UnsetButtonRIGHT(no) {
    this.Keybord[no][1] |= 0x02;
  }

  UnsetButtonUP(no) {
    this.Keybord[no][1] |= 0x01;
  }

  UnsetButtonSHOT6(no) {
    this.Keybord[no][2] |= 0x08;
  }

  UnsetButtonSHOT5(no) {
    this.Keybord[no][2] |= 0x04;
  }

  UnsetButtonSHOT4(no) {
    this.Keybord[no][2] |= 0x02;
  }

  UnsetButtonSHOT3(no) {
    this.Keybord[no][2] |= 0x01;
  }

  SetButtonRUN(no) {
    this.Keybord[no][0] &= ~0x08;
  }

  SetButtonSELECT(no) {
    this.Keybord[no][0] &= ~0x04;
  }

  SetButtonSHOT2(no) {
    this.Keybord[no][0] &= ~0x02;
  }

  SetButtonSHOT1(no) {
    this.Keybord[no][0] &= ~0x01;
  }

  SetButtonLEFT(no) {
    this.Keybord[no][1] &= ~0x08;
  }

  SetButtonDOWN(no) {
    this.Keybord[no][1] &= ~0x04;
  }

  SetButtonRIGHT(no) {
    this.Keybord[no][1] &= ~0x02;
  }

  SetButtonUP(no) {
    this.Keybord[no][1] &= ~0x01;
  }

  SetButtonSHOT6(no) {
    this.Keybord[no][2] &= ~0x08;
  }

  SetButtonSHOT5(no) {
    this.Keybord[no][2] &= ~0x04;
  }

  SetButtonSHOT4(no) {
    this.Keybord[no][2] &= ~0x02;
  }

  SetButtonSHOT3(no) {
    this.Keybord[no][2] &= ~0x01;
  }

  CheckKeyUpFunction(evt) {
    switch (evt.keyCode) {
      case 83: // RUN 'S'
        this.UnsetButtonRUN(0);
        break;
      case 65: // SELECT 'A'
        this.UnsetButtonSELECT(0);
        break;
      case 90: // SHOT2 'Z'
        this.UnsetButtonSHOT2(0);
        break;
      case 88: // SHOT1 'X'
        this.UnsetButtonSHOT1(0);
        break;

      case 86: // SHOT2 'V'
        this.UnsetButtonSHOT2(0);
        break;
      case 66: // SHOT1 'B'
        this.UnsetButtonSHOT1(0);
        break;

      case 37: // LEFT
        this.UnsetButtonLEFT(0);
        break;
      case 39: // RIGHT
        this.UnsetButtonRIGHT(0);
        break;
      case 40: // DOWN
        this.UnsetButtonDOWN(0);
        break;
      case 38: // UP
        this.UnsetButtonUP(0);
        break;

      case 71: // SHOT6 'G'
        this.UnsetButtonSHOT6(0);
        break;
      case 70: // SHOT5 'F'
        this.UnsetButtonSHOT5(0);
        break;
      case 68: // SHOT4 'D'
        this.UnsetButtonSHOT4(0);
        break;
      case 67: // SHOT3 'C'
        this.UnsetButtonSHOT3(0);
        break;
    }
    evt.preventDefault();
  }

  CheckKeyDownFunction(evt) {
    switch (evt.keyCode) {
      case 83: // RUN 'S'
        this.SetButtonRUN(0);
        break;
      case 65: // SELECT 'A'
        this.SetButtonSELECT(0);
        break;
      case 90: // SHOT2 'Z'
        this.SetButtonSHOT2(0);
        break;
      case 88: // SHOT1 'X'
        this.SetButtonSHOT1(0);
        break;

      case 86: // SHOT2 'V'
        this.SetButtonSHOT2(0);
        break;
      case 66: // SHOT1 'B'
        this.SetButtonSHOT1(0);
        break;

      case 37: // LEFT
        this.SetButtonLEFT(0);
        break;
      case 39: // RIGHT
        this.SetButtonRIGHT(0);
        break;
      case 40: // DOWN
        this.SetButtonDOWN(0);
        break;
      case 38: // UP
        this.SetButtonUP(0);
        break;

      case 71: // SHOT6 'G'
        this.SetButtonSHOT6(0);
        break;
      case 70: // SHOT5 'F'
        this.SetButtonSHOT5(0);
        break;
      case 68: // SHOT4 'D'
        this.SetButtonSHOT4(0);
        break;
      case 67: // SHOT3 'C'
        this.SetButtonSHOT3(0);
        break;
    }
    evt.preventDefault();
  }

  JoystickEventInit() {
    this.KeyUpFunction = this.CheckKeyUpFunction.bind(this);
    this.KeyDownFunction = this.CheckKeyDownFunction.bind(this);
    window.addEventListener("keyup", this.KeyUpFunction, true);
    window.addEventListener("keydown", this.KeyDownFunction, true);
  }

  JoystickEventRelease() {
    window.removeEventListener("keyup", this.KeyUpFunction, true);
    window.removeEventListener("keydown", this.KeyDownFunction, true);
  }

  CheckGamePad() {
    for (let i = 0; i < this.GamePad.length; i++) {
      this.GamePad[i][0] = 0xbf;
      this.GamePad[i][1] = 0xbf;
      this.GamePad[i][2] = 0xbf;
      this.GamePad[i][3] = 0xb0;
    }

    if (typeof navigator.getGamepads === "undefined") return;

    let pads = navigator.getGamepads();
    for (let i = 0; i < 5; i++) {
      let pad = pads[i];
      if (typeof pad !== "undefined" && pad !== null) {
        let paddata;
        if (pad.mapping === "standard") paddata = this.GamePadData["STANDARD PAD"];
        else {
          paddata = this.GamePadData[pad.id];
          if (typeof paddata === "undefined") paddata = this.GamePadData["UNKNOWN PAD"];
        }
        paddata = this.GamePadButton6 ? paddata[1] : paddata[0];

        let tmp = 0;
        for (const val0 of paddata) {
          for (const val1 of val0) {
            switch (val1.type) {
              case "B":
                if (pad.buttons[val1.index].pressed)
                  this.GamePad[i][this.GamePadKeyData[tmp].index] &= ~this.GamePadKeyData[tmp].data;
                break;
              case "A-":
                if (pad.axes[val1.index] < -0.5)
                  this.GamePad[i][this.GamePadKeyData[tmp].index] &= ~this.GamePadKeyData[tmp].data;
                break;
              case "A+":
                if (pad.axes[val1.index] > 0.5)
                  this.GamePad[i][this.GamePadKeyData[tmp].index] &= ~this.GamePadKeyData[tmp].data;
                break;
              case "AB":
                if (pad.axes[val1.index] > -0.75)
                  this.GamePad[i][this.GamePadKeyData[tmp].index] &= ~this.GamePadKeyData[tmp].data;
                break;
              case "P":
                let povtmp = (((pad.axes[val1.index] + 1) * 7) / 2 + 0.5) | 0;
                this.GamePad[i][1] &= ~(povtmp <= 7 ? this.GamePadPovData[povtmp] : 0x00);
                break;
            }
          }
          tmp++;
        }
      }
    }
  }
}

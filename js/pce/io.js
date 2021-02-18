class IO {
  constructor(core) {
    this.Core = core;
    this.JoystickSEL = 0;
    this.JoystickCLR = 0;
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
    this.axesMap = {
      RIGHT: {
        no: 7,
        press: false,
      },
      LEFT: {
        no: 6,
        press: false,
      },
      DOWN: {
        no: 5,
        press: false,
      },
      UP: {
        no: 4,
        press: false,
      },
    };
    this.buttonMap = {
      START: {
        no: 9,
        press: false,
      },
      SELECT: {
        no: 8,
        press: false,
      },
      A: {
        no: 1,
        press: false,
      },
      B: {
        no: 2,
        press: false,
      },
    };
  }

  JoystickInit() {
    for (let i = 0; i < this.Keybord.length; i++) {
      this.Keybord[i][0] = 0xbf;
      this.Keybord[i][1] = 0xbf;
    }

    this.GamePadSelect = 0;
    this.GamePadButtonSelect = 0x00;
    this.GamePadBuffer = 0x00;
  }
  GetJoystick() {
    return this.GamePadBuffer;
  }
  SetJoystick(data) {
    let sel = data & 0x01;
    let clr = (data & 0x02) >> 1;

    if (this.JoystickSEL == 1 && this.JoystickCLR == 0 && sel == 1 && clr == 1) {
      this.JoystickSEL = 0;
      this.JoystickCLR = 0;
      this.GamePadSelect = 0;
      if (this.GamePadButton6) this.GamePadButtonSelect = this.GamePadButtonSelect ^ 0x02;
      this.GamePadBuffer = 0xb0 | this.Core.CountryType;
      return;
    }

    if (this.JoystickSEL == 0 && this.JoystickCLR == 0 && sel == 1 && clr == 0) this.GamePadSelect++;
    this.JoystickSEL = sel;
    this.JoystickCLR = clr;

    let no = this.MultiTap ? this.GamePadSelect - 1 : 0;
    if (no < 5) {
      let tmp = this.GamePadButtonSelect | this.JoystickSEL;
      this.GamePadBuffer = (this.Keybord[no][tmp] & this.GamePad[no][tmp]) | this.Core.CountryType;
    } else this.GamePadBuffer = 0xb0 | this.Core.CountryType;
  }
  CheckKeyUpFunction(evt) {
    switch (evt.keyCode) {
      case 13: // RUN 'S'
        this.UnsetButtonRUN(0);
        break;
      case 16: // SELECT 'A'
        this.UnsetButtonSELECT(0);
        break;
      case 90: // SHOT2 'Z'
        this.UnsetButtonSHOT2(0);
        break;
      case 65: // SHOT1 'X'
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
      case 13: // RUN 'S'
        this.SetButtonRUN(0);
        break;
      case 16: // SELECT 'A'
        this.SetButtonSELECT(0);
        break;
      case 90: // SHOT2 'Z'
        this.SetButtonSHOT2(0);
        break;
      case 65: // SHOT1 'X'
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
    window.addEventListener("keyup", (e) => {
      this.CheckKeyUpFunction(e);
    });
    window.addEventListener("keydown", (e) => {
      this.CheckKeyDownFunction(e);
    });
  }

  CheckGamePad() {
    for (let i = 0; i < this.GamePad.length; i++) {
      this.GamePad[i][0] = 0xbf;
      this.GamePad[i][1] = 0xbf;

    }

    let pads = navigator.getGamepads();
    let pad = pads[1];
    if (pad) {
      this.checkButton("START", pad.buttons);
      this.checkButton("SELECT", pad.buttons);
      this.checkAxes(pad.axes);
      this.checkButton("A", pad.buttons);
      this.checkButton("B", pad.buttons);
    }
  }
  checkButton(name, buttons) {
    for (var i = 0; i < buttons.length; i++) {
      let btn = buttons[i];
      if (i === this.buttonMap[name].no) {
        if (btn.pressed) {
          // if (this.buttonMap[name].press) return;
          this.buttonMap[name].press = true;
          this.pressButton(name)
          return true;
        } else {
          if (this.buttonMap[name].press) {
            this.buttonMap[name].press = false;
            this.unpressButton(name)
          }
        }
      }
    }
    return;
  }
  pressButton(name){
    if(name === "START"){
      this.GamePad[0][0] &= ~0x08;
    }else if(name === "SELECT"){
      this.GamePad[0][0] &= ~0x04;
    }else if(name === "A"){
      this.GamePad[0][0] &= ~0x01;
    }else if(name === "B"){
      this.GamePad[0][0] &= ~0x02;
    }
  }
  unpressButton(name){

  }
  checkAxes(axes) {
    var val = 0;
    if (axes[0] < -0.5) {
      val += 1;
    } else if (axes[0] > 0.5) {
      val += 2;
    }
    if (axes[1] < -0.5) {
      val += 4;
    } else if (axes[1] > 0.5) {
      val += 8;
    }
    if (val === 1) {
      this.checkAxesButton("UP", false);
      this.checkAxesButton("DOWN", false);
      this.checkAxesButton("RIGHT", false);
      this.checkAxesButton("LEFT", true);
    } else if (val === 2) {
      this.checkAxesButton("UP", false);
      this.checkAxesButton("DOWN", false);
      this.checkAxesButton("LEFT", false);
      this.checkAxesButton("RIGHT", true);
    } else if (val === 4) {
      this.checkAxesButton("LEFT", false);
      this.checkAxesButton("RIGHT", false);
      this.checkAxesButton("DOWN", false);
      this.checkAxesButton("UP", true);
    } else if (val === 8) {
      this.checkAxesButton("LEFT", false);
      this.checkAxesButton("RIGHT", false);
      this.checkAxesButton("UP", false);
      this.checkAxesButton("DOWN", true);
    } else if (val === 5) {
      this.checkAxesButton("RIGHT", false);
      this.checkAxesButton("DOWN", false);
      this.checkAxesButton("UP", true);
      this.checkAxesButton("LEFT", true);
    } else if (val === 6) {
      this.checkAxesButton("LEFT", false);
      this.checkAxesButton("DOWN", false);
      this.checkAxesButton("RIGHT", true);
      this.checkAxesButton("UP", true);
    } else if (val === 9) {
      this.checkAxesButton("RIGHT", false);
      this.checkAxesButton("UP", false);
      this.checkAxesButton("DOWN", true);
      this.checkAxesButton("LEFT", true);
    } else if (val === 10) {
      this.checkAxesButton("LEFT", false);
      this.checkAxesButton("UP", false);
      this.checkAxesButton("DOWN", true);
      this.checkAxesButton("RIGHT", true);
    } else {
      this.checkAxesButton("LEFT", false);
      this.checkAxesButton("RIGHT", false);
      this.checkAxesButton("UP", false);
      this.checkAxesButton("DOWN", false);
    }
  }
  checkAxesButton(name, pressed) {
    if (pressed) {
      this.axesMap[name].press = true;
      this.pressAxesButton(name)
      return true;
    } else {
      if (this.axesMap[name].press) {
        this.axesMap[name].press = false;
        this.unpressAxesButton(name)
      }
    }
    return;
  }
  pressAxesButton(name){
    if(name === "LEFT"){
      this.GamePad[0][1] &= ~0x08;
    }else if(name === "RIGHT"){
      this.GamePad[0][1] &= ~0x02;
    }else if(name === "UP"){
      this.GamePad[0][1] &= ~0x01;
    }else if(name === "DOWN"){
      this.GamePad[0][1] &= ~0x04;
    }
  }
  unpressAxesButton(){

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
}

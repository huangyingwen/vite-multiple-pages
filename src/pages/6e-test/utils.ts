function rgbToHex(r, g, b) {
  var hex = ((r << 16) | (g << 8) | b).toString(16);
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
}

function hexToRgb(hex) {
  var rgb = [];
  for (var i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)));
  }
  return rgb;
}

export function gradient(startColor, endColor, step) {
  //将hex转换为rgb
  var sColor = hexToRgb(startColor),
    eColor = hexToRgb(endColor);

  //计算R\G\B每一步的差值
  var rStep = (eColor[0] - sColor[0]) / step;
  var gStep = (eColor[1] - sColor[1]) / step;
  var bStep = (eColor[2] - sColor[2]) / step;

  var gradientColorArr = [];
  for (var i = 0; i < step; i++) {
    //计算每一步的hex值
    gradientColorArr.push(
      rgbToHex(
        parseInt(rStep * i + sColor[0]),
        parseInt(gStep * i + sColor[1]),
        parseInt(bStep * i + sColor[2]),
      ),
    );
  }
  return gradientColorArr;
}

const colors = gradient('#00FF00', '#880808', 11);

export function getColor(count: number) {
  if (count < 10) {
    return colors[0];
  } else if (count < 20) {
    return colors[1];
  } else if (count < 30) {
    return colors[2];
  } else if (count < 40) {
    return colors[3];
  } else if (count < 50) {
    return colors[4];
  } else if (count < 60) {
    return colors[5];
  } else if (count < 70) {
    return colors[6];
  } else if (count < 80) {
    return colors[7];
  } else if (count < 90) {
    return colors[8];
  } else if (count < 100) {
    return colors[9];
  } else {
    return colors[10];
  }
}

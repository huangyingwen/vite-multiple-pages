function rgbToHex(r, g, b) {
  const hex = ((r << 16) | (g << 8) | b).toString(16);
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
}

function hexToRgb(hex) {
  const rgb = [];
  for (let i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)));
  }
  return rgb;
}

export function gradient(startColor, endColor, step) {
  // 将hex转换为rgb
  const sColor = hexToRgb(startColor);
  const eColor = hexToRgb(endColor);

  // 计算R\G\B每一步的差值
  const rStep = (eColor[0] - sColor[0]) / step;
  const gStep = (eColor[1] - sColor[1]) / step;
  const bStep = (eColor[2] - sColor[2]) / step;

  const gradientColorArr = [];
  for (let i = 0; i < step; i++) {
    // 计算每一步的hex值
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

export function getColors() {
  const colors = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j <= 256; j += 4) {
      if (i === 0 && j >= 128) {
        // colors.push(rgbToHex(0, 0, j > 255 ? 255 : j));
      } else if (i === 1 && j > 2 && j <= 252) {
        colors.push(rgbToHex(0, j > 255 ? 255 : j, 255));
      } else if (i === 2 && j >= 2 && j < 254) {
        colors.push(
          rgbToHex(j > 255 ? 255 : j - 2, 255, 258 - j < 0 ? 0 : 258 - j),
        );
      } else if (i === 3 && j > 0) {
        colors.push(rgbToHex(255, 256 - j, 0));
      } else if (i === 4 && j > 0 && j <= 128) {
        // colors.push(rgbToHex(256 - j, 0, 0));
      }
    }
  }

  return colors;
}

const colors = getColors();

export function getColor(count: number) {
  return colors[
    Math.floor(Math.min(189, (189 * Math.log(count)) / Math.log(65536)))
  ];

  if (count < 20) {
    return colors[0];
  } else if (count < 40) {
    return colors[1];
  } else if (count < 60) {
    return colors[2];
  } else if (count < 80) {
    return colors[3];
  } else if (count < 100) {
    return colors[4];
  } else if (count < 120) {
    return colors[5];
  } else if (count < 140) {
    return colors[6];
  } else if (count < 160) {
    return colors[7];
  } else if (count < 180) {
    return colors[8];
  } else if (count < 200) {
    return colors[9];
  } else {
    return colors[10];
  }
}

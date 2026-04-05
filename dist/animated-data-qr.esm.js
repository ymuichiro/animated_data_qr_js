/*! animated-data-qr-js v0.1.0 | MIT */
const __ADQ_MODULE_URL__ = import.meta.url;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "node_modules/qrcode/lib/can-promise.js"(exports, module) {
    module.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module.exports = BitBuffer;
  }
});

// node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j2 = 0; j2 < posLength; j2++) {
          if (i === 0 && j2 === 0 || // top-left
          i === 0 && j2 === posLength - 1 || // bottom-left
          i === posLength - 1 && j2 === 0) {
            continue;
          }
          coords.push([pos[i], pos[j2]]);
        }
      }
      return coords;
    };
  }
});

// node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k2 = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k2 * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j2) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j2) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j2 % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j2) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j2 / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j2 % 2 + i * j2 % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j2 % 2 + i * j2 % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j2 % 3 + (i + j2) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p2 = 0; p2 < numPatterns; p2++) {
        setupFormatFunc(p2);
        exports.applyMask(p2, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p2, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p2;
        }
      }
      return bestPattern;
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    };
  }
});

// node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j2 = 0; j2 < p2.length; j2++) {
          coeff[i + j2] ^= GF.mul(p1[i], p2[j2]);
        }
      }
      return coeff;
    };
    exports.mod = function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module.exports = ReedSolomonEncoder;
  }
});

// node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    };
  }
});

// node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    };
  }
});

// node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };
    module.exports = NumericData;
  }
});

// node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module.exports = AlphanumericData;
  }
});

// node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length) {
      return length * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l2 = this.data.length; i < l2; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length) {
      return length * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v2, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v2 in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v2)) {
              cost_of_e = adjacent_nodes[v2];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v2];
              first_visit = typeof costs[v2] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v2] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v2, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v2] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        },
        default_sorter: function(a, b2) {
          return a.cost - b2.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j2 = 0; j2 < nodeGroup.length; j2++) {
          const node = nodeGroup[j2];
          const key = "" + i + j2;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c2 = -1; c2 <= 7; c2++) {
            if (col + c2 <= -1 || size <= col + c2) continue;
            if (r >= 0 && r <= 6 && (c2 === 0 || c2 === 6) || c2 >= 0 && c2 <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c2 >= 2 && c2 <= 4) {
              matrix.set(row + r, col + c2, true, true);
            } else {
              matrix.set(row + r, col + c2, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c2 = -2; c2 <= 2; c2++) {
            if (r === -2 || r === 2 || c2 === -2 || c2 === 2 || r === 0 && c2 === 0) {
              matrix.set(row + r, col + c2, true, true);
            } else {
              matrix.set(row + r, col + c2, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits2 = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits2 >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits2 = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits2 >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c2 = 0; c2 < 2; c2++) {
            if (!matrix.isReserved(row, col - c2)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c2, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b2 = 0; b2 < ecTotalBlocks; b2++) {
        const dataSize = b2 < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b2] = buffer.slice(offset, offset + dataSize);
        ecData[b2] = rs.encode(dcData[b2]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c2) {
          return [c2, c2];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j2 = 0; j2 < symbolSize; j2++) {
          let posDst = (i * symbolSize + j2) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j2 >= scaledMargin && i < symbolSize - scaledMargin && j2 < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j2 - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas2(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    exports.render = function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas2(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  }
});

// node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _2, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// src/sender.js
var import_qrcode = __toESM(require_browser(), 1);

// src/utils/base64.js
function hasBuffer() {
  return typeof Buffer !== "undefined" && typeof Buffer.from === "function";
}
function toBase64(base64UrlString) {
  const base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - base64.length % 4) % 4;
  return base64 + "=".repeat(padding);
}
function toBase64Url(base64String) {
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function bytesToBinaryString(bytes) {
  const chunkSize = 32768;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const view = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...view);
  }
  return binary;
}
function bytesToBase64Url(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("bytes must be Uint8Array");
  }
  if (hasBuffer()) {
    return toBase64Url(Buffer.from(bytes).toString("base64"));
  }
  if (typeof btoa !== "function") {
    throw new Error("No base64 encoder available in this environment");
  }
  return toBase64Url(btoa(bytesToBinaryString(bytes)));
}
function base64UrlToBytes(base64UrlString) {
  if (typeof base64UrlString !== "string") {
    throw new TypeError("base64UrlString must be a string");
  }
  const base64 = toBase64(base64UrlString);
  if (hasBuffer()) {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  if (typeof atob !== "function") {
    throw new Error("No base64 decoder available in this environment");
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

// src/utils/chunk.js
function splitBytes(bytes, chunkByteSize) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("bytes must be Uint8Array");
  }
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }
  if (bytes.length === 0) {
    return [new Uint8Array(0)];
  }
  const chunks = [];
  for (let index = 0; index < bytes.length; index += chunkByteSize) {
    chunks.push(bytes.slice(index, index + chunkByteSize));
  }
  return chunks;
}
function concatChunks(chunks, expectedSize = null) {
  if (!Array.isArray(chunks)) {
    throw new TypeError("chunks must be an array");
  }
  const totalSize = Number.isInteger(expectedSize) && expectedSize >= 0 ? expectedSize : chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    if (!(chunk instanceof Uint8Array)) {
      throw new TypeError("Each chunk must be Uint8Array");
    }
    if (offset >= output.length) {
      break;
    }
    const writableLength = Math.min(chunk.length, output.length - offset);
    output.set(chunk.subarray(0, writableLength), offset);
    offset += writableLength;
  }
  return output;
}

// src/grid.js
function getGridDimensions(symbolsPerFrame) {
  if (!Number.isInteger(symbolsPerFrame) || symbolsPerFrame <= 0) {
    throw new TypeError("symbolsPerFrame must be an integer > 0");
  }
  const columns = Math.ceil(Math.sqrt(symbolsPerFrame));
  const rows = Math.ceil(symbolsPerFrame / columns);
  return {
    columns,
    rows
  };
}
function groupIntoBatches(items, batchSize) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new TypeError("batchSize must be an integer > 0");
  }
  const batches = [];
  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }
  return batches;
}

// src/stage-layout.js
var CANONICAL_STAGE_SIZE = 1e3;
var PLAIN_PAYLOAD_INSET = 104;
var PLAIN_PAYLOAD_GAP = 22;
function scaleValue(value, size) {
  return Math.round(value / CANONICAL_STAGE_SIZE * size);
}
function createCellRects(symbolCount, payloadRect, gap) {
  if (symbolCount === 1) {
    return [{ ...payloadRect }];
  }
  if (symbolCount === 2) {
    const cellWidth2 = Math.floor((payloadRect.width - gap) / 2);
    return [
      {
        x: payloadRect.x,
        y: payloadRect.y,
        width: cellWidth2,
        height: payloadRect.height
      },
      {
        x: payloadRect.x + payloadRect.width - cellWidth2,
        y: payloadRect.y,
        width: cellWidth2,
        height: payloadRect.height
      }
    ];
  }
  if (symbolCount === 4) {
    const cellWidth2 = Math.floor((payloadRect.width - gap) / 2);
    const cellHeight2 = Math.floor((payloadRect.height - gap) / 2);
    return [
      { x: payloadRect.x, y: payloadRect.y, width: cellWidth2, height: cellHeight2 },
      {
        x: payloadRect.x + payloadRect.width - cellWidth2,
        y: payloadRect.y,
        width: cellWidth2,
        height: cellHeight2
      },
      {
        x: payloadRect.x,
        y: payloadRect.y + payloadRect.height - cellHeight2,
        width: cellWidth2,
        height: cellHeight2
      },
      {
        x: payloadRect.x + payloadRect.width - cellWidth2,
        y: payloadRect.y + payloadRect.height - cellHeight2,
        width: cellWidth2,
        height: cellHeight2
      }
    ];
  }
  const { columns, rows } = getGridDimensions(symbolCount);
  const cellWidth = Math.floor((payloadRect.width - gap * (columns - 1)) / columns);
  const cellHeight = Math.floor((payloadRect.height - gap * (rows - 1)) / rows);
  const rects = [];
  for (let index = 0; index < symbolCount; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    rects.push({
      x: payloadRect.x + column * (cellWidth + gap),
      y: payloadRect.y + row * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight
    });
  }
  return rects;
}
function normalizeStageSymbolCount(symbolCount) {
  if (symbolCount === 1 || symbolCount === 2 || symbolCount === 4) {
    return symbolCount;
  }
  if (!Number.isInteger(symbolCount) || symbolCount <= 1) {
    return 1;
  }
  return symbolCount;
}
function getPlainStageLayout(symbolCount = 1, size = CANONICAL_STAGE_SIZE) {
  const normalizedSymbolCount = normalizeStageSymbolCount(symbolCount);
  const payloadRect = {
    x: scaleValue(PLAIN_PAYLOAD_INSET, size),
    y: scaleValue(PLAIN_PAYLOAD_INSET, size),
    width: size - scaleValue(PLAIN_PAYLOAD_INSET, size) * 2,
    height: size - scaleValue(PLAIN_PAYLOAD_INSET, size) * 2
  };
  return {
    size,
    symbolCount: normalizedSymbolCount,
    payloadRect,
    cells: createCellRects(
      normalizedSymbolCount,
      payloadRect,
      scaleValue(PLAIN_PAYLOAD_GAP, size)
    )
  };
}

// src/protocol.js
var PROTOCOL_MAGIC = "ADQR1";
var FRAME_SEPARATOR = "|";
var FRAME_SEPARATOR_CODE = FRAME_SEPARATOR.charCodeAt(0);
var PROTOCOL_MAGIC_BYTES = asciiStringToBytes(PROTOCOL_MAGIC);
function encodeText(value) {
  return encodeURIComponent(value != null ? value : "");
}
function decodeText(value) {
  return decodeURIComponent(value != null ? value : "");
}
function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
function asciiStringToBytes(value) {
  const output = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    output[index] = value.charCodeAt(index) & 255;
  }
  return output;
}
function asciiBytesToString(bytes) {
  const chunkSize = 32768;
  let output = "";
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const view = bytes.subarray(index, index + chunkSize);
    output += String.fromCharCode(...view);
  }
  return output;
}
function asUint8Array(value) {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof Uint8ClampedArray) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  return null;
}
function concatBytes(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}
function hasMagicPrefix(bytes) {
  if (bytes.length < PROTOCOL_MAGIC_BYTES.length) {
    return false;
  }
  for (let index = 0; index < PROTOCOL_MAGIC_BYTES.length; index += 1) {
    if (bytes[index] !== PROTOCOL_MAGIC_BYTES[index]) {
      return false;
    }
  }
  return true;
}
function findSeparatorOffsets(bytes, expectedCount) {
  const offsets = [];
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === FRAME_SEPARATOR_CODE) {
      offsets.push(index);
      if (offsets.length === expectedCount) {
        break;
      }
    }
  }
  return offsets;
}
function parseTextFrame(frameText) {
  var _a2, _b2;
  if (typeof frameText !== "string" || frameText.length === 0) {
    return null;
  }
  const parts = frameText.split(FRAME_SEPARATOR);
  if (parts.length < 2 || parts[0] !== PROTOCOL_MAGIC) {
    return null;
  }
  if (parts[1] === "M") {
    if (parts.length < 8) {
      return null;
    }
    const totalChunks = parsePositiveInt(parts[3]);
    const chunkByteSize = parsePositiveInt(parts[4]);
    const fileSize = parsePositiveInt(parts[5]);
    if (totalChunks === null || totalChunks <= 0 || chunkByteSize === null || fileSize === null) {
      return null;
    }
    let mimeType;
    let fileName;
    const parityBlockDataChunks = parts.length >= 9 ? (_a2 = parsePositiveInt(parts[8])) != null ? _a2 : 0 : 0;
    const symbolsPerFrame = parts.length >= 10 ? (_b2 = parsePositiveInt(parts[9])) != null ? _b2 : 1 : 1;
    try {
      mimeType = decodeText(parts[6]) || "application/octet-stream";
      fileName = decodeText(parts[7]) || "transfer.bin";
    } catch {
      return null;
    }
    return {
      type: "manifest",
      sessionId: parts[2],
      totalChunks,
      chunkByteSize,
      fileSize,
      mimeType,
      fileName,
      parityBlockDataChunks,
      symbolsPerFrame
    };
  }
  if (parts[1] === "C") {
    if (parts.length < 6) {
      return null;
    }
    const chunkIndex = parsePositiveInt(parts[3]);
    const totalChunks = parsePositiveInt(parts[4]);
    const dataBase64Url = parts[5];
    if (chunkIndex === null || totalChunks === null || totalChunks <= 0) {
      return null;
    }
    try {
      return {
        type: "chunk",
        sessionId: parts[2],
        chunkIndex,
        totalChunks,
        dataBase64Url,
        dataBytes: base64UrlToBytes(dataBase64Url)
      };
    } catch {
      return null;
    }
  }
  if (parts[1] === "P") {
    if (parts.length < 6) {
      return null;
    }
    const blockStartChunkIndex = parsePositiveInt(parts[3]);
    const totalChunks = parsePositiveInt(parts[4]);
    const dataBase64Url = parts[5];
    if (blockStartChunkIndex === null || totalChunks === null || totalChunks <= 0) {
      return null;
    }
    try {
      return {
        type: "parity",
        sessionId: parts[2],
        blockStartChunkIndex,
        totalChunks,
        dataBase64Url,
        dataBytes: base64UrlToBytes(dataBase64Url)
      };
    } catch {
      return null;
    }
  }
  return null;
}
function parseBinaryFrame(frameBytes) {
  const bytes = asUint8Array(frameBytes);
  if (!bytes || bytes.length === 0 || !hasMagicPrefix(bytes)) {
    return null;
  }
  const separators = findSeparatorOffsets(bytes, 5);
  if (separators.length < 2) {
    return null;
  }
  const magic = asciiBytesToString(bytes.subarray(0, separators[0]));
  const frameType = asciiBytesToString(bytes.subarray(separators[0] + 1, separators[1]));
  if (magic !== PROTOCOL_MAGIC) {
    return null;
  }
  if (frameType === "M") {
    return parseTextFrame(asciiBytesToString(bytes));
  }
  if (frameType === "C" || frameType === "P") {
    if (separators.length < 5) {
      return null;
    }
    const sessionId = asciiBytesToString(bytes.subarray(separators[1] + 1, separators[2]));
    const indexValue = parsePositiveInt(
      asciiBytesToString(bytes.subarray(separators[2] + 1, separators[3]))
    );
    const totalChunks = parsePositiveInt(
      asciiBytesToString(bytes.subarray(separators[3] + 1, separators[4]))
    );
    if (!sessionId || indexValue === null || totalChunks === null || totalChunks <= 0) {
      return null;
    }
    if (frameType === "C") {
      return {
        type: "chunk",
        sessionId,
        chunkIndex: indexValue,
        totalChunks,
        dataBytes: bytes.slice(separators[4] + 1)
      };
    }
    return {
      type: "parity",
      sessionId,
      blockStartChunkIndex: indexValue,
      totalChunks,
      dataBytes: bytes.slice(separators[4] + 1)
    };
  }
  return null;
}
function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  const random = Math.floor(Math.random() * 4294967295).toString(16).padStart(8, "0");
  return `s${Date.now().toString(36)}${random}`;
}
function encodeManifestFrame({
  sessionId,
  totalChunks,
  chunkByteSize,
  fileSize,
  mimeType,
  fileName,
  parityBlockDataChunks = 0,
  symbolsPerFrame = 1
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  const parts = [
    PROTOCOL_MAGIC,
    "M",
    sessionId,
    String(totalChunks),
    String(chunkByteSize),
    String(fileSize),
    encodeText(mimeType || "application/octet-stream"),
    encodeText(fileName || "transfer.bin"),
    String(parityBlockDataChunks),
    String(symbolsPerFrame)
  ];
  return parts.join(FRAME_SEPARATOR);
}
function encodeChunkFrame({
  sessionId,
  chunkIndex,
  totalChunks,
  dataBase64Url
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new Error("chunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }
  if (typeof dataBase64Url !== "string") {
    throw new Error("dataBase64Url must be a string");
  }
  return [
    PROTOCOL_MAGIC,
    "C",
    sessionId,
    String(chunkIndex),
    String(totalChunks),
    dataBase64Url
  ].join(FRAME_SEPARATOR);
}
function encodeParityFrame({
  sessionId,
  blockStartChunkIndex,
  totalChunks,
  dataBase64Url
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(blockStartChunkIndex) || blockStartChunkIndex < 0) {
    throw new Error("blockStartChunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }
  if (typeof dataBase64Url !== "string") {
    throw new Error("dataBase64Url must be a string");
  }
  return [
    PROTOCOL_MAGIC,
    "P",
    sessionId,
    String(blockStartChunkIndex),
    String(totalChunks),
    dataBase64Url
  ].join(FRAME_SEPARATOR);
}
function encodeChunkFrameBinary({
  sessionId,
  chunkIndex,
  totalChunks,
  dataBytes
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new Error("chunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }
  const payloadBytes = asUint8Array(dataBytes);
  if (!payloadBytes) {
    throw new Error("dataBytes must be Uint8Array-compatible");
  }
  const headerBytes = asciiStringToBytes(
    [
      PROTOCOL_MAGIC,
      "C",
      sessionId,
      String(chunkIndex),
      String(totalChunks),
      ""
    ].join(FRAME_SEPARATOR)
  );
  return concatBytes([headerBytes, payloadBytes]);
}
function encodeParityFrameBinary({
  sessionId,
  blockStartChunkIndex,
  totalChunks,
  dataBytes
}) {
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  if (!Number.isInteger(blockStartChunkIndex) || blockStartChunkIndex < 0) {
    throw new Error("blockStartChunkIndex must be an integer >= 0");
  }
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
    throw new Error("totalChunks must be an integer > 0");
  }
  const payloadBytes = asUint8Array(dataBytes);
  if (!payloadBytes) {
    throw new Error("dataBytes must be Uint8Array-compatible");
  }
  const headerBytes = asciiStringToBytes(
    [
      PROTOCOL_MAGIC,
      "P",
      sessionId,
      String(blockStartChunkIndex),
      String(totalChunks),
      ""
    ].join(FRAME_SEPARATOR)
  );
  return concatBytes([headerBytes, payloadBytes]);
}
function parseFrame(frameInput) {
  if (typeof frameInput === "string") {
    return parseTextFrame(frameInput);
  }
  return parseBinaryFrame(frameInput);
}

// src/emitter.js
var SimpleEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(eventName, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("listener must be a function");
    }
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, /* @__PURE__ */ new Set());
    }
    this.listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }
  off(eventName, listener) {
    const set = this.listeners.get(eventName);
    if (!set) {
      return;
    }
    set.delete(listener);
    if (set.size === 0) {
      this.listeners.delete(eventName);
    }
  }
  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set) {
      return;
    }
    for (const listener of set) {
      listener(payload);
    }
  }
};

// src/tuning.js
var DEFAULT_FRAME_INTERVAL_MS = 250;
var DEFAULT_CHUNK_BYTE_SIZE = 220;
var DEFAULT_PAYLOAD_ENCODING = "binary";
var DEFAULT_SYMBOLS_PER_FRAME = 1;
var TRANSFER_PRESETS = Object.freeze({
  compatibility: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 220,
    payloadEncoding: "binary",
    symbolsPerFrame: 1,
    parityBlockDataChunks: 4,
    qrOptions: Object.freeze({
      errorCorrectionLevel: "M"
    })
  }),
  balanced: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 384,
    payloadEncoding: "binary",
    symbolsPerFrame: 2,
    parityBlockDataChunks: 6,
    qrOptions: Object.freeze({
      errorCorrectionLevel: "M"
    })
  }),
  throughput: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 512,
    payloadEncoding: "binary",
    symbolsPerFrame: 4,
    parityBlockDataChunks: 0,
    qrOptions: Object.freeze({
      errorCorrectionLevel: "L"
    })
  }),
  resilient: Object.freeze({
    frameIntervalMs: 250,
    chunkByteSize: 220,
    payloadEncoding: "binary",
    symbolsPerFrame: 2,
    parityBlockDataChunks: 4,
    qrOptions: Object.freeze({
      errorCorrectionLevel: "M"
    })
  })
});
function resolveTransferPreset(name = "compatibility") {
  var _a2;
  const preset = (_a2 = TRANSFER_PRESETS[name]) != null ? _a2 : TRANSFER_PRESETS.compatibility;
  return {
    frameIntervalMs: preset.frameIntervalMs,
    chunkByteSize: preset.chunkByteSize,
    payloadEncoding: preset.payloadEncoding,
    symbolsPerFrame: preset.symbolsPerFrame,
    parityBlockDataChunks: preset.parityBlockDataChunks,
    qrOptions: {
      ...preset.qrOptions
    }
  };
}
function estimateTransferStats({
  fileSize,
  chunkByteSize = DEFAULT_CHUNK_BYTE_SIZE,
  frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS,
  symbolsPerFrame = DEFAULT_SYMBOLS_PER_FRAME,
  manifestFrames = 1,
  extraFrames = 0
}) {
  if (!Number.isFinite(fileSize) || fileSize < 0) {
    throw new TypeError("fileSize must be a number >= 0");
  }
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }
  if (!Number.isFinite(frameIntervalMs) || frameIntervalMs <= 0) {
    throw new TypeError("frameIntervalMs must be a number > 0");
  }
  if (!Number.isInteger(symbolsPerFrame) || symbolsPerFrame <= 0) {
    throw new TypeError("symbolsPerFrame must be an integer > 0");
  }
  const totalChunks = Math.max(1, Math.ceil(fileSize / chunkByteSize));
  const totalSymbols = totalChunks + manifestFrames + extraFrames;
  const totalFrames = Math.ceil(totalSymbols / symbolsPerFrame);
  const loopDurationMs = totalFrames * frameIntervalMs;
  const bytesPerSecond = fileSize === 0 ? 0 : fileSize / Math.max(loopDurationMs / 1e3, 1);
  return {
    fileSize,
    chunkByteSize,
    frameIntervalMs,
    symbolsPerFrame,
    totalChunks,
    totalSymbols,
    totalFrames,
    loopDurationMs,
    bytesPerSecond
  };
}

// src/sender.js
function toQrSymbol(frame) {
  if (typeof frame === "string") {
    return frame;
  }
  return [{
    data: new Uint8ClampedArray(frame),
    mode: "byte"
  }];
}
function getCanvasDisplaySize(canvas, symbolCount) {
  const width = Math.max(320, canvas.clientWidth || canvas.width || 640);
  const size = Math.max(320, width);
  return {
    width,
    height: size
  };
}
function createQrRenderCache() {
  return {
    strings: /* @__PURE__ */ new Map(),
    objects: /* @__PURE__ */ new WeakMap()
  };
}
function resetQrRenderCache(cache) {
  cache.strings.clear();
  cache.objects = /* @__PURE__ */ new WeakMap();
}
function getCachedQrCanvas(cache, symbol) {
  var _a2, _b2;
  if (typeof symbol === "string") {
    return (_a2 = cache.strings.get(symbol)) != null ? _a2 : null;
  }
  return (_b2 = cache.objects.get(symbol)) != null ? _b2 : null;
}
function setCachedQrCanvas(cache, symbol, value) {
  if (typeof symbol === "string") {
    cache.strings.set(symbol, value);
    return;
  }
  cache.objects.set(symbol, value);
}
async function getRenderedQrCanvas(cache, symbol, drawSize, qrOptions) {
  const cached = getCachedQrCanvas(cache, symbol);
  if (cached && cached.drawSize === drawSize) {
    return cached.canvas;
  }
  const qrCanvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(drawSize, drawSize);
  await import_qrcode.default.toCanvas(qrCanvas, symbol, {
    ...qrOptions,
    width: drawSize
  });
  setCachedQrCanvas(cache, symbol, {
    drawSize,
    canvas: qrCanvas
  });
  return qrCanvas;
}
async function renderPlainQrGrid(canvas, qrSymbols, qrOptions, renderState) {
  const { width, height } = getCanvasDisplaySize(canvas, qrSymbols.length);
  const frameCanvas = renderState.frameCanvas;
  const context = renderState.frameContext;
  const layout = getPlainStageLayout(qrSymbols.length, width);
  frameCanvas.width = width;
  frameCanvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  for (let index = 0; index < qrSymbols.length; index += 1) {
    const cell = layout.cells[index];
    if (!cell) {
      break;
    }
    const drawSize = Math.max(
      96,
      Math.min(cell.width, cell.height) - Math.round(Math.min(cell.width, cell.height) * 0.06)
    );
    const qrCanvas = await getRenderedQrCanvas(
      renderState.qrRenderCache,
      qrSymbols[index],
      drawSize,
      qrOptions
    );
    const x = cell.x + Math.max(0, Math.floor((cell.width - drawSize) / 2));
    const y = cell.y + Math.max(0, Math.floor((cell.height - drawSize) / 2));
    context.drawImage(qrCanvas, x, y, drawSize, drawSize);
  }
  const targetContext = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  targetContext.clearRect(0, 0, width, height);
  targetContext.drawImage(frameCanvas, 0, 0, width, height);
}
async function blobLikeToBytes(fileLike) {
  if (!fileLike || typeof fileLike.arrayBuffer !== "function") {
    throw new TypeError("fileLike must provide arrayBuffer()");
  }
  return new Uint8Array(await fileLike.arrayBuffer());
}
function getDefaultFileName(fileLike) {
  if (typeof (fileLike == null ? void 0 : fileLike.name) === "string" && fileLike.name.length > 0) {
    return fileLike.name;
  }
  return "transfer.bin";
}
function getDefaultMimeType(fileLike) {
  if (typeof (fileLike == null ? void 0 : fileLike.type) === "string" && fileLike.type.length > 0) {
    return fileLike.type;
  }
  return "application/octet-stream";
}
function createChunkFrame({
  payloadEncoding,
  sessionId,
  chunkIndex,
  totalChunks,
  chunkBytes
}) {
  if (payloadEncoding === "base64") {
    return encodeChunkFrame({
      sessionId,
      chunkIndex,
      totalChunks,
      dataBase64Url: bytesToBase64Url(chunkBytes)
    });
  }
  return encodeChunkFrameBinary({
    sessionId,
    chunkIndex,
    totalChunks,
    dataBytes: chunkBytes
  });
}
function createParityChunk(blockChunks, chunkByteSize) {
  const parityBytes = new Uint8Array(chunkByteSize);
  for (const chunkBytes of blockChunks) {
    for (let index = 0; index < chunkBytes.length; index += 1) {
      parityBytes[index] ^= chunkBytes[index];
    }
  }
  return parityBytes;
}
function createParityFrame({
  payloadEncoding,
  sessionId,
  blockStartChunkIndex,
  totalChunks,
  parityBytes
}) {
  if (payloadEncoding === "base64") {
    return encodeParityFrame({
      sessionId,
      blockStartChunkIndex,
      totalChunks,
      dataBase64Url: bytesToBase64Url(parityBytes)
    });
  }
  return encodeParityFrameBinary({
    sessionId,
    blockStartChunkIndex,
    totalChunks,
    dataBytes: parityBytes
  });
}
function createDisplayFrames(frames, qrSymbols, symbolsPerFrame) {
  const groupedFrames = groupIntoBatches(frames, symbolsPerFrame);
  const groupedQrSymbols = groupIntoBatches(qrSymbols, symbolsPerFrame);
  return groupedFrames.map((symbols, index) => ({
    symbols,
    qrSymbols: groupedQrSymbols[index]
  }));
}
function rotateFrameBatch(displayFrame, rotation) {
  if (!displayFrame || displayFrame.qrSymbols.length <= 1 || !Number.isInteger(rotation)) {
    return displayFrame;
  }
  const count = displayFrame.qrSymbols.length;
  const offset = (rotation % count + count) % count;
  if (offset === 0) {
    return displayFrame;
  }
  return {
    symbols: [
      ...displayFrame.symbols.slice(offset),
      ...displayFrame.symbols.slice(0, offset)
    ],
    qrSymbols: [
      ...displayFrame.qrSymbols.slice(offset),
      ...displayFrame.qrSymbols.slice(0, offset)
    ]
  };
}
function getLoopDisplayFrame(prepared, displayFrameIndex, loopIndex = 0) {
  var _a2;
  if (!prepared || prepared.displayFrames.length === 0) {
    return null;
  }
  const symbolsPerFrame = Math.max(1, prepared.symbolsPerFrame || 1);
  const payloadCount = Math.max(0, prepared.frames.length - 1);
  if (symbolsPerFrame === 1 || payloadCount <= 1) {
    return (_a2 = prepared.displayFrames[displayFrameIndex]) != null ? _a2 : prepared.displayFrames[0];
  }
  const payloadOffset = (loopIndex % payloadCount + payloadCount) % payloadCount;
  const startIndex = displayFrameIndex * symbolsPerFrame;
  const symbols = [];
  const qrSymbols = [];
  for (let slot = 0; slot < symbolsPerFrame; slot += 1) {
    const combinedIndex = startIndex + slot;
    if (combinedIndex === 0) {
      symbols.push(prepared.frames[0]);
      qrSymbols.push(prepared.qrFrames[0]);
      continue;
    }
    const rotatedPayloadIndex = combinedIndex - 1;
    if (rotatedPayloadIndex >= payloadCount) {
      break;
    }
    const actualPayloadIndex = 1 + (payloadOffset + rotatedPayloadIndex) % payloadCount;
    symbols.push(prepared.frames[actualPayloadIndex]);
    qrSymbols.push(prepared.qrFrames[actualPayloadIndex]);
  }
  return {
    symbols,
    qrSymbols
  };
}
async function createTransferFrames(fileLike, options = {}) {
  var _a2, _b2, _c, _d, _e2, _f, _g, _h;
  const chunkByteSize = (_a2 = options.chunkByteSize) != null ? _a2 : DEFAULT_CHUNK_BYTE_SIZE;
  if (!Number.isInteger(chunkByteSize) || chunkByteSize <= 0) {
    throw new TypeError("chunkByteSize must be an integer > 0");
  }
  const payloadEncoding = (_b2 = options.payloadEncoding) != null ? _b2 : DEFAULT_PAYLOAD_ENCODING;
  if (payloadEncoding !== "binary" && payloadEncoding !== "base64") {
    throw new TypeError("payloadEncoding must be either 'binary' or 'base64'");
  }
  const symbolsPerFrame = (_c = options.symbolsPerFrame) != null ? _c : DEFAULT_SYMBOLS_PER_FRAME;
  if (!Number.isInteger(symbolsPerFrame) || symbolsPerFrame <= 0) {
    throw new TypeError("symbolsPerFrame must be an integer > 0");
  }
  const parityBlockDataChunks = (_d = options.parityBlockDataChunks) != null ? _d : 0;
  if (!Number.isInteger(parityBlockDataChunks) || parityBlockDataChunks < 0) {
    throw new TypeError("parityBlockDataChunks must be an integer >= 0");
  }
  const bytes = await blobLikeToBytes(fileLike);
  const sessionId = (_e2 = options.sessionId) != null ? _e2 : createSessionId();
  const fileName = (_f = options.fileName) != null ? _f : getDefaultFileName(fileLike);
  const mimeType = (_g = options.mimeType) != null ? _g : getDefaultMimeType(fileLike);
  const chunks = splitBytes(bytes, chunkByteSize);
  const totalChunks = chunks.length;
  const manifestFrame = encodeManifestFrame({
    sessionId,
    totalChunks,
    chunkByteSize,
    fileSize: bytes.length,
    mimeType,
    fileName,
    parityBlockDataChunks,
    symbolsPerFrame
  });
  const symbolFrames = [];
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunkBytes = chunks[chunkIndex];
    symbolFrames.push(createChunkFrame({
      payloadEncoding,
      sessionId,
      chunkIndex,
      totalChunks,
      chunkBytes
    }));
    if (parityBlockDataChunks > 0 && ((chunkIndex + 1) % parityBlockDataChunks === 0 || chunkIndex === chunks.length - 1)) {
      const blockStartChunkIndex = chunkIndex - chunkIndex % parityBlockDataChunks;
      const blockChunks = chunks.slice(blockStartChunkIndex, chunkIndex + 1);
      const parityBytes = createParityChunk(blockChunks, chunkByteSize);
      symbolFrames.push(createParityFrame({
        payloadEncoding,
        sessionId,
        blockStartChunkIndex,
        totalChunks,
        parityBytes
      }));
    }
  }
  const frames = [manifestFrame, ...symbolFrames];
  const qrSymbols = frames.map((frame) => toQrSymbol(frame));
  const displayFrames = createDisplayFrames(frames, qrSymbols, symbolsPerFrame);
  const estimatedStats = estimateTransferStats({
    fileSize: bytes.length,
    chunkByteSize,
    frameIntervalMs: (_h = options.frameIntervalMs) != null ? _h : DEFAULT_FRAME_INTERVAL_MS,
    symbolsPerFrame,
    extraFrames: parityBlockDataChunks > 0 ? Math.ceil(totalChunks / parityBlockDataChunks) : 0
  });
  return {
    sessionId,
    fileName,
    mimeType,
    fileSize: bytes.length,
    chunkByteSize,
    totalChunks,
    payloadEncoding,
    symbolsPerFrame,
    parityBlockDataChunks,
    frames,
    qrFrames: qrSymbols,
    displayFrames,
    estimatedStats
  };
}
var _AnimatedQrSender_instances, tick_fn;
var AnimatedQrSender = class extends SimpleEmitter {
  constructor(options = {}) {
    var _a2, _b2, _c, _d, _e2, _f, _g, _h, _i;
    super();
    __privateAdd(this, _AnimatedQrSender_instances);
    this.canvas = (_a2 = options.canvas) != null ? _a2 : null;
    this.frameIntervalMs = (_b2 = options.frameIntervalMs) != null ? _b2 : DEFAULT_FRAME_INTERVAL_MS;
    this.chunkByteSize = (_c = options.chunkByteSize) != null ? _c : DEFAULT_CHUNK_BYTE_SIZE;
    this.payloadEncoding = (_d = options.payloadEncoding) != null ? _d : DEFAULT_PAYLOAD_ENCODING;
    this.symbolsPerFrame = (_e2 = options.symbolsPerFrame) != null ? _e2 : DEFAULT_SYMBOLS_PER_FRAME;
    this.parityBlockDataChunks = (_f = options.parityBlockDataChunks) != null ? _f : 0;
    this.qrOptions = {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 6,
      ...(_g = options.qrOptions) != null ? _g : {}
    };
    this.prepared = null;
    this.frameIndex = 0;
    this.loopIndex = 0;
    this.running = false;
    this.timer = null;
    this.qrRenderCache = createQrRenderCache();
    this.frameCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
    this.frameContext = (_i = (_h = this.frameCanvas) == null ? void 0 : _h.getContext("2d")) != null ? _i : null;
  }
  setCanvas(canvas) {
    this.canvas = canvas;
  }
  async prepare(fileLike, options = {}) {
    var _a2, _b2, _c, _d, _e2;
    const transfer = await createTransferFrames(fileLike, {
      chunkByteSize: (_a2 = options.chunkByteSize) != null ? _a2 : this.chunkByteSize,
      sessionId: options.sessionId,
      fileName: options.fileName,
      mimeType: options.mimeType,
      payloadEncoding: (_b2 = options.payloadEncoding) != null ? _b2 : this.payloadEncoding,
      symbolsPerFrame: (_c = options.symbolsPerFrame) != null ? _c : this.symbolsPerFrame,
      parityBlockDataChunks: (_d = options.parityBlockDataChunks) != null ? _d : this.parityBlockDataChunks,
      frameIntervalMs: (_e2 = options.frameIntervalMs) != null ? _e2 : this.frameIntervalMs
    });
    resetQrRenderCache(this.qrRenderCache);
    this.prepared = transfer;
    this.frameIndex = 0;
    this.loopIndex = 0;
    this.emit("prepared", transfer);
    return transfer;
  }
  getFrames() {
    return this.prepared ? [...this.prepared.frames] : [];
  }
  async renderFrameAt(frameIndex) {
    if (!this.prepared || this.prepared.displayFrames.length === 0) {
      throw new Error("No transfer is prepared. Call prepare() first.");
    }
    if (!this.canvas) {
      throw new Error("No canvas configured. Pass { canvas } or call setCanvas().");
    }
    if (!this.frameCanvas || !this.frameContext) {
      throw new Error("Canvas rendering is not available in this environment.");
    }
    const length = this.prepared.displayFrames.length;
    const safeIndex = (frameIndex % length + length) % length;
    const displayFrame = rotateFrameBatch(
      getLoopDisplayFrame(this.prepared, safeIndex, this.loopIndex),
      safeIndex + this.loopIndex
    );
    await renderPlainQrGrid(this.canvas, displayFrame.qrSymbols, this.qrOptions, {
      frameCanvas: this.frameCanvas,
      frameContext: this.frameContext,
      qrRenderCache: this.qrRenderCache
    });
    this.emit("frame", {
      frameIndex: safeIndex,
      symbols: displayFrame.symbols,
      symbolCount: displayFrame.symbols.length,
      stageMode: "plain",
      sessionId: this.prepared.sessionId
    });
    return displayFrame.symbols;
  }
  async start() {
    if (this.running) {
      return;
    }
    if (!this.prepared) {
      throw new Error("No transfer is prepared. Call prepare() first.");
    }
    this.running = true;
    this.emit("start", {
      sessionId: this.prepared.sessionId,
      frameCount: this.prepared.displayFrames.length
    });
    await __privateMethod(this, _AnimatedQrSender_instances, tick_fn).call(this);
  }
  stop() {
    this.running = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit("stop", {});
  }
};
_AnimatedQrSender_instances = new WeakSet();
tick_fn = async function() {
  if (!this.running) {
    return;
  }
  try {
    await this.renderFrameAt(this.frameIndex);
    this.frameIndex = (this.frameIndex + 1) % this.prepared.displayFrames.length;
    if (this.frameIndex === 0) {
      this.loopIndex += 1;
    }
    this.timer = setTimeout(() => {
      void __privateMethod(this, _AnimatedQrSender_instances, tick_fn).call(this);
    }, this.frameIntervalMs);
  } catch (error) {
    this.running = false;
    this.emit("error", { error });
  }
};

// src/decoder-passes.js
function buildTileRegions(width, height, gridSize) {
  const regions = [];
  const seen = /* @__PURE__ */ new Set();
  const expansionRatio = gridSize === 2 ? 1.36 : 1.24;
  const regionWidth = Math.min(width, Math.max(64, Math.round(width / gridSize * expansionRatio)));
  const regionHeight = Math.min(height, Math.max(64, Math.round(height / gridSize * expansionRatio)));
  const stepX = gridSize > 1 ? Math.max(1, Math.round((width - regionWidth) / (gridSize - 1))) : 0;
  const stepY = gridSize > 1 ? Math.max(1, Math.round((height - regionHeight) / (gridSize - 1))) : 0;
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = Math.min(width - regionWidth, Math.max(0, column * stepX));
      const y = Math.min(height - regionHeight, Math.max(0, row * stepY));
      const key = `${x}:${y}:${regionWidth}:${regionHeight}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      regions.push({
        x,
        y,
        width: regionWidth,
        height: regionHeight,
        tryHarder: true
      });
    }
  }
  return regions;
}
function buildDecodePasses(width, height) {
  return [
    {
      x: 0,
      y: 0,
      width,
      height,
      tryHarder: false
    },
    ...buildTileRegions(width, height, 2),
    ...buildTileRegions(width, height, 3)
  ];
}

// src/decoder-assets.js
var DECODER_WORKER_FILE_NAME = "animated-data-qr.decoder.worker.js";
var DECODER_WASM_FILE_NAME = "zxing_reader.wasm";
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function getPageUrl() {
  var _a2;
  if (typeof window !== "undefined" && typeof ((_a2 = window.location) == null ? void 0 : _a2.href) === "string") {
    return window.location.href;
  }
  return "";
}
function getInjectedModuleUrl() {
  var _a2;
  if (typeof __ADQ_MODULE_URL__ === "string" && __ADQ_MODULE_URL__) {
    return __ADQ_MODULE_URL__;
  }
  if (typeof document !== "undefined" && ((_a2 = document.currentScript) == null ? void 0 : _a2.src)) {
    return document.currentScript.src;
  }
  return "";
}
function resolveDecoderAssetBaseUrl(override = null, moduleUrl = getInjectedModuleUrl()) {
  if (typeof override === "string" && override.length > 0) {
    const fallbackUrl = moduleUrl || getPageUrl() || "http://localhost/";
    return ensureTrailingSlash(new URL(override, fallbackUrl).href);
  }
  if (typeof moduleUrl === "string" && moduleUrl.length > 0) {
    return ensureTrailingSlash(new URL(".", moduleUrl).href);
  }
  const pageUrl = getPageUrl();
  if (pageUrl) {
    return ensureTrailingSlash(new URL(".", pageUrl).href);
  }
  return "";
}
function resolveDecoderWorkerUrl(assetBaseUrl) {
  if (!assetBaseUrl) {
    return "";
  }
  return new URL(DECODER_WORKER_FILE_NAME, ensureTrailingSlash(assetBaseUrl)).href;
}
function resolveDecoderWasmUrl(assetBaseUrl) {
  if (!assetBaseUrl) {
    return "";
  }
  return new URL(DECODER_WASM_FILE_NAME, ensureTrailingSlash(assetBaseUrl)).href;
}

// node_modules/zxing-wasm/dist/es/share.js
var c = [
  // name               sym  var  flags    zint  hri-label                  
  ["All", "*", "*", "     ", 0, "All"],
  ["AllReadable", "*", "r", "     ", 0, "All Readable"],
  ["AllCreatable", "*", "w", "     ", 0, "All Creatable"],
  ["AllLinear", "*", "l", "     ", 0, "All Linear"],
  ["AllMatrix", "*", "m", "     ", 0, "All Matrix"],
  ["AllGS1", "*", "G", "     ", 0, "All GS1"],
  ["AllRetail", "*", "R", "     ", 0, "All Retail"],
  ["AllIndustrial", "*", "I", "     ", 0, "All Industrial"],
  ["Codabar", "F", " ", "lrw  ", 18, "Codabar"],
  ["Code39", "A", " ", "lrw I", 8, "Code 39"],
  ["Code39Std", "A", "s", "lrw I", 8, "Code 39 Standard"],
  ["Code39Ext", "A", "e", "lr  I", 9, "Code 39 Extended"],
  ["Code32", "A", "2", "lr  I", 129, "Code 32"],
  ["PZN", "A", "p", "lr  I", 52, "Pharmazentralnummer"],
  ["Code93", "G", " ", "lrw I", 25, "Code 93"],
  ["Code128", "C", " ", "lrwGI", 20, "Code 128"],
  ["ITF", "I", " ", "lrw I", 3, "ITF"],
  ["ITF14", "I", "4", "lr  I", 89, "ITF-14"],
  ["DataBar", "e", " ", "lr GR", 29, "DataBar"],
  ["DataBarOmni", "e", "o", "lr GR", 29, "DataBar Omni"],
  ["DataBarStk", "e", "s", "lr GR", 79, "DataBar Stacked"],
  ["DataBarStkOmni", "e", "O", "lr GR", 80, "DataBar Stacked Omni"],
  ["DataBarLtd", "e", "l", "lr GR", 30, "DataBar Limited"],
  ["DataBarExp", "e", "e", "lr GR", 31, "DataBar Expanded"],
  ["DataBarExpStk", "e", "E", "lr GR", 81, "DataBar Expanded Stacked"],
  ["EANUPC", "E", " ", "lr  R", 15, "EAN/UPC"],
  ["EAN13", "E", "1", "lrw R", 15, "EAN-13"],
  ["EAN8", "E", "8", "lrw R", 10, "EAN-8"],
  ["EAN5", "E", "5", "l   R", 12, "EAN-5"],
  ["EAN2", "E", "2", "l   R", 11, "EAN-2"],
  ["ISBN", "E", "i", "lr  R", 69, "ISBN"],
  ["UPCA", "E", "a", "lrw R", 34, "UPC-A"],
  ["UPCE", "E", "e", "lrw R", 37, "UPC-E"],
  ["OtherBarcode", "X", " ", " r   ", 0, "Other barcode"],
  ["DXFilmEdge", "X", "x", "lr   ", 147, "DX Film Edge"],
  ["PDF417", "L", " ", "mrw  ", 55, "PDF417"],
  ["CompactPDF417", "L", "c", "mr   ", 56, "Compact PDF417"],
  ["MicroPDF417", "L", "m", "m    ", 84, "MicroPDF417"],
  ["Aztec", "z", " ", "mr G ", 92, "Aztec"],
  ["AztecCode", "z", "c", "mrwG ", 92, "Aztec Code"],
  ["AztecRune", "z", "r", "mr   ", 128, "Aztec Rune"],
  ["QRCode", "Q", " ", "mrwG ", 58, "QR Code"],
  ["QRCodeModel1", "Q", "1", "mr   ", 0, "QR Code Model 1"],
  ["QRCodeModel2", "Q", "2", "mr   ", 58, "QR Code Model 2"],
  ["MicroQRCode", "Q", "m", "mr   ", 97, "Micro QR Code"],
  ["RMQRCode", "Q", "r", "mr G ", 145, "rMQR Code"],
  ["DataMatrix", "d", " ", "mrwG ", 71, "Data Matrix"],
  ["MaxiCode", "U", " ", "mr   ", 57, "MaxiCode"]
];
var M = {
  /**
   * @deprecated Use `DataBarExp` instead.
   */
  DataBarExpanded: "DataBarExp",
  /**
   * @deprecated Use `DataBarLtd` instead.
   */
  DataBarLimited: "DataBarLtd",
  /**
   * @deprecated Use `AllLinear` instead.
   */
  "Linear-Codes": "AllLinear",
  /**
   * @deprecated Use `AllMatrix` instead.
   */
  "Matrix-Codes": "AllMatrix",
  /**
   * @deprecated Use `All` instead.
   */
  Any: "All",
  rMQRCode: "RMQRCode"
};
var se = c.map((e) => e[5]);
var G = c.filter((e) => e[1] === "*");
var ie = G.map(
  (e) => e[0]
);
var U = c.filter((e) => e[1] !== "*");
var P = U.map((e) => e[0]);
var z = c.filter((e) => e[2] === " ");
var ce = z.map((e) => e[0]);
var Q = c.filter(
  (e) => e[3][0] === "l"
);
var H = Q.map(
  (e) => e[0]
);
var v = c.filter(
  (e) => e[3][0] === "m"
);
var k = v.map(
  (e) => e[0]
);
var W = c.filter(
  (e) => e[3][1] === "r"
);
var fe = W.map(
  (e) => e[0]
);
var X = c.filter(
  (e) => e[3][2] === "w" || e[4] !== 0
);
var Ee = X.map(
  (e) => e[0]
);
var Z = c.filter(
  (e) => e[3][3] === "G"
);
var Re = Z.map((e) => e[0]);
var $ = c.filter(
  (e) => e[3][4] === "R"
);
var me = $.map(
  (e) => e[0]
);
var j = c.filter(
  (e) => e[3][4] === "I"
);
var Oe = j.map(
  (e) => e[0]
);
function D(e) {
  var t;
  return (t = M[e]) != null ? t : e;
}
function q(e) {
  return e.map(D).join(",");
}
var F = [
  "LocalAverage",
  "GlobalHistogram",
  "FixedThreshold",
  "BoolCast"
];
function Y(e) {
  return F.indexOf(e);
}
var _ = [
  "Unknown",
  "ASCII",
  "ISO8859_1",
  "ISO8859_2",
  "ISO8859_3",
  "ISO8859_4",
  "ISO8859_5",
  "ISO8859_6",
  "ISO8859_7",
  "ISO8859_8",
  "ISO8859_9",
  "ISO8859_10",
  "ISO8859_11",
  "ISO8859_13",
  "ISO8859_14",
  "ISO8859_15",
  "ISO8859_16",
  "Cp437",
  "Cp1250",
  "Cp1251",
  "Cp1252",
  "Cp1256",
  "Shift_JIS",
  "Big5",
  "GB2312",
  "GB18030",
  "EUC_JP",
  "EUC_KR",
  "UTF16BE",
  "UTF8",
  "UTF16LE",
  "UTF32BE",
  "UTF32LE",
  "BINARY"
];
function V(e) {
  return e === "UnicodeBig" ? _.indexOf("UTF16BE") : _.indexOf(e);
}
var w = [
  "Text",
  "Binary",
  "Mixed",
  "GS1",
  "ISO15434",
  "UnknownECI"
];
function J(e) {
  return w[e];
}
var b = ["Ignore", "Read", "Require"];
function K(e) {
  return b.indexOf(e);
}
var h = [
  "Plain",
  "ECI",
  "HRI",
  "Escaped",
  "Hex",
  "HexECI"
];
function ee(e) {
  return h.indexOf(e);
}
var O = {
  formats: [],
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  tryDenoise: false,
  binarizer: "LocalAverage",
  isPure: false,
  downscaleFactor: 3,
  downscaleThreshold: 500,
  minLineCount: 2,
  maxNumberOfSymbols: 255,
  validateOptionalChecksum: false,
  returnErrors: false,
  eanAddOnSymbol: "Ignore",
  textMode: "HRI",
  characterSet: "Unknown",
  tryCode39ExtendedMode: true
};
function B(e) {
  var t;
  return {
    ...e,
    formats: q(e.formats),
    binarizer: Y(e.binarizer),
    eanAddOnSymbol: K(e.eanAddOnSymbol),
    textMode: ee(e.textMode),
    characterSet: V(e.characterSet),
    tryCode39ExtendedMode: (t = e.tryCode39ExtendedMode) != null ? t : true
  };
}
function te(e) {
  return {
    ...e,
    format: e.format,
    symbology: e.symbology,
    contentType: J(e.contentType)
  };
}
var l = {
  format: "QRCode",
  readerInit: false,
  forceSquareDataMatrix: false,
  ecLevel: "",
  scale: 1,
  sizeHint: 0,
  rotate: 0,
  invert: false,
  withHRT: false,
  withQuietZones: true,
  addHRT: false,
  addQuietZones: true,
  options: ""
};
var ae = {
  locateFile: (e, t) => {
    const r = e.match(/_(.+?)\.wasm$/);
    return r ? `https://fastly.jsdelivr.net/npm/zxing-wasm@3.0.1/dist/${r[1]}/${e}` : t + e;
  }
};
var m = /* @__PURE__ */ new WeakMap();
function oe(e, t) {
  return Object.is(e, t) || Object.keys(e).length === Object.keys(t).length && Object.keys(e).every(
    (r) => Object.hasOwn(t, r) && e[r] === t[r]
  );
}
function p(e, {
  overrides: t,
  equalityFn: r = oe,
  fireImmediately: a = false
} = {}) {
  var s;
  const [o, i] = (s = m.get(e)) != null ? s : [ae], n = t != null ? t : o;
  let A;
  if (a) {
    if (i && (A = r(o, n)))
      return i;
    const d = e({
      ...n
    });
    return m.set(e, [n, d]), d;
  }
  (A != null ? A : r(o, n)) || m.set(e, [n]);
}
function ne(e) {
  const t = e.byteLength >> 2, r = new Uint8Array(t);
  for (let a = 0; a < t; a++) {
    const o = a << 2;
    r[a] = 306 * e[o] + 601 * e[o + 1] + 117 * e[o + 2] + 512 >> 10;
  }
  return r;
}
async function we(e, t, r = O) {
  const a = {
    ...O,
    ...r
  }, o = await p(e, {
    fireImmediately: true
  });
  let i, n;
  if ("width" in t && "height" in t && "data" in t) {
    const { data: s, width: d, height: C } = t, f = ne(s), E = f.byteLength;
    if (n = o._malloc(E), !n)
      throw new Error(`Failed to allocate ${E} bytes in WASM memory`);
    try {
      o.HEAPU8.set(f, n), i = o.readBarcodesFromPixmap(
        n,
        d,
        C,
        B(a)
      );
    } finally {
      o._free(n);
    }
  } else {
    let s, d;
    if ("buffer" in t)
      [s, d] = [t.byteLength, t];
    else if ("byteLength" in t)
      [s, d] = [t.byteLength, new Uint8Array(t)];
    else if ("size" in t)
      [s, d] = [t.size, new Uint8Array(await t.arrayBuffer())];
    else
      throw new TypeError("Invalid input type");
    if (n = o._malloc(s), !n)
      throw new Error(`Failed to allocate ${s} bytes in WASM memory`);
    try {
      o.HEAPU8.set(d, n), i = o.readBarcodesFromImage(
        n,
        s,
        B(a)
      );
    } finally {
      o._free(n);
    }
  }
  const A = [];
  for (let s = 0; s < i.size(); ++s)
    A.push(
      te(i.get(s))
    );
  return A;
}
var he = {
  ...O,
  formats: [...O.formats]
};
var pe = { ...l };

// node_modules/zxing-wasm/dist/es/reader/index.js
async function Mr(A = {}) {
  var k2, N, _r, l2 = A, Ee2 = !!globalThis.window, Oe2 = typeof Bun < "u", jr = !!globalThis.WorkerGlobalScope;
  !((N = globalThis.process) === null || N === void 0 || (N = N.versions) === null || N === void 0) && N.node && ((_r = globalThis.process) === null || _r === void 0 ? void 0 : _r.type) != "renderer";
  var Wr = "./this.program", ke, gr = "";
  function De2(r) {
    return l2.locateFile ? l2.locateFile(r, gr) : gr + r;
  }
  var Ir, yr;
  if (Ee2 || jr || Oe2) {
    try {
      gr = new URL(".", ke).href;
    } catch {
    }
    jr && (yr = (r) => {
      var e = new XMLHttpRequest();
      return e.open("GET", r, false), e.responseType = "arraybuffer", e.send(null), new Uint8Array(e.response);
    }), Ir = async (r) => {
      var e = await fetch(r, {
        credentials: "same-origin"
      });
      if (e.ok)
        return e.arrayBuffer();
      throw new Error(e.status + " : " + e.url);
    };
  }
  var Br = console.log.bind(console), L = console.error.bind(console), G2, Ur = false, Vr, Hr, B2, D2, tr, X2, Y2, $2, Nr, Lr, xr = false;
  function zr() {
    var r = dr.buffer;
    B2 = new Int8Array(r), tr = new Int16Array(r), l2.HEAPU8 = D2 = new Uint8Array(r), X2 = new Uint16Array(r), Y2 = new Int32Array(r), $2 = new Uint32Array(r), Nr = new Float32Array(r), Lr = new Float64Array(r);
  }
  function Me2() {
    if (l2.preRun)
      for (typeof l2.preRun == "function" && (l2.preRun = [l2.preRun]); l2.preRun.length; )
        ze(l2.preRun.shift());
    Zr(Xr);
  }
  function je() {
    xr = true, rr.xa();
  }
  function We() {
    if (l2.postRun)
      for (typeof l2.postRun == "function" && (l2.postRun = [l2.postRun]); l2.postRun.length; )
        xe(l2.postRun.shift());
    Zr(Gr);
  }
  function mr(r) {
    var e, t;
    (e = l2.onAbort) === null || e === void 0 || e.call(l2, r), r = "Aborted(" + r + ")", L(r), Ur = true, r += ". Build with -sASSERTIONS for more info.";
    var n = new WebAssembly.RuntimeError(r);
    throw (t = Hr) === null || t === void 0 || t(n), n;
  }
  var x;
  function Ie2() {
    return De2("zxing_reader.wasm");
  }
  function Be2(r) {
    if (r == x && G2)
      return new Uint8Array(G2);
    if (yr)
      return yr(r);
    throw "both async and sync fetching of the wasm failed";
  }
  async function Ue(r) {
    if (!G2)
      try {
        var e = await Ir(r);
        return new Uint8Array(e);
      } catch {
      }
    return Be2(r);
  }
  async function Ve(r, e) {
    try {
      var t = await Ue(r), n = await WebAssembly.instantiate(t, e);
      return n;
    } catch (i) {
      L(`failed to asynchronously prepare wasm: ${i}`), mr(i);
    }
  }
  async function He(r, e, t) {
    if (!r && WebAssembly.instantiateStreaming)
      try {
        var n = fetch(e, {
          credentials: "same-origin"
        }), i = await WebAssembly.instantiateStreaming(n, t);
        return i;
      } catch (a) {
        L(`wasm streaming compile failed: ${a}`), L("falling back to ArrayBuffer instantiation");
      }
    return Ve(e, t);
  }
  function Ne() {
    var r = {
      a: Cn
    };
    return r;
  }
  async function Le() {
    function r(a, s) {
      return rr = a.exports, Tn(rr), zr(), rr;
    }
    function e(a) {
      return r(a.instance);
    }
    var t = Ne();
    if (l2.instantiateWasm)
      return new Promise((a, s) => {
        l2.instantiateWasm(t, (o, u) => {
          a(r(o));
        });
      });
    x != null || (x = Ie2());
    var n = await He(G2, x, t), i = e(n);
    return i;
  }
  var Zr = (r) => {
    for (; r.length > 0; )
      r.shift()(l2);
  }, Gr = [], xe = (r) => Gr.push(r), Xr = [], ze = (r) => Xr.push(r), p2 = (r) => _e2(r), h2 = () => ge(), nr = [], ir = 0, Ze = (r) => {
    var e = new br(r);
    return e.get_caught() || (e.set_caught(true), ir--), e.set_rethrown(false), nr.push(e), me2(r), pe2(r);
  }, M2 = 0, Ge = () => {
    d(0, 0);
    var r = nr.pop();
    ye2(r.excPtr), M2 = 0;
  };
  class br {
    constructor(e) {
      this.excPtr = e, this.ptr = e - 24;
    }
    set_type(e) {
      $2[this.ptr + 4 >> 2] = e;
    }
    get_type() {
      return $2[this.ptr + 4 >> 2];
    }
    set_destructor(e) {
      $2[this.ptr + 8 >> 2] = e;
    }
    get_destructor() {
      return $2[this.ptr + 8 >> 2];
    }
    set_caught(e) {
      e = e ? 1 : 0, B2[this.ptr + 12] = e;
    }
    get_caught() {
      return B2[this.ptr + 12] != 0;
    }
    set_rethrown(e) {
      e = e ? 1 : 0, B2[this.ptr + 13] = e;
    }
    get_rethrown() {
      return B2[this.ptr + 13] != 0;
    }
    init(e, t) {
      this.set_adjusted_ptr(0), this.set_type(e), this.set_destructor(t);
    }
    set_adjusted_ptr(e) {
      $2[this.ptr + 16 >> 2] = e;
    }
    get_adjusted_ptr() {
      return $2[this.ptr + 16 >> 2];
    }
  }
  var ar = (r) => he2(r), wr = (r) => {
    var e = M2;
    if (!e)
      return ar(0), 0;
    var t = new br(e);
    t.set_adjusted_ptr(e);
    var n = t.get_type();
    if (!n)
      return ar(0), e;
    for (var i of r) {
      if (i === 0 || i === n)
        break;
      var a = t.ptr + 16;
      if (be(i, n, a))
        return ar(i), e;
    }
    return ar(n), e;
  }, Xe = () => wr([]), Ye = (r) => wr([r]), qe = (r, e) => wr([r, e]), Ke = () => {
    var r = nr.pop();
    r || mr("no exception to throw");
    var e = r.excPtr;
    throw r.get_rethrown() || (nr.push(r), r.set_rethrown(true), r.set_caught(false), ir++), M2 = e, M2;
  }, Je = (r, e, t) => {
    var n = new br(r);
    throw n.init(e, t), M2 = r, ir++, M2;
  }, Qe = () => ir, rt = (r) => {
    throw M2 || (M2 = r), M2;
  }, et2 = () => mr(""), sr = {}, $r = (r) => {
    for (; r.length; ) {
      var e = r.pop(), t = r.pop();
      t(e);
    }
  };
  function q2(r) {
    return this.fromWireType($2[r >> 2]);
  }
  var z2 = {}, U2 = {}, or = {}, tt = class extends Error {
    constructor(e) {
      super(e), this.name = "InternalError";
    }
  }, ur = (r) => {
    throw new tt(r);
  }, V2 = (r, e, t) => {
    r.forEach((o) => or[o] = e);
    function n(o) {
      var u = t(o);
      u.length !== r.length && ur("Mismatched type converter count");
      for (var f = 0; f < r.length; ++f)
        E(r[f], u[f]);
    }
    var i = new Array(e.length), a = [], s = 0;
    {
      const o = e;
      for (let u = 0; u < o.length; ++u) {
        const f = o[u];
        U2.hasOwnProperty(f) ? i[u] = U2[f] : (a.push(f), z2.hasOwnProperty(f) || (z2[f] = []), z2[f].push(() => {
          i[u] = U2[f], ++s, s === a.length && n(i);
        }));
      }
    }
    a.length === 0 && n(i);
  }, nt = (r) => {
    var e = sr[r];
    delete sr[r];
    var t = e.rawConstructor, n = e.rawDestructor, i = e.fields, a = i.map((s) => s.getterReturnType).concat(i.map((s) => s.setterArgumentType));
    V2([r], a, (s) => {
      var o = {};
      {
        const u = i;
        for (let f = 0; f < u.length; ++f) {
          const c2 = u[f], v2 = s[f], y = c2.getter, b2 = c2.getterContext, C = s[f + i.length], T = c2.setter, w2 = c2.setterContext;
          o[c2.fieldName] = {
            read: (m2) => v2.fromWireType(y(b2, m2)),
            write: (m2, F2) => {
              var R = [];
              T(w2, m2, C.toWireType(R, F2)), $r(R);
            },
            optional: v2.optional
          };
        }
      }
      return [{
        name: e.name,
        fromWireType: (u) => {
          var f = {};
          for (var c2 in o)
            f[c2] = o[c2].read(u);
          return n(u), f;
        },
        toWireType: (u, f) => {
          for (var c2 in o)
            if (!(c2 in f) && !o[c2].optional)
              throw new TypeError(`Missing field: "${c2}"`);
          var v2 = t();
          for (c2 in o)
            o[c2].write(v2, f[c2]);
          return u !== null && u.push(n, v2), v2;
        },
        readValueFromPointer: q2,
        destructorFunction: n
      }];
    });
  }, it = (r, e, t, n, i) => {
  }, P2 = (r) => {
    for (var e = ""; ; ) {
      var t = D2[r++];
      if (!t) return e;
      e += String.fromCharCode(t);
    }
  }, K2 = class extends Error {
    constructor(e) {
      super(e), this.name = "BindingError";
    }
  }, g = (r) => {
    throw new K2(r);
  };
  function at(r, e) {
    let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var n = e.name;
    if (r || g(`type "${n}" must have a positive integer typeid pointer`), U2.hasOwnProperty(r)) {
      if (t.ignoreDuplicateRegistrations)
        return;
      g(`Cannot register type '${n}' twice`);
    }
    if (U2[r] = e, delete or[r], z2.hasOwnProperty(r)) {
      var i = z2[r];
      delete z2[r], i.forEach((a) => a());
    }
  }
  function E(r, e) {
    let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return at(r, e, t);
  }
  var st = (r, e, t, n) => {
    e = P2(e), E(r, {
      name: e,
      fromWireType: function(i) {
        return !!i;
      },
      toWireType: function(i, a) {
        return a ? t : n;
      },
      readValueFromPointer: function(i) {
        return this.fromWireType(D2[i]);
      },
      destructorFunction: null
    });
  }, ot = (r) => ({
    count: r.count,
    deleteScheduled: r.deleteScheduled,
    preservePointerOnDelete: r.preservePointerOnDelete,
    ptr: r.ptr,
    ptrType: r.ptrType,
    smartPtr: r.smartPtr,
    smartPtrType: r.smartPtrType
  }), Tr = (r) => {
    function e(t) {
      return t.$$.ptrType.registeredClass.name;
    }
    g(e(r) + " instance already deleted");
  }, Cr = false, Yr = (r) => {
  }, ut = (r) => {
    r.smartPtr ? r.smartPtrType.rawDestructor(r.smartPtr) : r.ptrType.registeredClass.rawDestructor(r.ptr);
  }, qr = (r) => {
    r.count.value -= 1;
    var e = r.count.value === 0;
    e && ut(r);
  }, J2 = (r) => globalThis.FinalizationRegistry ? (Cr = new FinalizationRegistry((e) => {
    qr(e.$$);
  }), J2 = (e) => {
    var t = e.$$, n = !!t.smartPtr;
    if (n) {
      var i = {
        $$: t
      };
      Cr.register(e, i, e);
    }
    return e;
  }, Yr = (e) => Cr.unregister(e), J2(r)) : (J2 = (e) => e, r), ft = () => {
    let r = fr.prototype;
    Object.assign(r, {
      isAliasOf(t) {
        if (!(this instanceof fr) || !(t instanceof fr))
          return false;
        var n = this.$$.ptrType.registeredClass, i = this.$$.ptr;
        t.$$ = t.$$;
        for (var a = t.$$.ptrType.registeredClass, s = t.$$.ptr; n.baseClass; )
          i = n.upcast(i), n = n.baseClass;
        for (; a.baseClass; )
          s = a.upcast(s), a = a.baseClass;
        return n === a && i === s;
      },
      clone() {
        if (this.$$.ptr || Tr(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var t = J2(Object.create(Object.getPrototypeOf(this), {
          $$: {
            value: ot(this.$$)
          }
        }));
        return t.$$.count.value += 1, t.$$.deleteScheduled = false, t;
      },
      delete() {
        this.$$.ptr || Tr(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), Yr(this), qr(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      },
      isDeleted() {
        return !this.$$.ptr;
      },
      deleteLater() {
        return this.$$.ptr || Tr(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && g("Object already scheduled for deletion"), this.$$.deleteScheduled = true, this;
      }
    });
    const e = Symbol.dispose;
    e && (r[e] = r.delete);
  };
  function fr() {
  }
  var Pr = (r, e) => Object.defineProperty(e, "name", {
    value: r
  }), Kr = {}, Jr = (r, e, t) => {
    if (r[e].overloadTable === void 0) {
      var n = r[e];
      r[e] = function() {
        for (var i = arguments.length, a = new Array(i), s = 0; s < i; s++)
          a[s] = arguments[s];
        return r[e].overloadTable.hasOwnProperty(a.length) || g(`Function '${t}' called with an invalid number of arguments (${a.length}) - expects one of (${r[e].overloadTable})!`), r[e].overloadTable[a.length].apply(this, a);
      }, r[e].overloadTable = [], r[e].overloadTable[n.argCount] = n;
    }
  }, Qr = (r, e, t) => {
    l2.hasOwnProperty(r) ? ((t === void 0 || l2[r].overloadTable !== void 0 && l2[r].overloadTable[t] !== void 0) && g(`Cannot register public name '${r}' twice`), Jr(l2, r, r), l2[r].overloadTable.hasOwnProperty(t) && g(`Cannot register multiple overloads of a function with the same number of arguments (${t})!`), l2[r].overloadTable[t] = e) : (l2[r] = e, l2[r].argCount = t);
  }, lt = 48, ct = 57, vt = (r) => {
    r = r.replace(/[^a-zA-Z0-9_]/g, "$");
    var e = r.charCodeAt(0);
    return e >= lt && e <= ct ? `_${r}` : r;
  };
  function dt(r, e, t, n, i, a, s, o) {
    this.name = r, this.constructor = e, this.instancePrototype = t, this.rawDestructor = n, this.baseClass = i, this.getActualType = a, this.upcast = s, this.downcast = o, this.pureVirtualFunctions = [];
  }
  var Rr = (r, e, t) => {
    for (; e !== t; )
      e.upcast || g(`Expected null or instance of ${t.name}, got an instance of ${e.name}`), r = e.upcast(r), e = e.baseClass;
    return r;
  }, Ar = (r) => {
    if (r === null)
      return "null";
    var e = typeof r;
    return e === "object" || e === "array" || e === "function" ? r.toString() : "" + r;
  };
  function pt(r, e) {
    if (e === null)
      return this.isReference && g(`null is not a valid ${this.name}`), 0;
    e.$$ || g(`Cannot pass "${Ar(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`);
    var t = e.$$.ptrType.registeredClass, n = Rr(e.$$.ptr, t, this.registeredClass);
    return n;
  }
  function ht(r, e) {
    var t;
    if (e === null)
      return this.isReference && g(`null is not a valid ${this.name}`), this.isSmartPointer ? (t = this.rawConstructor(), r !== null && r.push(this.rawDestructor, t), t) : 0;
    (!e || !e.$$) && g(`Cannot pass "${Ar(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
    var n = e.$$.ptrType.registeredClass;
    if (t = Rr(e.$$.ptr, n, this.registeredClass), this.isSmartPointer)
      switch (e.$$.smartPtr === void 0 && g("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
        case 0:
          e.$$.smartPtrType === this ? t = e.$$.smartPtr : g(`Cannot convert argument of type ${e.$$.smartPtrType ? e.$$.smartPtrType.name : e.$$.ptrType.name} to parameter type ${this.name}`);
          break;
        case 1:
          t = e.$$.smartPtr;
          break;
        case 2:
          if (e.$$.smartPtrType === this)
            t = e.$$.smartPtr;
          else {
            var i = e.clone();
            t = this.rawShare(t, O2.toHandle(() => i.delete())), r !== null && r.push(this.rawDestructor, t);
          }
          break;
        default:
          g("Unsupporting sharing policy");
      }
    return t;
  }
  function _t(r, e) {
    if (e === null)
      return this.isReference && g(`null is not a valid ${this.name}`), 0;
    e.$$ || g(`Cannot pass "${Ar(e)}" as a ${this.name}`), e.$$.ptr || g(`Cannot pass deleted object as a pointer of type ${this.name}`), e.$$.ptrType.isConst && g(`Cannot convert argument of type ${e.$$.ptrType.name} to parameter type ${this.name}`);
    var t = e.$$.ptrType.registeredClass, n = Rr(e.$$.ptr, t, this.registeredClass);
    return n;
  }
  var re = (r, e, t) => {
    if (e === t)
      return r;
    if (t.baseClass === void 0)
      return null;
    var n = re(r, e, t.baseClass);
    return n === null ? null : t.downcast(n);
  }, gt = {}, yt = (r, e) => {
    for (e === void 0 && g("ptr should not be undefined"); r.baseClass; )
      e = r.upcast(e), r = r.baseClass;
    return e;
  }, mt = (r, e) => (e = yt(r, e), gt[e]), lr = (r, e) => {
    (!e.ptrType || !e.ptr) && ur("makeClassHandle requires ptr and ptrType");
    var t = !!e.smartPtrType, n = !!e.smartPtr;
    return t !== n && ur("Both smartPtrType and smartPtr must be specified"), e.count = {
      value: 1
    }, J2(Object.create(r, {
      $$: {
        value: e,
        writable: true
      }
    }));
  };
  function bt(r) {
    var e = this.getPointee(r);
    if (!e)
      return this.destructor(r), null;
    var t = mt(this.registeredClass, e);
    if (t !== void 0) {
      if (t.$$.count.value === 0)
        return t.$$.ptr = e, t.$$.smartPtr = r, t.clone();
      var n = t.clone();
      return this.destructor(r), n;
    }
    function i() {
      return this.isSmartPointer ? lr(this.registeredClass.instancePrototype, {
        ptrType: this.pointeeType,
        ptr: e,
        smartPtrType: this,
        smartPtr: r
      }) : lr(this.registeredClass.instancePrototype, {
        ptrType: this,
        ptr: r
      });
    }
    var a = this.registeredClass.getActualType(e), s = Kr[a];
    if (!s)
      return i.call(this);
    var o;
    this.isConst ? o = s.constPointerType : o = s.pointerType;
    var u = re(e, this.registeredClass, o.registeredClass);
    return u === null ? i.call(this) : this.isSmartPointer ? lr(o.registeredClass.instancePrototype, {
      ptrType: o,
      ptr: u,
      smartPtrType: this,
      smartPtr: r
    }) : lr(o.registeredClass.instancePrototype, {
      ptrType: o,
      ptr: u
    });
  }
  var wt = () => {
    Object.assign(cr.prototype, {
      getPointee(r) {
        return this.rawGetPointee && (r = this.rawGetPointee(r)), r;
      },
      destructor(r) {
        var e;
        (e = this.rawDestructor) === null || e === void 0 || e.call(this, r);
      },
      readValueFromPointer: q2,
      fromWireType: bt
    });
  };
  function cr(r, e, t, n, i, a, s, o, u, f, c2) {
    this.name = r, this.registeredClass = e, this.isReference = t, this.isConst = n, this.isSmartPointer = i, this.pointeeType = a, this.sharingPolicy = s, this.rawGetPointee = o, this.rawConstructor = u, this.rawShare = f, this.rawDestructor = c2, !i && e.baseClass === void 0 ? n ? (this.toWireType = pt, this.destructorFunction = null) : (this.toWireType = _t, this.destructorFunction = null) : this.toWireType = ht;
  }
  var ee2 = (r, e, t) => {
    l2.hasOwnProperty(r) || ur("Replacing nonexistent public symbol"), l2[r].overloadTable !== void 0 && t !== void 0 ? l2[r].overloadTable[t] = e : (l2[r] = e, l2[r].argCount = t);
  }, W2 = {}, $t = (r, e, t) => {
    r = r.replace(/p/g, "i");
    var n = W2[r];
    return n(e, ...t);
  }, te3 = [], _2 = (r) => {
    var e = te3[r];
    return e || (te3[r] = e = Te2.get(r)), e;
  }, Tt = function(r, e) {
    let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    if (r.includes("j"))
      return $t(r, e, t);
    var n = _2(e), i = n(...t);
    function a(s) {
      return s;
    }
    return i;
  }, Ct = function(r, e) {
    let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    return function() {
      for (var n = arguments.length, i = new Array(n), a = 0; a < n; a++)
        i[a] = arguments[a];
      return Tt(r, e, i, t);
    };
  }, S = function(r, e) {
    r = P2(r);
    function t() {
      if (r.includes("j"))
        return Ct(r, e);
      var i = _2(e);
      return i;
    }
    var n = t();
    return typeof n != "function" && g(`unknown function pointer with signature ${r}: ${e}`), n;
  };
  class Pt extends Error {
  }
  var ne2 = (r) => {
    var e = de2(r), t = P2(e);
    return I(e), t;
  }, vr = (r, e) => {
    var t = [], n = {};
    function i(a) {
      if (!n[a] && !U2[a]) {
        if (or[a]) {
          or[a].forEach(i);
          return;
        }
        t.push(a), n[a] = true;
      }
    }
    throw e.forEach(i), new Pt(`${r}: ` + t.map(ne2).join([", "]));
  }, Rt = (r, e, t, n, i, a, s, o, u, f, c2, v2, y) => {
    c2 = P2(c2), a = S(i, a), o && (o = S(s, o)), f && (f = S(u, f)), y = S(v2, y);
    var b2 = vt(c2);
    Qr(b2, function() {
      vr(`Cannot construct ${c2} due to unbound types`, [n]);
    }), V2([r, e, t], n ? [n] : [], (C) => {
      C = C[0];
      var T, w2;
      n ? (T = C.registeredClass, w2 = T.instancePrototype) : w2 = fr.prototype;
      var m2 = Pr(c2, function() {
        if (Object.getPrototypeOf(this) !== F2)
          throw new K2(`Use 'new' to construct ${c2}`);
        if (R.constructor_body === void 0)
          throw new K2(`${c2} has no accessible constructor`);
        for (var Re2 = arguments.length, pr = new Array(Re2), hr = 0; hr < Re2; hr++)
          pr[hr] = arguments[hr];
        var Ae2 = R.constructor_body[pr.length];
        if (Ae2 === void 0)
          throw new K2(`Tried to invoke ctor of ${c2} with invalid number of parameters (${pr.length}) - expected (${Object.keys(R.constructor_body).toString()}) parameters instead!`);
        return Ae2.apply(this, pr);
      }), F2 = Object.create(w2, {
        constructor: {
          value: m2
        }
      });
      m2.prototype = F2;
      var R = new dt(c2, m2, F2, y, T, a, o, f);
      if (R.baseClass) {
        var j2, er;
        (er = (j2 = R.baseClass).__derivedClasses) !== null && er !== void 0 || (j2.__derivedClasses = []), R.baseClass.__derivedClasses.push(R);
      }
      var oi = new cr(c2, R, true, false, false), Ce2 = new cr(c2 + "*", R, false, false, false), Pe = new cr(c2 + " const*", R, false, true, false);
      return Kr[r] = {
        pointerType: Ce2,
        constPointerType: Pe
      }, ee2(b2, m2), [oi, Ce2, Pe];
    });
  }, Sr = (r, e) => {
    for (var t = [], n = 0; n < r; n++)
      t.push($2[e + n * 4 >> 2]);
    return t;
  };
  function At(r) {
    for (var e = 1; e < r.length; ++e)
      if (r[e] !== null && r[e].destructorFunction === void 0)
        return true;
    return false;
  }
  function Fr(r, e, t, n, i, a) {
    var s = e.length;
    s < 2 && g("argTypes array size mismatch! Must at least get return value and 'this' types!");
    var o = e[1] !== null && t !== null, u = At(e), f = !e[0].isVoid, c2 = s - 2, v2 = new Array(c2), y = [], b2 = [], C = function() {
      b2.length = 0;
      var T;
      y.length = o ? 2 : 1, y[0] = i, o && (T = e[1].toWireType(b2, this), y[1] = T);
      for (var w2 = 0; w2 < c2; ++w2)
        v2[w2] = e[w2 + 2].toWireType(b2, w2 < 0 || arguments.length <= w2 ? void 0 : arguments[w2]), y.push(v2[w2]);
      var m2 = n(...y);
      function F2(R) {
        if (u)
          $r(b2);
        else
          for (var j2 = o ? 1 : 2; j2 < e.length; j2++) {
            var er = j2 === 1 ? T : v2[j2 - 2];
            e[j2].destructorFunction !== null && e[j2].destructorFunction(er);
          }
        if (f)
          return e[0].fromWireType(R);
      }
      return F2(m2);
    };
    return Pr(r, C);
  }
  var St = (r, e, t, n, i, a) => {
    var s = Sr(e, t);
    i = S(n, i), V2([], [r], (o) => {
      o = o[0];
      var u = `constructor ${o.name}`;
      if (o.registeredClass.constructor_body === void 0 && (o.registeredClass.constructor_body = []), o.registeredClass.constructor_body[e - 1] !== void 0)
        throw new K2(`Cannot register multiple constructors with identical number of parameters (${e - 1}) for class '${o.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
      return o.registeredClass.constructor_body[e - 1] = () => {
        vr(`Cannot construct ${o.name} due to unbound types`, s);
      }, V2([], s, (f) => (f.splice(1, 0, null), o.registeredClass.constructor_body[e - 1] = Fr(u, f, null, i, a), [])), [];
    });
  }, ie2 = (r) => {
    r = r.trim();
    const e = r.indexOf("(");
    return e === -1 ? r : r.slice(0, e);
  }, Ft = (r, e, t, n, i, a, s, o, u, f) => {
    var c2 = Sr(t, n);
    e = P2(e), e = ie2(e), a = S(i, a), V2([], [r], (v2) => {
      v2 = v2[0];
      var y = `${v2.name}.${e}`;
      e.startsWith("@@") && (e = Symbol[e.substring(2)]), o && v2.registeredClass.pureVirtualFunctions.push(e);
      function b2() {
        vr(`Cannot call ${y} due to unbound types`, c2);
      }
      var C = v2.registeredClass.instancePrototype, T = C[e];
      return T === void 0 || T.overloadTable === void 0 && T.className !== v2.name && T.argCount === t - 2 ? (b2.argCount = t - 2, b2.className = v2.name, C[e] = b2) : (Jr(C, e, y), C[e].overloadTable[t - 2] = b2), V2([], c2, (w2) => {
        var m2 = Fr(y, w2, v2, a, s);
        return C[e].overloadTable === void 0 ? (m2.argCount = t - 2, C[e] = m2) : C[e].overloadTable[t - 2] = m2, [];
      }), [];
    });
  }, ae2 = [], H2 = [0, 1, , 1, null, 1, true, 1, false, 1], Er = (r) => {
    r > 9 && --H2[r + 1] === 0 && (H2[r] = void 0, ae2.push(r));
  }, O2 = {
    toValue: (r) => (r || g(`Cannot use deleted val. handle = ${r}`), H2[r]),
    toHandle: (r) => {
      switch (r) {
        case void 0:
          return 2;
        case null:
          return 4;
        case true:
          return 6;
        case false:
          return 8;
        default: {
          const e = ae2.pop() || H2.length;
          return H2[e] = r, H2[e + 1] = 1, e;
        }
      }
    }
  }, se2 = {
    name: "emscripten::val",
    fromWireType: (r) => {
      var e = O2.toValue(r);
      return Er(r), e;
    },
    toWireType: (r, e) => O2.toHandle(e),
    readValueFromPointer: q2,
    destructorFunction: null
  }, Et = (r) => E(r, se2), Ot = (r, e) => {
    switch (e) {
      case 4:
        return function(t) {
          return this.fromWireType(Nr[t >> 2]);
        };
      case 8:
        return function(t) {
          return this.fromWireType(Lr[t >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${e}): ${r}`);
    }
  }, kt = (r, e, t) => {
    e = P2(e), E(r, {
      name: e,
      fromWireType: (n) => n,
      toWireType: (n, i) => i,
      readValueFromPointer: Ot(e, t),
      destructorFunction: null
    });
  }, Dt = (r, e, t, n, i, a, s, o) => {
    var u = Sr(e, t);
    r = P2(r), r = ie2(r), i = S(n, i), Qr(r, function() {
      vr(`Cannot call ${r} due to unbound types`, u);
    }, e - 1), V2([], u, (f) => {
      var c2 = [f[0], null].concat(f.slice(1));
      return ee2(r, Fr(r, c2, null, i, a), e - 1), [];
    });
  }, Mt = (r, e, t) => {
    switch (e) {
      case 1:
        return t ? (n) => B2[n] : (n) => D2[n];
      case 2:
        return t ? (n) => tr[n >> 1] : (n) => X2[n >> 1];
      case 4:
        return t ? (n) => Y2[n >> 2] : (n) => $2[n >> 2];
      default:
        throw new TypeError(`invalid integer width (${e}): ${r}`);
    }
  }, jt = (r, e, t, n, i) => {
    e = P2(e);
    const a = n === 0;
    let s = (u) => u;
    if (a) {
      var o = 32 - 8 * t;
      s = (u) => u << o >>> o, i = s(i);
    }
    E(r, {
      name: e,
      fromWireType: s,
      toWireType: (u, f) => f,
      readValueFromPointer: Mt(e, t, n !== 0),
      destructorFunction: null
    });
  }, Wt = (r, e, t) => {
    var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array], i = n[e];
    function a(s) {
      var o = $2[s >> 2], u = $2[s + 4 >> 2];
      return new i(B2.buffer, u, o);
    }
    t = P2(t), E(r, {
      name: t,
      fromWireType: a,
      readValueFromPointer: a
    }, {
      ignoreDuplicateRegistrations: true
    });
  }, It = Object.assign({
    optional: true
  }, se2), Bt = (r, e) => {
    E(r, It);
  }, Ut = (r, e, t, n) => {
    if (!(n > 0)) return 0;
    for (var i = t, a = t + n - 1, s = 0; s < r.length; ++s) {
      var o = r.codePointAt(s);
      if (o <= 127) {
        if (t >= a) break;
        e[t++] = o;
      } else if (o <= 2047) {
        if (t + 1 >= a) break;
        e[t++] = 192 | o >> 6, e[t++] = 128 | o & 63;
      } else if (o <= 65535) {
        if (t + 2 >= a) break;
        e[t++] = 224 | o >> 12, e[t++] = 128 | o >> 6 & 63, e[t++] = 128 | o & 63;
      } else {
        if (t + 3 >= a) break;
        e[t++] = 240 | o >> 18, e[t++] = 128 | o >> 12 & 63, e[t++] = 128 | o >> 6 & 63, e[t++] = 128 | o & 63, s++;
      }
    }
    return e[t] = 0, t - i;
  }, Z2 = (r, e, t) => Ut(r, D2, e, t), oe2 = (r) => {
    for (var e = 0, t = 0; t < r.length; ++t) {
      var n = r.charCodeAt(t);
      n <= 127 ? e++ : n <= 2047 ? e += 2 : n >= 55296 && n <= 57343 ? (e += 4, ++t) : e += 3;
    }
    return e;
  }, ue2 = globalThis.TextDecoder && new TextDecoder(), fe2 = (r, e, t, n) => {
    var i = e + t;
    if (n) return i;
    for (; r[e] && !(e >= i); ) ++e;
    return e;
  }, le2 = function(r) {
    let e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, t = arguments.length > 2 ? arguments[2] : void 0, n = arguments.length > 3 ? arguments[3] : void 0;
    var i = fe2(r, e, t, n);
    if (i - e > 16 && r.buffer && ue2)
      return ue2.decode(r.subarray(e, i));
    for (var a = ""; e < i; ) {
      var s = r[e++];
      if (!(s & 128)) {
        a += String.fromCharCode(s);
        continue;
      }
      var o = r[e++] & 63;
      if ((s & 224) == 192) {
        a += String.fromCharCode((s & 31) << 6 | o);
        continue;
      }
      var u = r[e++] & 63;
      if ((s & 240) == 224 ? s = (s & 15) << 12 | o << 6 | u : s = (s & 7) << 18 | o << 12 | u << 6 | r[e++] & 63, s < 65536)
        a += String.fromCharCode(s);
      else {
        var f = s - 65536;
        a += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023);
      }
    }
    return a;
  }, Vt = (r, e, t) => r ? le2(D2, r, e, t) : "", Ht = (r, e) => {
    e = P2(e), E(r, {
      name: e,
      fromWireType(t) {
        var n = $2[t >> 2], i = t + 4, a;
        return a = Vt(i, n, true), I(t), a;
      },
      toWireType(t, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var i, a = typeof n == "string";
        a || ArrayBuffer.isView(n) && n.BYTES_PER_ELEMENT == 1 || g("Cannot pass non-string to std::string"), a ? i = oe2(n) : i = n.length;
        var s = Dr(4 + i + 1), o = s + 4;
        return $2[s >> 2] = i, a ? Z2(n, o, i + 1) : D2.set(n, o), t !== null && t.push(I, s), s;
      },
      readValueFromPointer: q2,
      destructorFunction(t) {
        I(t);
      }
    });
  }, ce2 = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, Nt = (r, e, t) => {
    var n = r >> 1, i = fe2(X2, n, e / 2, t);
    if (i - n > 16 && ce2) return ce2.decode(X2.subarray(n, i));
    for (var a = "", s = n; s < i; ++s) {
      var o = X2[s];
      a += String.fromCharCode(o);
    }
    return a;
  }, Lt = (r, e, t) => {
    if (t != null || (t = 2147483647), t < 2) return 0;
    t -= 2;
    for (var n = e, i = t < r.length * 2 ? t / 2 : r.length, a = 0; a < i; ++a) {
      var s = r.charCodeAt(a);
      tr[e >> 1] = s, e += 2;
    }
    return tr[e >> 1] = 0, e - n;
  }, xt = (r) => r.length * 2, zt = (r, e, t) => {
    for (var n = "", i = r >> 2, a = 0; !(a >= e / 4); a++) {
      var s = $2[i + a];
      if (!s && !t) break;
      n += String.fromCodePoint(s);
    }
    return n;
  }, Zt = (r, e, t) => {
    if (t != null || (t = 2147483647), t < 4) return 0;
    for (var n = e, i = n + t - 4, a = 0; a < r.length; ++a) {
      var s = r.codePointAt(a);
      if (s > 65535 && a++, Y2[e >> 2] = s, e += 4, e + 4 > i) break;
    }
    return Y2[e >> 2] = 0, e - n;
  }, Gt = (r) => {
    for (var e = 0, t = 0; t < r.length; ++t) {
      var n = r.codePointAt(t);
      n > 65535 && t++, e += 4;
    }
    return e;
  }, Xt = (r, e, t) => {
    t = P2(t);
    var n, i, a;
    e === 2 ? (n = Nt, i = Lt, a = xt) : (n = zt, i = Zt, a = Gt), E(r, {
      name: t,
      fromWireType: (s) => {
        var o = $2[s >> 2], u = n(s + 4, o * e, true);
        return I(s), u;
      },
      toWireType: (s, o) => {
        typeof o != "string" && g(`Cannot pass non-string to C++ string type ${t}`);
        var u = a(o), f = Dr(4 + u + e);
        return $2[f >> 2] = u / e, i(o, f + 4, u + e), s !== null && s.push(I, f), f;
      },
      readValueFromPointer: q2,
      destructorFunction(s) {
        I(s);
      }
    });
  }, Yt = (r, e, t, n, i, a) => {
    sr[r] = {
      name: P2(e),
      rawConstructor: S(t, n),
      rawDestructor: S(i, a),
      fields: []
    };
  }, qt = (r, e, t, n, i, a, s, o, u, f) => {
    sr[r].fields.push({
      fieldName: P2(e),
      getterReturnType: t,
      getter: S(n, i),
      getterContext: a,
      setterArgumentType: s,
      setter: S(o, u),
      setterContext: f
    });
  }, Kt = (r, e) => {
    e = P2(e), E(r, {
      isVoid: true,
      name: e,
      fromWireType: () => {
      },
      toWireType: (t, n) => {
      }
    });
  }, Or = [], Jt = (r) => {
    var e = Or.length;
    return Or.push(r), e;
  }, Qt = (r, e) => {
    var t = U2[r];
    return t === void 0 && g(`${e} has unknown type ${ne2(r)}`), t;
  }, rn = (r, e) => {
    for (var t = new Array(r), n = 0; n < r; ++n)
      t[n] = Qt($2[e + n * 4 >> 2], `parameter ${n}`);
    return t;
  }, en = (r, e, t) => {
    var n = [], i = r(n, t);
    return n.length && ($2[e >> 2] = O2.toHandle(n)), i;
  }, tn = {}, ve = (r) => {
    var e = tn[r];
    return e === void 0 ? P2(r) : e;
  }, nn = (r, e, t) => {
    var n = 8, [i, ...a] = rn(r, e), s = i.toWireType.bind(i), o = a.map((v2) => v2.readValueFromPointer.bind(v2));
    r--;
    var u = new Array(r), f = (v2, y, b2, C) => {
      for (var T = 0, w2 = 0; w2 < r; ++w2)
        u[w2] = o[w2](C + T), T += n;
      var m2;
      switch (t) {
        case 0:
          m2 = O2.toValue(v2).apply(null, u);
          break;
        case 2:
          m2 = Reflect.construct(O2.toValue(v2), u);
          break;
        case 3:
          m2 = u[0];
          break;
        case 1:
          m2 = O2.toValue(v2)[ve(y)](...u);
          break;
      }
      return en(s, b2, m2);
    }, c2 = `methodCaller<(${a.map((v2) => v2.name)}) => ${i.name}>`;
    return Jt(Pr(c2, f));
  }, an = (r) => r ? (r = ve(r), O2.toHandle(globalThis[r])) : O2.toHandle(globalThis), sn = (r) => {
    r > 9 && (H2[r + 1] += 1);
  }, on = (r, e, t, n, i) => Or[r](e, t, n, i), un = (r) => {
    var e = O2.toValue(r);
    $r(e), Er(r);
  }, fn = (r, e, t, n) => {
    var i = (/* @__PURE__ */ new Date()).getFullYear(), a = new Date(i, 0, 1), s = new Date(i, 6, 1), o = a.getTimezoneOffset(), u = s.getTimezoneOffset(), f = Math.max(o, u);
    $2[r >> 2] = f * 60, Y2[e >> 2] = +(o != u);
    var c2 = (b2) => {
      var C = b2 >= 0 ? "-" : "+", T = Math.abs(b2), w2 = String(Math.floor(T / 60)).padStart(2, "0"), m2 = String(T % 60).padStart(2, "0");
      return `UTC${C}${w2}${m2}`;
    }, v2 = c2(o), y = c2(u);
    u < o ? (Z2(v2, t, 17), Z2(y, n, 17)) : (Z2(v2, n, 17), Z2(y, t, 17));
  }, ln2 = () => 2147483648, cn = (r, e) => Math.ceil(r / e) * e, vn = (r) => {
    var e = dr.buffer.byteLength, t = (r - e + 65535) / 65536 | 0;
    try {
      return dr.grow(t), zr(), 1;
    } catch {
    }
  }, dn = (r) => {
    var e = D2.length;
    r >>>= 0;
    var t = ln2();
    if (r > t)
      return false;
    for (var n = 1; n <= 4; n *= 2) {
      var i = e * (1 + 0.2 / n);
      i = Math.min(i, r + 100663296);
      var a = Math.min(t, cn(Math.max(r, i), 65536)), s = vn(a);
      if (s)
        return true;
    }
    return false;
  }, kr = {}, pn = () => Wr || "./this.program", Q2 = () => {
    if (!Q2.strings) {
      var r = (typeof navigator == "object" && navigator.language || "C").replace("-", "_") + ".UTF-8", e = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG: r,
        _: pn()
      };
      for (var t in kr)
        kr[t] === void 0 ? delete e[t] : e[t] = kr[t];
      var n = [];
      for (var t in e)
        n.push(`${t}=${e[t]}`);
      Q2.strings = n;
    }
    return Q2.strings;
  }, hn = (r, e) => {
    var t = 0, n = 0;
    for (var i of Q2()) {
      var a = e + t;
      $2[r + n >> 2] = a, t += Z2(i, a, 1 / 0) + 1, n += 4;
    }
    return 0;
  }, _n = (r, e) => {
    var t = Q2();
    $2[r >> 2] = t.length;
    var n = 0;
    for (var i of t)
      n += oe2(i) + 1;
    return $2[e >> 2] = n, 0;
  }, gn = (r) => 52;
  function yn(r, e, t, n, i) {
    return 70;
  }
  var mn = [null, [], []], bn = (r, e) => {
    var t = mn[r];
    e === 0 || e === 10 ? ((r === 1 ? Br : L)(le2(t)), t.length = 0) : t.push(e);
  }, wn = (r, e, t, n) => {
    for (var i = 0, a = 0; a < t; a++) {
      var s = $2[e >> 2], o = $2[e + 4 >> 2];
      e += 8;
      for (var u = 0; u < o; u++)
        bn(r, D2[s + u]);
      i += o;
    }
    return $2[n >> 2] = i, 0;
  }, $n = (r) => r;
  if (ft(), wt(), l2.noExitRuntime && l2.noExitRuntime, l2.print && (Br = l2.print), l2.printErr && (L = l2.printErr), l2.wasmBinary && (G2 = l2.wasmBinary), l2.arguments && l2.arguments, l2.thisProgram && (Wr = l2.thisProgram), l2.preInit)
    for (typeof l2.preInit == "function" && (l2.preInit = [l2.preInit]); l2.preInit.length > 0; )
      l2.preInit.shift()();
  var de2, I, Dr, pe2, d, he2, _e2, ge, ye2, me2, be, we2, $e, dr, Te2;
  function Tn(r) {
    de2 = r.ya, I = l2._free = r.za, Dr = l2._malloc = r.Ba, pe2 = r.Ca, d = r.Da, he2 = r.Ea, _e2 = r.Fa, ge = r.Ga, ye2 = r.Ha, me2 = r.Ia, be = r.Ja, W2.viijii = r.Ka, we2 = W2.iiijj = r.La, W2.jiji = r.Ma, $e = W2.jiiii = r.Na, W2.iiiiij = r.Oa, W2.iiiiijj = r.Pa, W2.iiiiiijj = r.Qa, dr = r.wa, Te2 = r.Aa;
  }
  var Cn = {
    s: Ze,
    x: Ge,
    a: Xe,
    j: Ye,
    m: qe,
    P: Ke,
    q: Je,
    U: Qe,
    d: rt,
    ba: et2,
    ta: nt,
    aa: it,
    oa: st,
    ra: Rt,
    qa: St,
    F: Ft,
    ma: Et,
    W: kt,
    X: Dt,
    z: jt,
    t: Wt,
    sa: Bt,
    na: Ht,
    R: Xt,
    G: Yt,
    ua: qt,
    pa: Kt,
    M: nn,
    va: Er,
    C: an,
    S: sn,
    L: on,
    ha: un,
    ca: fn,
    fa: dn,
    da: hn,
    ea: _n,
    ga: gn,
    _: yn,
    V: wn,
    J: Xn,
    B: qn,
    Y: kn,
    T: ei,
    r: xn,
    b: An,
    D: Gn,
    ja: Jn,
    c: Fn,
    ia: Qn,
    h: On,
    i: Bn,
    p: Vn,
    O: Zn,
    w: Nn,
    E: Ln,
    K: zn,
    I: ti,
    $: ii,
    Z: ai,
    f: Dn,
    l: Pn,
    e: Sn,
    g: En,
    N: ri,
    k: Rn,
    ka: Yn,
    o: Hn,
    y: jn,
    u: Un,
    Q: In,
    v: Kn,
    n: Mn,
    H: ni,
    la: Wn,
    A: $n
  };
  function Pn(r, e) {
    var t = h2();
    try {
      _2(r)(e);
    } catch (n) {
      if (p2(t), n !== n + 0) throw n;
      d(1, 0);
    }
  }
  function Rn(r, e, t, n, i) {
    var a = h2();
    try {
      _2(r)(e, t, n, i);
    } catch (s) {
      if (p2(a), s !== s + 0) throw s;
      d(1, 0);
    }
  }
  function An(r, e) {
    var t = h2();
    try {
      return _2(r)(e);
    } catch (n) {
      if (p2(t), n !== n + 0) throw n;
      d(1, 0);
    }
  }
  function Sn(r, e, t) {
    var n = h2();
    try {
      _2(r)(e, t);
    } catch (i) {
      if (p2(n), i !== i + 0) throw i;
      d(1, 0);
    }
  }
  function Fn(r, e, t) {
    var n = h2();
    try {
      return _2(r)(e, t);
    } catch (i) {
      if (p2(n), i !== i + 0) throw i;
      d(1, 0);
    }
  }
  function En(r, e, t, n) {
    var i = h2();
    try {
      _2(r)(e, t, n);
    } catch (a) {
      if (p2(i), a !== a + 0) throw a;
      d(1, 0);
    }
  }
  function On(r, e, t, n) {
    var i = h2();
    try {
      return _2(r)(e, t, n);
    } catch (a) {
      if (p2(i), a !== a + 0) throw a;
      d(1, 0);
    }
  }
  function kn(r, e, t, n, i, a) {
    var s = h2();
    try {
      return _2(r)(e, t, n, i, a);
    } catch (o) {
      if (p2(s), o !== o + 0) throw o;
      d(1, 0);
    }
  }
  function Dn(r) {
    var e = h2();
    try {
      _2(r)();
    } catch (t) {
      if (p2(e), t !== t + 0) throw t;
      d(1, 0);
    }
  }
  function Mn(r, e, t, n, i, a, s, o, u, f, c2) {
    var v2 = h2();
    try {
      _2(r)(e, t, n, i, a, s, o, u, f, c2);
    } catch (y) {
      if (p2(v2), y !== y + 0) throw y;
      d(1, 0);
    }
  }
  function jn(r, e, t, n, i, a, s) {
    var o = h2();
    try {
      _2(r)(e, t, n, i, a, s);
    } catch (u) {
      if (p2(o), u !== u + 0) throw u;
      d(1, 0);
    }
  }
  function Wn(r, e, t, n, i, a, s, o, u, f, c2, v2, y, b2, C, T, w2) {
    var m2 = h2();
    try {
      _2(r)(e, t, n, i, a, s, o, u, f, c2, v2, y, b2, C, T, w2);
    } catch (F2) {
      if (p2(m2), F2 !== F2 + 0) throw F2;
      d(1, 0);
    }
  }
  function In(r, e, t, n, i, a, s, o, u) {
    var f = h2();
    try {
      _2(r)(e, t, n, i, a, s, o, u);
    } catch (c2) {
      if (p2(f), c2 !== c2 + 0) throw c2;
      d(1, 0);
    }
  }
  function Bn(r, e, t, n, i) {
    var a = h2();
    try {
      return _2(r)(e, t, n, i);
    } catch (s) {
      if (p2(a), s !== s + 0) throw s;
      d(1, 0);
    }
  }
  function Un(r, e, t, n, i, a, s, o) {
    var u = h2();
    try {
      _2(r)(e, t, n, i, a, s, o);
    } catch (f) {
      if (p2(u), f !== f + 0) throw f;
      d(1, 0);
    }
  }
  function Vn(r, e, t, n, i, a) {
    var s = h2();
    try {
      return _2(r)(e, t, n, i, a);
    } catch (o) {
      if (p2(s), o !== o + 0) throw o;
      d(1, 0);
    }
  }
  function Hn(r, e, t, n, i, a) {
    var s = h2();
    try {
      _2(r)(e, t, n, i, a);
    } catch (o) {
      if (p2(s), o !== o + 0) throw o;
      d(1, 0);
    }
  }
  function Nn(r, e, t, n, i, a, s) {
    var o = h2();
    try {
      return _2(r)(e, t, n, i, a, s);
    } catch (u) {
      if (p2(o), u !== u + 0) throw u;
      d(1, 0);
    }
  }
  function Ln(r, e, t, n, i, a, s, o) {
    var u = h2();
    try {
      return _2(r)(e, t, n, i, a, s, o);
    } catch (f) {
      if (p2(u), f !== f + 0) throw f;
      d(1, 0);
    }
  }
  function xn(r) {
    var e = h2();
    try {
      return _2(r)();
    } catch (t) {
      if (p2(e), t !== t + 0) throw t;
      d(1, 0);
    }
  }
  function zn(r, e, t, n, i, a, s, o, u) {
    var f = h2();
    try {
      return _2(r)(e, t, n, i, a, s, o, u);
    } catch (c2) {
      if (p2(f), c2 !== c2 + 0) throw c2;
      d(1, 0);
    }
  }
  function Zn(r, e, t, n, i, a, s) {
    var o = h2();
    try {
      return _2(r)(e, t, n, i, a, s);
    } catch (u) {
      if (p2(o), u !== u + 0) throw u;
      d(1, 0);
    }
  }
  function Gn(r, e, t, n) {
    var i = h2();
    try {
      return _2(r)(e, t, n);
    } catch (a) {
      if (p2(i), a !== a + 0) throw a;
      d(1, 0);
    }
  }
  function Xn(r, e, t, n) {
    var i = h2();
    try {
      return _2(r)(e, t, n);
    } catch (a) {
      if (p2(i), a !== a + 0) throw a;
      d(1, 0);
    }
  }
  function Yn(r, e, t, n, i, a, s, o) {
    var u = h2();
    try {
      _2(r)(e, t, n, i, a, s, o);
    } catch (f) {
      if (p2(u), f !== f + 0) throw f;
      d(1, 0);
    }
  }
  function qn(r, e, t, n, i, a) {
    var s = h2();
    try {
      return _2(r)(e, t, n, i, a);
    } catch (o) {
      if (p2(s), o !== o + 0) throw o;
      d(1, 0);
    }
  }
  function Kn(r, e, t, n, i, a, s, o, u, f) {
    var c2 = h2();
    try {
      _2(r)(e, t, n, i, a, s, o, u, f);
    } catch (v2) {
      if (p2(c2), v2 !== v2 + 0) throw v2;
      d(1, 0);
    }
  }
  function Jn(r, e, t) {
    var n = h2();
    try {
      return _2(r)(e, t);
    } catch (i) {
      if (p2(n), i !== i + 0) throw i;
      d(1, 0);
    }
  }
  function Qn(r, e, t, n, i) {
    var a = h2();
    try {
      return _2(r)(e, t, n, i);
    } catch (s) {
      if (p2(a), s !== s + 0) throw s;
      d(1, 0);
    }
  }
  function ri(r, e, t, n, i, a, s) {
    var o = h2();
    try {
      _2(r)(e, t, n, i, a, s);
    } catch (u) {
      if (p2(o), u !== u + 0) throw u;
      d(1, 0);
    }
  }
  function ei(r, e, t, n) {
    var i = h2();
    try {
      return _2(r)(e, t, n);
    } catch (a) {
      if (p2(i), a !== a + 0) throw a;
      d(1, 0);
    }
  }
  function ti(r, e, t, n, i, a, s, o, u, f, c2, v2) {
    var y = h2();
    try {
      return _2(r)(e, t, n, i, a, s, o, u, f, c2, v2);
    } catch (b2) {
      if (p2(y), b2 !== b2 + 0) throw b2;
      d(1, 0);
    }
  }
  function ni(r, e, t, n, i, a, s, o, u, f, c2, v2, y, b2, C, T) {
    var w2 = h2();
    try {
      _2(r)(e, t, n, i, a, s, o, u, f, c2, v2, y, b2, C, T);
    } catch (m2) {
      if (p2(w2), m2 !== m2 + 0) throw m2;
      d(1, 0);
    }
  }
  function ii(r, e, t, n, i, a, s) {
    var o = h2();
    try {
      return we2(r, e, t, n, i, a, s);
    } catch (u) {
      if (p2(o), u !== u + 0) throw u;
      d(1, 0);
    }
  }
  function ai(r, e, t, n, i) {
    var a = h2();
    try {
      return $e(r, e, t, n, i);
    } catch (s) {
      if (p2(a), s !== s + 0) throw s;
      d(1, 0);
    }
  }
  function si() {
    Me2();
    function r() {
      var e, t;
      l2.calledRun = true, !Ur && (je(), (e = Vr) === null || e === void 0 || e(l2), (t = l2.onRuntimeInitialized) === null || t === void 0 || t.call(l2), We());
    }
    l2.setStatus ? (l2.setStatus("Running..."), setTimeout(() => {
      setTimeout(() => l2.setStatus(""), 1), r();
    }, 1)) : r();
  }
  var rr;
  return rr = await Le(), si(), xr ? k2 = l2 : k2 = new Promise((r, e) => {
    Vr = r, Hr = e;
  }), k2;
}
function Se2(A) {
  return p(Mr, A);
}
async function Fe2(A, k2) {
  return we(Mr, A, k2);
}

// src/image-data.js
function createImageDataLike(data, width, height) {
  if (typeof ImageData === "function") {
    return new ImageData(data, width, height);
  }
  return {
    data,
    width,
    height
  };
}
function cropImageData(imageData, region) {
  const { data, width: sourceWidth, height: sourceHeight } = imageData;
  const x = Math.max(0, Math.min(sourceWidth, Math.round(region.x)));
  const y = Math.max(0, Math.min(sourceHeight, Math.round(region.y)));
  const width = Math.max(1, Math.min(sourceWidth - x, Math.round(region.width)));
  const height = Math.max(1, Math.min(sourceHeight - y, Math.round(region.height)));
  const output = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const sourceStart = (y + row) * sourceWidth * 4 + x * 4;
    const sourceEnd = sourceStart + width * 4;
    output.set(data.subarray(sourceStart, sourceEnd), row * width * 4);
  }
  return createImageDataLike(output, width, height);
}

// src/zxing-decoder.js
var overrideCache = /* @__PURE__ */ new Map();
var textEncoder = new TextEncoder();
function getModuleOverrides(wasmUrl) {
  let overrides = overrideCache.get(wasmUrl);
  if (overrides) {
    return overrides;
  }
  overrides = {
    locateFile(fileName) {
      if (fileName === DECODER_WASM_FILE_NAME) {
        return wasmUrl;
      }
      return new URL(fileName, wasmUrl).href;
    }
  };
  overrideCache.set(wasmUrl, overrides);
  return overrides;
}
function createReaderOptions(maxNumberOfSymbols, pass = {}) {
  const options = {
    formats: ["QRCode"],
    maxNumberOfSymbols: Math.max(1, maxNumberOfSymbols),
    tryHarder: Boolean(pass.tryHarder),
    tryRotate: true,
    tryInvert: Boolean(pass.tryInvert),
    tryDenoise: Boolean(pass.tryDenoise),
    tryDownscale: Boolean(pass.tryDownscale),
    textMode: "Plain"
  };
  if (Number.isFinite(pass.downscaleFactor)) {
    options.downscaleFactor = pass.downscaleFactor;
  }
  if (Number.isFinite(pass.downscaleThreshold)) {
    options.downscaleThreshold = pass.downscaleThreshold;
  }
  if (typeof pass.binarizer === "string" && pass.binarizer.length > 0) {
    options.binarizer = pass.binarizer;
  }
  return options;
}
function toFrameInput(result) {
  if ((result == null ? void 0 : result.bytes) instanceof Uint8Array && result.bytes.length > 0) {
    return result.bytes.slice();
  }
  if (typeof (result == null ? void 0 : result.text) === "string" && result.text.length > 0) {
    return textEncoder.encode(result.text);
  }
  return null;
}
function getFrameKey(frame) {
  if (!frame) {
    return null;
  }
  if (frame.type === "manifest") {
    return `M:${frame.sessionId}`;
  }
  if (frame.type === "chunk") {
    return `C:${frame.sessionId}:${frame.chunkIndex}`;
  }
  if (frame.type === "parity") {
    return `P:${frame.sessionId}:${frame.blockStartChunkIndex}`;
  }
  return null;
}
function getResultBounds(result, pass) {
  const position = result == null ? void 0 : result.position;
  if (!position) {
    return null;
  }
  const points = [
    position.topLeft,
    position.topRight,
    position.bottomLeft,
    position.bottomRight
  ].filter(Boolean);
  if (points.length === 0) {
    return null;
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    left: pass.x + Math.min(...xs),
    top: pass.y + Math.min(...ys),
    right: pass.x + Math.max(...xs),
    bottom: pass.y + Math.max(...ys)
  };
}
function getOverlapArea(region, bounds) {
  const left = Math.max(region.x, bounds.left);
  const top = Math.max(region.y, bounds.top);
  const right = Math.min(region.x + region.width, bounds.right);
  const bottom = Math.min(region.y + region.height, bounds.bottom);
  const width = right - left;
  const height = bottom - top;
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}
function getRegionPenalty(region, detectedBounds) {
  if (detectedBounds.length === 0) {
    return 0;
  }
  const regionArea = Math.max(1, region.width * region.height);
  let maxPenalty = 0;
  for (const bounds of detectedBounds) {
    maxPenalty = Math.max(maxPenalty, getOverlapArea(region, bounds) / regionArea);
  }
  return maxPenalty;
}
function takeNextPass(pendingPasses, detectedBounds) {
  var _a2, _b2;
  if (pendingPasses.length <= 1 || detectedBounds.length === 0) {
    return (_a2 = pendingPasses.shift()) != null ? _a2 : null;
  }
  let bestIndex = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let index = 0; index < pendingPasses.length; index += 1) {
    const penalty = getRegionPenalty(pendingPasses[index], detectedBounds);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestIndex = index;
    }
  }
  return (_b2 = pendingPasses.splice(bestIndex, 1)[0]) != null ? _b2 : null;
}
async function warmupZxingDecoder(wasmUrl) {
  return Se2({
    overrides: getModuleOverrides(wasmUrl),
    fireImmediately: true
  });
}
async function decodeImageDataWithZxing(imageData, {
  wasmUrl,
  passes,
  expectedSymbolsPerFrame
}) {
  const frameInputs = /* @__PURE__ */ new Map();
  const detectedBounds = [];
  const pendingPasses = [...passes];
  while (pendingPasses.length > 0) {
    const pass = takeNextPass(pendingPasses, detectedBounds);
    if (!pass) {
      break;
    }
    const remainingSymbols = Math.max(1, expectedSymbolsPerFrame - frameInputs.size);
    const croppedImage = cropImageData(imageData, pass);
    const results = await Fe2(
      croppedImage,
      createReaderOptions(remainingSymbols, pass)
    );
    for (const result of results) {
      const frameInput = toFrameInput(result);
      if (!frameInput) {
        continue;
      }
      const parsed = parseFrame(frameInput);
      const frameKey = getFrameKey(parsed);
      if (frameKey) {
        if (!frameInputs.has(frameKey)) {
          const bounds = getResultBounds(result, pass);
          if (bounds) {
            detectedBounds.push(bounds);
          }
        }
        frameInputs.set(frameKey, frameInput);
      }
    }
    if (frameInputs.size >= expectedSymbolsPerFrame) {
      break;
    }
  }
  return Array.from(frameInputs.values());
}

// src/decoder-controller.js
function normalizeError(error) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}
var _ZxingDecoderController_instances, prepareInternal_fn, fallbackToMainThread_fn, startWorker_fn, decodeWithWorker_fn, postToWorker_fn;
var ZxingDecoderController = class {
  constructor(options = {}) {
    __privateAdd(this, _ZxingDecoderController_instances);
    var _a2, _b2, _c, _d;
    this.decoderAssetBaseUrl = resolveDecoderAssetBaseUrl(
      (_a2 = options.decoderAssetBaseUrl) != null ? _a2 : null,
      options.moduleUrl
    );
    this.workerUrl = resolveDecoderWorkerUrl(this.decoderAssetBaseUrl);
    this.wasmUrl = resolveDecoderWasmUrl(this.decoderAssetBaseUrl);
    this.workerFactory = (_b2 = options.workerFactory) != null ? _b2 : typeof Worker === "function" ? Worker : null;
    this.warmupDecoder = (_c = options.warmupDecoder) != null ? _c : warmupZxingDecoder;
    this.decodeOnMainThread = (_d = options.decodeOnMainThread) != null ? _d : decodeImageDataWithZxing;
    this.mode = "uninitialized";
    this.worker = null;
    this.preparePromise = null;
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.requestId = 0;
  }
  async prepare() {
    if (!this.preparePromise) {
      this.preparePromise = __privateMethod(this, _ZxingDecoderController_instances, prepareInternal_fn).call(this);
    }
    return this.preparePromise;
  }
  async decodeImageData(imageData, passes, expectedSymbolsPerFrame) {
    var _a2;
    const preparation = await this.prepare();
    let modeChanged = preparation.modeChanged;
    let reason = (_a2 = preparation.reason) != null ? _a2 : null;
    if (this.mode === "worker" && this.worker) {
      try {
        const frameInputs2 = await __privateMethod(this, _ZxingDecoderController_instances, decodeWithWorker_fn).call(this, imageData, passes, expectedSymbolsPerFrame);
        return {
          frameInputs: frameInputs2,
          mode: this.mode,
          modeChanged,
          reason
        };
      } catch (error) {
        const fallback = await __privateMethod(this, _ZxingDecoderController_instances, fallbackToMainThread_fn).call(this, error);
        modeChanged = modeChanged || fallback.modeChanged;
        reason = fallback.reason;
      }
    }
    const frameInputs = await this.decodeOnMainThread(imageData, {
      wasmUrl: this.wasmUrl,
      passes,
      expectedSymbolsPerFrame
    });
    return {
      frameInputs,
      mode: this.mode,
      modeChanged,
      reason
    };
  }
  destroy() {
    for (const pending of this.pendingRequests.values()) {
      pending.reject(new Error("Decoder worker was destroyed"));
    }
    this.pendingRequests.clear();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.mode = "uninitialized";
    this.preparePromise = null;
  }
};
_ZxingDecoderController_instances = new WeakSet();
prepareInternal_fn = async function() {
  if (this.workerFactory && this.workerUrl) {
    try {
      await __privateMethod(this, _ZxingDecoderController_instances, startWorker_fn).call(this);
      this.mode = "worker";
      return {
        mode: this.mode,
        modeChanged: true,
        reason: null
      };
    } catch (error) {
      return __privateMethod(this, _ZxingDecoderController_instances, fallbackToMainThread_fn).call(this, error);
    }
  }
  return __privateMethod(this, _ZxingDecoderController_instances, fallbackToMainThread_fn).call(this, new Error("Worker is not available in this environment"));
};
fallbackToMainThread_fn = async function(error) {
  if (this.worker) {
    this.worker.terminate();
    this.worker = null;
  }
  for (const pending of this.pendingRequests.values()) {
    pending.reject(normalizeError(error));
  }
  this.pendingRequests.clear();
  await this.warmupDecoder(this.wasmUrl);
  const modeChanged = this.mode !== "main-thread-fallback";
  this.mode = "main-thread-fallback";
  return {
    mode: this.mode,
    modeChanged,
    reason: error ? normalizeError(error) : null
  };
};
startWorker_fn = async function() {
  this.worker = new this.workerFactory(this.workerUrl);
  this.worker.onmessage = (event) => {
    var _a2;
    const payload = (_a2 = event.data) != null ? _a2 : {};
    const pending = this.pendingRequests.get(payload.id);
    if (!pending) {
      return;
    }
    this.pendingRequests.delete(payload.id);
    if (payload.type === "decoder-error") {
      pending.reject(new Error(payload.message || "Decoder worker error"));
      return;
    }
    pending.resolve(payload);
  };
  this.worker.onerror = (event) => {
    const message = (event == null ? void 0 : event.message) || "Decoder worker failed";
    for (const pending of this.pendingRequests.values()) {
      pending.reject(new Error(message));
    }
    this.pendingRequests.clear();
  };
  await __privateMethod(this, _ZxingDecoderController_instances, postToWorker_fn).call(this, {
    type: "warmup",
    wasmUrl: this.wasmUrl
  });
};
decodeWithWorker_fn = async function(imageData, passes, expectedSymbolsPerFrame) {
  const sourceBuffer = imageData.data.slice().buffer;
  const response = await __privateMethod(this, _ZxingDecoderController_instances, postToWorker_fn).call(this, {
    type: "decode",
    wasmUrl: this.wasmUrl,
    width: imageData.width,
    height: imageData.height,
    passes,
    expectedSymbolsPerFrame,
    buffer: sourceBuffer
  }, [sourceBuffer]);
  return Array.isArray(response.frames) ? response.frames.map((buffer) => new Uint8Array(buffer)) : [];
};
postToWorker_fn = function(payload, transfer = []) {
  if (!this.worker) {
    return Promise.reject(new Error("Decoder worker is not available"));
  }
  const id = ++this.requestId;
  return new Promise((resolve, reject) => {
    this.pendingRequests.set(id, { resolve, reject });
    this.worker.postMessage({ ...payload, id }, transfer);
  });
};

// src/camera-optimization.js
function normalizeCapabilityList(value) {
  return Array.isArray(value) ? value : [];
}
function getNumericCapabilityRange(capability) {
  if (!capability || typeof capability !== "object") {
    return null;
  }
  const min = Number.isFinite(capability.min) ? capability.min : null;
  const max2 = Number.isFinite(capability.max) ? capability.max : null;
  if (min === null && max2 === null) {
    return null;
  }
  return { min, max: max2 };
}
function clampNumber(value, range) {
  var _a2, _b2;
  if (!range) {
    return value;
  }
  const min = (_a2 = range.min) != null ? _a2 : value;
  const max2 = (_b2 = range.max) != null ? _b2 : value;
  return Math.max(min, Math.min(max2, value));
}
function chooseResolution(range, preferredValue) {
  if (!range) {
    return void 0;
  }
  const ideal = clampNumber(preferredValue, range);
  return { ideal };
}
async function optimizeCameraTrack(track, options = {}) {
  var _a2, _b2, _c, _d, _e2, _f, _g, _h, _i, _j, _k;
  if (!track || typeof track.applyConstraints !== "function") {
    return {
      optimized: false,
      reason: "Track constraints are not supported",
      settings: typeof (track == null ? void 0 : track.getSettings) === "function" ? track.getSettings() : {}
    };
  }
  const capabilities = typeof track.getCapabilities === "function" ? (_a2 = track.getCapabilities()) != null ? _a2 : {} : {};
  const settings = typeof track.getSettings === "function" ? (_b2 = track.getSettings()) != null ? _b2 : {} : {};
  const constraint = {};
  const advanced = [];
  const widthRange = getNumericCapabilityRange(capabilities.width);
  const heightRange = getNumericCapabilityRange(capabilities.height);
  const frameRateRange = getNumericCapabilityRange(capabilities.frameRate);
  const width = chooseResolution(widthRange, (_c = options.preferredWidth) != null ? _c : 1280);
  const height = chooseResolution(heightRange, (_d = options.preferredHeight) != null ? _d : 720);
  if (width) {
    constraint.width = width;
  }
  if (height) {
    constraint.height = height;
  }
  if (frameRateRange) {
    constraint.frameRate = {
      ideal: clampNumber((_e2 = options.preferredFrameRate) != null ? _e2 : 30, frameRateRange),
      max: clampNumber((_f = options.maxFrameRate) != null ? _f : 30, frameRateRange)
    };
  }
  const resizeModes = normalizeCapabilityList(capabilities.resizeMode);
  if (resizeModes.includes("none")) {
    advanced.push({ resizeMode: "none" });
  }
  const focusModes = normalizeCapabilityList(capabilities.focusMode);
  if (focusModes.includes("continuous")) {
    advanced.push({ focusMode: "continuous" });
  } else if (focusModes.includes("single-shot")) {
    advanced.push({ focusMode: "single-shot" });
  }
  const zoomRange = getNumericCapabilityRange(capabilities.zoom);
  if (zoomRange) {
    advanced.push({
      zoom: clampNumber((_h = options.preferredZoom) != null ? _h : (_g = zoomRange.min) != null ? _g : 1, {
        min: (_i = zoomRange.min) != null ? _i : 1,
        max: Math.max((_j = zoomRange.min) != null ? _j : 1, Math.min((_k = zoomRange.max) != null ? _k : 1, 1.6))
      })
    });
  }
  if (advanced.length > 0) {
    constraint.advanced = advanced;
  }
  try {
    await track.applyConstraints(constraint);
    return {
      optimized: true,
      capabilities,
      settings: typeof track.getSettings === "function" ? track.getSettings() : settings,
      appliedConstraints: constraint
    };
  } catch (error) {
    return {
      optimized: false,
      capabilities,
      settings: typeof track.getSettings === "function" ? track.getSettings() : settings,
      appliedConstraints: constraint,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

// src/receiver.js
function isSecureCameraContext() {
  if (typeof window === "undefined") {
    return true;
  }
  return window.isSecureContext !== false;
}
function isConstraintLikeError(error) {
  const name = error == null ? void 0 : error.name;
  return name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError" || name === "NotFoundError" || name === "DevicesNotFoundError";
}
function createCameraStartError(error) {
  const name = error == null ? void 0 : error.name;
  let message = (error == null ? void 0 : error.message) || String(error);
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    message = "Camera permission was denied. Check the browser site settings and allow camera access.";
  } else if (name === "NotReadableError" || name === "TrackStartError") {
    message = "The camera is already in use by another app or browser tab.";
  } else if (isConstraintLikeError(error)) {
    message = "The requested camera settings are not available on this device.";
  } else if (name === "SecurityError") {
    message = "Camera access requires a secure context (HTTPS).";
  }
  const wrapped = new Error(message);
  wrapped.name = name || "CameraStartError";
  if (error && !wrapped.cause) {
    wrapped.cause = error;
  }
  return wrapped;
}
function constrainScanSize(width, height, maxDimension) {
  if (!Number.isInteger(maxDimension) || maxDimension <= 0) {
    return { width, height };
  }
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}
function createSession(sessionId, totalChunks) {
  return {
    sessionId,
    totalChunks,
    chunkByteSize: null,
    symbolsPerFrame: 1,
    parityBlockDataChunks: 0,
    fileSize: null,
    mimeType: "application/octet-stream",
    fileName: `transfer-${sessionId}.bin`,
    chunks: /* @__PURE__ */ new Map(),
    parityChunks: /* @__PURE__ */ new Map(),
    receivedChunks: 0,
    manifestReceived: false,
    completed: false,
    diagnostics: {
      startedAt: Date.now(),
      totalFramesSeen: 0,
      newFrames: 0,
      duplicateFrames: 0,
      manifestFrames: 0,
      chunkFrames: 0,
      parityFrames: 0,
      parityRecoveries: 0
    }
  };
}
function createProgressPayload(session) {
  const ratio = session.totalChunks > 0 ? session.receivedChunks / session.totalChunks : 0;
  return {
    sessionId: session.sessionId,
    receivedChunks: session.receivedChunks,
    totalChunks: session.totalChunks,
    ratio
  };
}
function createDiagnosticsPayload(session) {
  const totalFrames = session.diagnostics.totalFramesSeen;
  const uniqueFrames = session.diagnostics.newFrames;
  const duplicateFrames = session.diagnostics.duplicateFrames;
  return {
    sessionId: session.sessionId,
    totalFramesSeen: totalFrames,
    newFrames: uniqueFrames,
    duplicateFrames,
    uniqueFrameRatio: totalFrames > 0 ? uniqueFrames / totalFrames : 0,
    manifestFrames: session.diagnostics.manifestFrames,
    chunkFrames: session.diagnostics.chunkFrames,
    parityFrames: session.diagnostics.parityFrames,
    parityRecoveries: session.diagnostics.parityRecoveries,
    receivedChunks: session.receivedChunks,
    totalChunks: session.totalChunks
  };
}
function getFrameKey2(frame) {
  if (!frame) {
    return "unknown";
  }
  if (frame.type === "manifest") {
    return `M:${frame.sessionId}`;
  }
  if (frame.type === "chunk") {
    return `C:${frame.sessionId}:${frame.chunkIndex}`;
  }
  if (frame.type === "parity") {
    return `P:${frame.sessionId}:${frame.blockStartChunkIndex}`;
  }
  return "unknown";
}
function hasChunk(session, chunkIndex) {
  return session.chunks.has(chunkIndex);
}
function setChunk(session, chunkIndex, chunkBytes) {
  session.chunks.set(chunkIndex, chunkBytes);
}
function getChunk(session, chunkIndex) {
  var _a2;
  return (_a2 = session.chunks.get(chunkIndex)) != null ? _a2 : null;
}
function recoverParityChunk(session, blockStartChunkIndex) {
  if (!session.parityBlockDataChunks || !session.parityChunks.has(blockStartChunkIndex)) {
    return null;
  }
  const blockEndChunkIndex = Math.min(
    session.totalChunks,
    blockStartChunkIndex + session.parityBlockDataChunks
  );
  let missingChunkIndex = null;
  let missingCount = 0;
  for (let chunkIndex = blockStartChunkIndex; chunkIndex < blockEndChunkIndex; chunkIndex += 1) {
    if (!hasChunk(session, chunkIndex)) {
      missingChunkIndex = chunkIndex;
      missingCount += 1;
      if (missingCount > 1) {
        return null;
      }
    }
  }
  if (missingChunkIndex === null || missingCount !== 1 || !session.chunkByteSize) {
    return null;
  }
  const parityBytes = session.parityChunks.get(blockStartChunkIndex);
  const recoveredChunk = parityBytes.slice();
  for (let chunkIndex = blockStartChunkIndex; chunkIndex < blockEndChunkIndex; chunkIndex += 1) {
    if (chunkIndex === missingChunkIndex) {
      continue;
    }
    const chunkBytes = getChunk(session, chunkIndex);
    for (let index = 0; index < chunkBytes.length; index += 1) {
      recoveredChunk[index] ^= chunkBytes[index];
    }
  }
  const isLastChunk = missingChunkIndex === session.totalChunks - 1;
  const chunkLength = isLastChunk && Number.isInteger(session.fileSize) ? session.fileSize - missingChunkIndex * session.chunkByteSize : session.chunkByteSize;
  return {
    chunkIndex: missingChunkIndex,
    chunkBytes: recoveredChunk.slice(0, chunkLength)
  };
}
function concatSessionChunks(session) {
  const orderedChunks = [];
  for (let chunkIndex = 0; chunkIndex < session.totalChunks; chunkIndex += 1) {
    const chunkBytes = getChunk(session, chunkIndex);
    if (!(chunkBytes instanceof Uint8Array)) {
      return null;
    }
    orderedChunks.push(chunkBytes);
  }
  return concatChunks(
    orderedChunks,
    Number.isInteger(session.fileSize) ? session.fileSize : null
  );
}
function createDownloadLink(result, anchorElement = null) {
  const url = URL.createObjectURL(result.blob);
  if (!anchorElement && typeof document === "undefined") {
    throw new Error("createDownloadLink requires document when anchorElement is not provided");
  }
  const anchor = anchorElement != null ? anchorElement : document.createElement("a");
  anchor.href = url;
  anchor.download = result.fileName;
  return { url, anchor };
}
var _AnimatedQrReceiver_instances, cancelScheduledScan_fn, scheduleNextScan_fn, processScanFrame_fn, getExpectedSymbolsPerFrame_fn, getKnownSymbolsPerFrame_fn, dedupeFrameInputs_fn, emitDecoderMode_fn, decodeLegacy_fn, readFrameInputs_fn;
var AnimatedQrReceiver = class extends SimpleEmitter {
  constructor(options = {}) {
    var _a2, _b2, _c, _d, _e2, _f, _g, _h, _i, _j, _k;
    super();
    __privateAdd(this, _AnimatedQrReceiver_instances);
    this.video = (_a2 = options.video) != null ? _a2 : null;
    this.scanIntervalMs = (_b2 = options.scanIntervalMs) != null ? _b2 : 120;
    this.autoStopOnComplete = (_c = options.autoStopOnComplete) != null ? _c : true;
    this.maxSymbolsPerFrame = (_d = options.maxSymbolsPerFrame) != null ? _d : 4;
    this.scanMaxDimension = (_e2 = options.scanMaxDimension) != null ? _e2 : 960;
    this.decoderAssetBaseUrl = (_f = options.decoderAssetBaseUrl) != null ? _f : null;
    this.cameraOptimization = (_g = options.cameraOptimization) != null ? _g : true;
    this.cameraConstraints = (_h = options.cameraConstraints) != null ? _h : {
      audio: false,
      video: {
        facingMode: "environment"
      }
    };
    this.sessions = /* @__PURE__ */ new Map();
    this.stream = null;
    this.scanning = false;
    this.scanTimer = null;
    this.scanInFlight = false;
    this.videoFrameRequestId = null;
    this.scanCanvas = (_i = options.scanCanvas) != null ? _i : typeof document !== "undefined" ? document.createElement("canvas") : null;
    this.scanContext = (_k = (_j = this.scanCanvas) == null ? void 0 : _j.getContext("2d", { willReadFrequently: true })) != null ? _k : null;
    this.decoder = new ZxingDecoderController({
      decoderAssetBaseUrl: this.decoderAssetBaseUrl
    });
  }
  setVideo(videoElement) {
    this.video = videoElement;
  }
  async startCamera(constraints = this.cameraConstraints) {
    if (!this.video) {
      throw new Error("No video element configured. Pass { video } or call setVideo().");
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      throw new Error("Camera API is not available in this browser");
    }
    if (!isSecureCameraContext()) {
      throw createCameraStartError({ name: "SecurityError" });
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (!isConstraintLikeError(error)) {
        throw createCameraStartError(error);
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true
        });
      } catch (fallbackError) {
        throw createCameraStartError(fallbackError);
      }
    }
    this.stream = stream;
    this.video.srcObject = this.stream;
    this.video.setAttribute("playsinline", "true");
    await this.video.play();
    if (this.cameraOptimization) {
      const [videoTrack] = this.stream.getVideoTracks();
      const optimization = await optimizeCameraTrack(videoTrack, {
        preferredWidth: 1280,
        preferredHeight: 720,
        preferredFrameRate: 30,
        maxFrameRate: 30
      });
      this.emit("camera-tuned", optimization);
    }
    this.emit("camera-start", { stream: this.stream });
    return this.stream;
  }
  stopCamera() {
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.emit("camera-stop", {});
  }
  async start(constraints = void 0) {
    if (!this.video) {
      throw new Error("No video element configured. Pass { video } or call setVideo().");
    }
    if (this.scanning) {
      return;
    }
    const cameraPromise = this.stream ? Promise.resolve(this.stream) : this.startCamera(constraints != null ? constraints : this.cameraConstraints);
    const decoderPromise = this.decoder.prepare();
    const [, decoderState] = await Promise.all([cameraPromise, decoderPromise]);
    __privateMethod(this, _AnimatedQrReceiver_instances, emitDecoderMode_fn).call(this, decoderState, true);
    this.scanning = true;
    this.emit("scan-start", {});
    __privateMethod(this, _AnimatedQrReceiver_instances, scheduleNextScan_fn).call(this);
  }
  stop() {
    this.scanning = false;
    this.scanInFlight = false;
    __privateMethod(this, _AnimatedQrReceiver_instances, cancelScheduledScan_fn).call(this);
    this.emit("scan-stop", {});
  }
  reset(sessionId = null) {
    if (sessionId === null) {
      this.sessions.clear();
      return;
    }
    this.sessions.delete(sessionId);
  }
  getProgress(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? createProgressPayload(session) : null;
  }
  getDiagnostics(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? createDiagnosticsPayload(session) : null;
  }
  ingestFrame(frameInput) {
    var _a2, _b2;
    const frame = parseFrame(frameInput);
    if (!frame || !frame.sessionId) {
      return { accepted: false, frame: null, result: null };
    }
    let session = this.sessions.get(frame.sessionId);
    if (!session) {
      session = createSession(frame.sessionId, frame.totalChunks);
      this.sessions.set(frame.sessionId, session);
    }
    if (frame.type === "manifest") {
      if (session.totalChunks !== frame.totalChunks) {
        if (session.receivedChunks === 0) {
          session.totalChunks = frame.totalChunks;
          session.chunks = /* @__PURE__ */ new Map();
        } else {
          return { accepted: false, frame, result: null };
        }
      }
      session.chunkByteSize = frame.chunkByteSize;
      session.symbolsPerFrame = (_a2 = frame.symbolsPerFrame) != null ? _a2 : 1;
      session.parityBlockDataChunks = (_b2 = frame.parityBlockDataChunks) != null ? _b2 : 0;
      session.fileSize = frame.fileSize;
      session.mimeType = frame.mimeType;
      session.fileName = frame.fileName;
      const manifestWasNew = !session.manifestReceived;
      session.manifestReceived = true;
      session.diagnostics.totalFramesSeen += 1;
      session.diagnostics.manifestFrames += 1;
      if (manifestWasNew) {
        session.diagnostics.newFrames += 1;
      } else {
        session.diagnostics.duplicateFrames += 1;
      }
      this.emit("manifest", {
        sessionId: session.sessionId,
        fileName: session.fileName,
        mimeType: session.mimeType,
        fileSize: session.fileSize,
        chunkByteSize: session.chunkByteSize,
        symbolsPerFrame: session.symbolsPerFrame,
        parityBlockDataChunks: session.parityBlockDataChunks,
        totalChunks: session.totalChunks
      });
    } else if (frame.type === "chunk") {
      if (frame.totalChunks !== session.totalChunks || frame.chunkIndex >= session.totalChunks) {
        return { accepted: false, frame, result: null };
      }
      session.diagnostics.totalFramesSeen += 1;
      session.diagnostics.chunkFrames += 1;
      if (!hasChunk(session, frame.chunkIndex)) {
        setChunk(session, frame.chunkIndex, frame.dataBytes);
        session.receivedChunks += 1;
        session.diagnostics.newFrames += 1;
        this.emit("chunk", {
          sessionId: session.sessionId,
          chunkIndex: frame.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      } else {
        session.diagnostics.duplicateFrames += 1;
      }
    } else if (frame.type === "parity") {
      if (frame.totalChunks !== session.totalChunks) {
        return { accepted: false, frame, result: null };
      }
      session.diagnostics.totalFramesSeen += 1;
      session.diagnostics.parityFrames += 1;
      if (!session.parityChunks.has(frame.blockStartChunkIndex)) {
        session.parityChunks.set(frame.blockStartChunkIndex, frame.dataBytes);
        session.diagnostics.newFrames += 1;
      } else {
        session.diagnostics.duplicateFrames += 1;
      }
      const recoveredFromParity = recoverParityChunk(session, frame.blockStartChunkIndex);
      if (recoveredFromParity && !hasChunk(session, recoveredFromParity.chunkIndex)) {
        setChunk(session, recoveredFromParity.chunkIndex, recoveredFromParity.chunkBytes);
        session.receivedChunks += 1;
        session.diagnostics.parityRecoveries += 1;
        this.emit("recover", {
          sessionId: session.sessionId,
          chunkIndex: recoveredFromParity.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      }
    }
    if (frame.type === "chunk" && session.parityBlockDataChunks > 0) {
      const blockStartChunkIndex = frame.chunkIndex - frame.chunkIndex % session.parityBlockDataChunks;
      const recoveredFromChunk = recoverParityChunk(session, blockStartChunkIndex);
      if (recoveredFromChunk && !hasChunk(session, recoveredFromChunk.chunkIndex)) {
        setChunk(session, recoveredFromChunk.chunkIndex, recoveredFromChunk.chunkBytes);
        session.receivedChunks += 1;
        session.diagnostics.parityRecoveries += 1;
        this.emit("recover", {
          sessionId: session.sessionId,
          chunkIndex: recoveredFromChunk.chunkIndex,
          receivedChunks: session.receivedChunks,
          totalChunks: session.totalChunks
        });
      }
    }
    const progress = createProgressPayload(session);
    this.emit("progress", progress);
    this.emit("diagnostics", createDiagnosticsPayload(session));
    if (!session.completed && session.manifestReceived && session.receivedChunks === session.totalChunks) {
      const bytes = concatSessionChunks(session);
      if (!(bytes instanceof Uint8Array)) {
        return { accepted: true, frame, result: null };
      }
      const blob = new Blob([bytes], { type: session.mimeType });
      const result = {
        sessionId: session.sessionId,
        blob,
        fileName: session.fileName,
        mimeType: session.mimeType,
        size: blob.size,
        totalChunks: session.totalChunks,
        receivedChunks: session.receivedChunks
      };
      session.completed = true;
      this.emit("complete", result);
      if (this.autoStopOnComplete) {
        this.stop();
      }
      return { accepted: true, frame, result };
    }
    return { accepted: true, frame, result: null };
  }
  ingestFrameText(frameInput) {
    return this.ingestFrame(frameInput);
  }
};
_AnimatedQrReceiver_instances = new WeakSet();
cancelScheduledScan_fn = function() {
  if (this.scanTimer !== null) {
    clearTimeout(this.scanTimer);
    this.scanTimer = null;
  }
  if (this.videoFrameRequestId !== null && this.video && typeof this.video.cancelVideoFrameCallback === "function") {
    this.video.cancelVideoFrameCallback(this.videoFrameRequestId);
    this.videoFrameRequestId = null;
  }
};
scheduleNextScan_fn = function() {
  if (!this.scanning || !this.video) {
    return;
  }
  __privateMethod(this, _AnimatedQrReceiver_instances, cancelScheduledScan_fn).call(this);
  if (typeof this.video.requestVideoFrameCallback === "function") {
    this.videoFrameRequestId = this.video.requestVideoFrameCallback(() => {
      this.videoFrameRequestId = null;
      void __privateMethod(this, _AnimatedQrReceiver_instances, processScanFrame_fn).call(this);
    });
    return;
  }
  this.scanTimer = setTimeout(() => {
    this.scanTimer = null;
    void __privateMethod(this, _AnimatedQrReceiver_instances, processScanFrame_fn).call(this);
  }, this.scanIntervalMs);
};
processScanFrame_fn = async function() {
  if (!this.scanning) {
    return;
  }
  if (this.scanInFlight) {
    __privateMethod(this, _AnimatedQrReceiver_instances, scheduleNextScan_fn).call(this);
    return;
  }
  this.scanInFlight = true;
  try {
    const frameInputs = await __privateMethod(this, _AnimatedQrReceiver_instances, readFrameInputs_fn).call(this);
    for (const frameInput of frameInputs) {
      this.ingestFrame(frameInput);
    }
  } catch (error) {
    this.emit("error", { error });
  } finally {
    this.scanInFlight = false;
    if (this.scanning) {
      __privateMethod(this, _AnimatedQrReceiver_instances, scheduleNextScan_fn).call(this);
    }
  }
};
getExpectedSymbolsPerFrame_fn = function() {
  let expectedSymbolsPerFrame = 1;
  for (const session of this.sessions.values()) {
    expectedSymbolsPerFrame = Math.max(expectedSymbolsPerFrame, session.symbolsPerFrame || 1);
  }
  if (expectedSymbolsPerFrame === 1) {
    expectedSymbolsPerFrame = Math.max(1, this.maxSymbolsPerFrame);
  }
  return expectedSymbolsPerFrame;
};
getKnownSymbolsPerFrame_fn = function() {
  let known = null;
  for (const session of this.sessions.values()) {
    if (session.symbolsPerFrame && session.symbolsPerFrame > 0) {
      known = Math.max(known != null ? known : 0, session.symbolsPerFrame);
    }
  }
  return known;
};
dedupeFrameInputs_fn = function(inputs) {
  const unique = /* @__PURE__ */ new Map();
  for (const input of inputs) {
    const parsed = parseFrame(input);
    if (!parsed) {
      continue;
    }
    unique.set(getFrameKey2(parsed), input);
  }
  return Array.from(unique.values());
};
emitDecoderMode_fn = function(state, force = false) {
  var _a2;
  if (!state || !force && !state.modeChanged) {
    return;
  }
  this.emit("decoder-mode", {
    mode: state.mode,
    reason: (_a2 = state.reason) != null ? _a2 : null
  });
};
decodeLegacy_fn = async function(imageData, expectedSymbolsPerFrame) {
  const decoderState = await this.decoder.decodeImageData(
    imageData,
    buildDecodePasses(imageData.width, imageData.height),
    expectedSymbolsPerFrame
  );
  __privateMethod(this, _AnimatedQrReceiver_instances, emitDecoderMode_fn).call(this, decoderState);
  return decoderState;
};
readFrameInputs_fn = async function() {
  if (!this.video || this.video.readyState < 2 || !this.scanCanvas || !this.scanContext) {
    return [];
  }
  const videoWidth = this.video.videoWidth;
  const videoHeight = this.video.videoHeight;
  if (!videoWidth || !videoHeight) {
    return [];
  }
  const { width, height } = constrainScanSize(videoWidth, videoHeight, this.scanMaxDimension);
  if (this.scanCanvas.width !== width) {
    this.scanCanvas.width = width;
  }
  if (this.scanCanvas.height !== height) {
    this.scanCanvas.height = height;
  }
  this.scanContext.drawImage(this.video, 0, 0, width, height);
  const imageData = this.scanContext.getImageData(0, 0, width, height);
  const expectedSymbolsPerFrame = __privateMethod(this, _AnimatedQrReceiver_instances, getExpectedSymbolsPerFrame_fn).call(this);
  const decoderState = await __privateMethod(this, _AnimatedQrReceiver_instances, decodeLegacy_fn).call(this, imageData, expectedSymbolsPerFrame);
  return __privateMethod(this, _AnimatedQrReceiver_instances, dedupeFrameInputs_fn).call(this, decoderState.frameInputs);
};

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b2 = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b2[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b2[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j2 = b2[i]; j2 < b2[i + 1]; ++j2) {
      r[j2] = j2 - b2[i] << 5 | i;
    }
  }
  return { b: b2, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l2 = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l2[cd[i] - 1];
  }
  var le2 = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le2[i] = le2[i - 1] + l2[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v2 = le2[cd[i] - 1]++ << r_1;
        for (var m2 = v2 | (1 << r_1) - 1; v2 <= m2; ++v2) {
          co[rev[v2] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le2[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m2 = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m2)
      m2 = a[i];
  }
  return m2;
};
var bits = function(d, p2, m2) {
  var o = p2 / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p2 & 7) & m2;
};
var bits16 = function(d, p2) {
  var o = p2 / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p2 & 7);
};
var shft = function(p2) {
  return (p2 + 7) / 8 | 0;
};
var slc = function(v2, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v2.length)
    e = v2.length;
  return new u8(v2.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l3) {
    var bl = buf.length;
    if (l3 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l3));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l2 = dat[s - 4] | dat[s - 3] << 8, t = s + l2;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l2);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l2, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c2 = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c2 = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c2;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c2 = lm[bits16(dat, pos) & lms], sym = c2 >> 4;
      pos += c2 & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c2)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b2 = fleb[i];
          add = bits(dat, pos, (1 << b2) - 1) + fl[i];
          pos += b2;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b2 = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b2) - 1, pos += b2;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p2, v2) {
  v2 <<= p2 & 7;
  var o = p2 / 8 | 0;
  d[o] |= v2;
  d[o + 1] |= v2 >> 8;
};
var wbits16 = function(d, p2, v2) {
  v2 <<= p2 & 7;
  var o = p2 / 8 | 0;
  d[o] |= v2;
  d[o + 1] |= v2 >> 8;
  d[o + 2] |= v2 >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v2 = new u8(t[0].s + 1);
    v2[t[0].s] = 1;
    return { t: v2, l: 1 };
  }
  t.sort(function(a, b2) {
    return a.f - b2.f;
  });
  t.push({ s: -1, f: 25001 });
  var l2 = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l2.f + r.f, l: l2, r };
  while (i1 != s - 1) {
    l2 = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l2.f + r.f, l: l2, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b2) {
      return tr[b2.s] - tr[a.s] || a.f - b2.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l2, d) {
  return n.s == -1 ? Math.max(ln(n.l, l2, d + 1), ln(n.r, l2, d + 1)) : l2[n.s] = d;
};
var lc = function(c2) {
  var s = c2.length;
  while (s && !c2[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c2[0], cls = 1;
  var w2 = function(v2) {
    cl[cli++] = v2;
  };
  for (var i = 1; i <= s; ++i) {
    if (c2[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w2(32754);
        if (cls > 2) {
          w2(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w2(cln), --cls;
        for (; cls > 6; cls -= 6)
          w2(8304);
        if (cls > 2)
          w2(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w2(cln);
      cls = 1;
      cln = c2[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l2 = 0;
  for (var i = 0; i < cl.length; ++i)
    l2 += cf[i] * cl[i];
  return l2;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p2) {
  wbits(out, p2++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e2 = hTree(lcfreq, 7), lct = _e2.t, mlcb = _e2.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p2, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p2, 1 + (dtlen < ftlen)), p2 += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p2, nlc - 257);
    wbits(out, p2 + 5, ndc - 1);
    wbits(out, p2 + 10, nlcc - 4);
    p2 += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p2 + 3 * i, lct[clim[i]]);
    p2 += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p2, llm[len]), p2 += lct[len];
        if (len > 15)
          wbits(out, p2, clct[i] >> 5 & 127), p2 += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p2, lm[len + 257]), p2 += ll[len + 257];
      if (len > 7)
        wbits(out, p2, sym >> 23 & 31), p2 += fleb[len];
      var dst = sym & 31;
      wbits16(out, p2, dm[dst]), p2 += dl[dst];
      if (dst > 3)
        wbits16(out, p2, sym >> 5 & 8191), p2 += fdeb[dst];
    } else {
      wbits16(out, p2, lm[sym]), p2 += ll[sym];
    }
  }
  wbits16(out, p2, lm[256]);
  return p2 + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w2 = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w2[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c2 = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w2, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j2 = 0; j2 < 286; ++j2)
            lf[j2] = 0;
          for (var j2 = 0; j2 < 30; ++j2)
            df[j2] = 0;
        }
        var l2 = 2, d = 0, ch_1 = c2, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l2] == dat[i + l2 - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l2) {
                l2 = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j2 = 0; j2 < mmd; ++j2) {
                  var ti = i - dif + j2 & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l2] << 18 | revfd[d];
          var lin = revfl[l2] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l2;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w2, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w2[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w2[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w2, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i = 0; i < 256; ++i) {
    var c2 = i, k2 = 9;
    while (--k2)
      c2 = (c2 & 1 && -306674912) ^ c2 >>> 1;
    t[i] = c2;
  }
  return t;
})();
var crc = function() {
  var c2 = -1;
  return {
    p: function(d) {
      var cr = c2;
      for (var i = 0; i < d.length; ++i)
        cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
      c2 = cr;
    },
    d: function() {
      return ~c2;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b2) {
  var o = {};
  for (var k2 in a)
    o[k2] = a[k2];
  for (var k2 in b2)
    o[k2] = b2[k2];
  return o;
};
var wbytes = function(d, b2, v2) {
  for (; v2; ++b2)
    d[b2] = v2, v2 >>>= 8;
};
var gzh = function(c2, o) {
  var fn = o.filename;
  c2[0] = 31, c2[1] = 139, c2[2] = 8, c2[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c2[9] = 3;
  if (o.mtime != 0)
    wbytes(c2, 4, Math.floor(new Date(o.mtime || Date.now()) / 1e3));
  if (fn) {
    c2[3] = 8;
    for (var i = 0; i <= fn.length; ++i)
      c2[i + 10] = fn.charCodeAt(i);
  }
};
var gzs = function(d) {
  if (d[0] != 31 || d[1] != 139 || d[2] != 8)
    err(6, "invalid gzip data");
  var flg = d[3];
  var st = 10;
  if (flg & 4)
    st += (d[10] | d[11] << 8) + 2;
  for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
    ;
  return st + (flg & 2);
};
var gzl = function(d) {
  var l2 = d.length;
  return (d[l2 - 4] | d[l2 - 3] << 8 | d[l2 - 2] << 16 | d[l2 - 1] << 24) >>> 0;
};
var gzhl = function(o) {
  return 10 + (o.filename ? o.filename.length + 1 : 0);
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function gzipSync(data, opts) {
  if (!opts)
    opts = {};
  var c2 = crc(), l2 = data.length;
  c2.p(data);
  var d = dopt(data, opts, gzhl(opts), 8), s = d.length;
  return gzh(d, opts), wbytes(d, s - 8, c2.d()), wbytes(d, s - 4, l2), d;
}
function gunzipSync(data, opts) {
  var st = gzs(data);
  if (st + 8 > data.length)
    err(6, "invalid gzip data");
  return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
}
var fltn = function(d, p2, t, o) {
  for (var k2 in d) {
    var val = d[k2], n = p2 + k2, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (val instanceof u8)
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te2 = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i = 0; i < str.length; ++i)
      ar_1[i] = str.charCodeAt(i);
    return ar_1;
  }
  if (te2)
    return te2.encode(str);
  var l2 = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w2 = function(v2) {
    ar[ai++] = v2;
  };
  for (var i = 0; i < l2; ++i) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l2 - i << 1));
      n.set(ar);
      ar = n;
    }
    var c2 = str.charCodeAt(i);
    if (c2 < 128 || latin1)
      w2(c2);
    else if (c2 < 2048)
      w2(192 | c2 >> 6), w2(128 | c2 & 63);
    else if (c2 > 55295 && c2 < 57344)
      c2 = 65536 + (c2 & 1023 << 10) | str.charCodeAt(++i) & 1023, w2(240 | c2 >> 18), w2(128 | c2 >> 12 & 63), w2(128 | c2 >> 6 & 63), w2(128 | c2 & 63);
    else
      w2(224 | c2 >> 12), w2(128 | c2 >> 6 & 63), w2(128 | c2 & 63);
  }
  return slc(ar, 0, ai);
}
var exfl = function(ex) {
  var le2 = 0;
  if (ex) {
    for (var k2 in ex) {
      var l2 = ex[k2].length;
      if (l2 > 65535)
        err(9);
      le2 += l2 + 4;
    }
  }
  return le2;
};
var wzh = function(d, b2, f, fn, u, c2, ce2, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b2, ce2 != null ? 33639248 : 67324752), b2 += 4;
  if (ce2 != null)
    d[b2++] = 20, d[b2++] = f.os;
  d[b2] = 20, b2 += 2;
  d[b2++] = f.flag << 1 | (c2 < 0 && 8), d[b2++] = u && 8;
  d[b2++] = f.compression & 255, d[b2++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b2, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b2 += 4;
  if (c2 != -1) {
    wbytes(d, b2, f.crc);
    wbytes(d, b2 + 4, c2 < 0 ? -c2 - 2 : c2);
    wbytes(d, b2 + 8, f.size);
  }
  wbytes(d, b2 + 12, fl2);
  wbytes(d, b2 + 14, exl), b2 += 16;
  if (ce2 != null) {
    wbytes(d, b2, col);
    wbytes(d, b2 + 6, f.attrs);
    wbytes(d, b2 + 10, ce2), b2 += 14;
  }
  d.set(fn, b2);
  b2 += fl2;
  if (exl) {
    for (var k2 in ex) {
      var exf = ex[k2], l2 = exf.length;
      wbytes(d, b2, +k2);
      wbytes(d, b2 + 2, l2);
      d.set(exf, b2 + 4), b2 += 4 + l2;
    }
  }
  if (col)
    d.set(co, b2), b2 += col;
  return b2;
};
var wzf = function(o, b2, c2, d, e) {
  wbytes(o, b2, 101010256);
  wbytes(o, b2 + 8, c2);
  wbytes(o, b2 + 10, c2);
  wbytes(o, b2 + 12, d);
  wbytes(o, b2 + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p2 = _a2[1];
    var compression = p2.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p2.comment, m2 = com && strToU8(com), ms = m2 && m2.length;
    var exl = exfl(p2.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p2) : file, l2 = d.length;
    var c2 = crc();
    c2.p(file);
    files.push(mrg(p2, {
      size: file.length,
      crc: c2.d(),
      c: d,
      f,
      m: m2,
      u: s != fn.length || m2 && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l2;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l2;
  }
  var out = new u8(tot + 22), oe2 = o, cdl = tot - o;
  for (var i = 0; i < files.length; ++i) {
    var f = files[i];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe2);
  return out;
}

// src/archive.js
var ARCHIVE_MAGIC = "SARC1";
var ARCHIVE_VERSION = 1;
var ARCHIVE_MIME_TYPE = "application/vnd.animated-data-qr.sarc1";
var ARCHIVE_EXTENSION = ".sarc1";
var HEADER_SIZE = 40;
var FOOTER_SIZE = 37;
var HEADER_FLAGS = 0;
var DEFAULT_RAW_FALLBACK_THRESHOLD_BYTES = 1024;
var DEFAULT_MAX_FILE_COUNT = 4096;
var DEFAULT_MAX_INPUT_BYTES = 128 * 1024 * 1024;
var DEFAULT_MAX_FILE_BYTES = 64 * 1024 * 1024;
var ARCHIVE_PROFILES = Object.freeze({
  max: Object.freeze({
    compressionLevel: 6,
    maxBlockBytes: 8 * 1024 * 1024
  }),
  extreme: Object.freeze({
    compressionLevel: 9,
    maxBlockBytes: 16 * 1024 * 1024
  }),
  ultra: Object.freeze({
    compressionLevel: 9,
    maxBlockBytes: 32 * 1024 * 1024
  })
});
var TEXT_EXTENSIONS = /* @__PURE__ */ new Set([
  "c",
  "cc",
  "cpp",
  "cs",
  "css",
  "csv",
  "go",
  "h",
  "hpp",
  "html",
  "java",
  "js",
  "json",
  "jsx",
  "md",
  "mjs",
  "py",
  "rb",
  "rs",
  "sh",
  "sql",
  "svg",
  "toml",
  "ts",
  "tsx",
  "txt",
  "xml",
  "yaml",
  "yml"
]);
var textEncoder2 = new TextEncoder();
var textDecoder = new TextDecoder();
function assertCrypto() {
  var _a2;
  if (!((_a2 = globalThis.crypto) == null ? void 0 : _a2.subtle)) {
    throw new Error("Web Crypto is required for archive integrity checks");
  }
}
function writeFixedAscii(bytes, offset, value) {
  bytes.set(textEncoder2.encode(value), offset);
}
function readFixedAscii(bytes, offset, length) {
  return textDecoder.decode(bytes.subarray(offset, offset + length));
}
function setUint64(view, offset, value) {
  view.setBigUint64(offset, BigInt(value), true);
}
function getUint64(view, offset) {
  const value = Number(view.getBigUint64(offset, true));
  if (!Number.isSafeInteger(value)) {
    throw new Error("Archive value exceeds supported range");
  }
  return value;
}
function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex) {
  if (typeof hex !== "string" || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error("Invalid hex input");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}
async function sha256Hex(bytes) {
  assertCrypto();
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}
function sanitizeNameSegment(segment, { allowSpaces = true } = {}) {
  if (typeof segment !== "string") {
    throw new Error("Path segment must be a string");
  }
  const trimmed = segment.trim();
  if (!trimmed) {
    throw new Error("Path segment cannot be empty");
  }
  if (trimmed === "." || trimmed === "..") {
    throw new Error("Relative traversal segments are not allowed");
  }
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new Error("Control characters are not allowed in file paths");
  }
  if (/[\\/]/.test(trimmed)) {
    throw new Error("Path segments cannot contain slashes");
  }
  if (/[:*?"<>|]/.test(trimmed)) {
    throw new Error("Unsafe path characters are not allowed");
  }
  if (!allowSpaces && /\s/.test(trimmed)) {
    throw new Error("Whitespace is not allowed in this path segment");
  }
  return trimmed;
}
function safeFileStem(name, fallback = "transfer-folder") {
  if (typeof name !== "string" || !name.trim()) {
    return fallback;
  }
  const normalized = name.replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "-").trim().replace(/\s+/g, " ");
  return normalized || fallback;
}
function sanitizeRelativePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    throw new Error("A non-empty relative path is required");
  }
  if (/^[a-zA-Z]:/.test(path) || path.startsWith("/") || path.startsWith("\\")) {
    throw new Error("Absolute paths are not allowed");
  }
  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean).map((segment) => sanitizeNameSegment(segment));
  if (segments.length === 0) {
    throw new Error("Relative path must contain at least one segment");
  }
  return segments.join("/");
}
function getInputPath(input, index) {
  const rawPath = typeof input.webkitRelativePath === "string" && input.webkitRelativePath ? input.webkitRelativePath : typeof input.name === "string" && input.name ? input.name : `file-${index + 1}.bin`;
  return sanitizeRelativePath(rawPath);
}
function getCommonRoot(paths) {
  if (!Array.isArray(paths) || paths.length === 0) {
    return null;
  }
  const splitPaths = paths.map((path) => path.split("/"));
  if (splitPaths.some((segments) => segments.length < 2)) {
    return null;
  }
  const firstSegment = splitPaths[0][0];
  if (!splitPaths.every((segments) => segments[0] === firstSegment)) {
    return null;
  }
  return sanitizeNameSegment(firstSegment);
}
function classifyGroupKind(entry) {
  const path = entry.path.toLowerCase();
  const extension = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1) : "";
  if (extension === "pdf") {
    return "pdf";
  }
  if (extension === "zip") {
    return "zip";
  }
  if (TEXT_EXTENSIONS.has(extension)) {
    if (["js", "jsx", "ts", "tsx", "css", "html"].includes(extension)) {
      return "web-code";
    }
    if (["json", "yaml", "yml", "xml", "toml", "csv"].includes(extension)) {
      return "structured-text";
    }
    return "text-code";
  }
  if (typeof entry.mimeType === "string" && entry.mimeType.startsWith("text/")) {
    return "text-code";
  }
  return "binary";
}
function sortEntries(entries) {
  entries.sort((left, right) => {
    const leftExtension = left.path.includes(".") ? left.path.slice(left.path.lastIndexOf(".") + 1) : "";
    const rightExtension = right.path.includes(".") ? right.path.slice(right.path.lastIndexOf(".") + 1) : "";
    return leftExtension.localeCompare(rightExtension) || left.path.localeCompare(right.path) || left.size - right.size;
  });
}
function planBlocks(entries, maxBlockBytes) {
  var _a2;
  const groups = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const list = (_a2 = groups.get(entry.groupKind)) != null ? _a2 : [];
    list.push(entry);
    groups.set(entry.groupKind, list);
  }
  const planned = [];
  let blockId = 0;
  for (const [groupKind, groupEntries] of groups.entries()) {
    sortEntries(groupEntries);
    let currentEntries = [];
    let currentSize = 0;
    for (const entry of groupEntries) {
      if (currentEntries.length > 0 && currentSize + entry.size > maxBlockBytes) {
        planned.push({
          blockId,
          groupKind,
          entries: currentEntries,
          uncompressedSize: currentSize
        });
        blockId += 1;
        currentEntries = [];
        currentSize = 0;
      }
      currentEntries.push(entry);
      currentSize += entry.size;
    }
    if (currentEntries.length > 0) {
      planned.push({
        blockId,
        groupKind,
        entries: currentEntries,
        uncompressedSize: currentSize
      });
      blockId += 1;
    }
  }
  return planned;
}
function createHeader({ blockCount, manifestOffset, manifestLength, totalInputBytes, fileCount }) {
  const bytes = new Uint8Array(HEADER_SIZE);
  const view = new DataView(bytes.buffer);
  writeFixedAscii(bytes, 0, ARCHIVE_MAGIC);
  view.setUint8(5, ARCHIVE_VERSION);
  view.setUint16(6, HEADER_FLAGS, true);
  view.setUint32(8, blockCount, true);
  setUint64(view, 12, manifestOffset);
  setUint64(view, 20, manifestLength);
  setUint64(view, 28, totalInputBytes);
  view.setUint32(36, fileCount, true);
  return bytes;
}
function parseHeader(bytes) {
  if (bytes.length < HEADER_SIZE) {
    throw new Error("Archive is too small to contain a valid header");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = readFixedAscii(bytes, 0, 5);
  if (magic !== ARCHIVE_MAGIC) {
    throw new Error("Archive magic mismatch");
  }
  const version = view.getUint8(5);
  if (version !== ARCHIVE_VERSION) {
    throw new Error(`Unsupported archive version: ${version}`);
  }
  return {
    blockCount: view.getUint32(8, true),
    manifestOffset: getUint64(view, 12),
    manifestLength: getUint64(view, 20),
    totalInputBytes: getUint64(view, 28),
    fileCount: view.getUint32(36, true)
  };
}
function createFooter(manifestSha256Bytes) {
  const footer = new Uint8Array(FOOTER_SIZE);
  footer.set(manifestSha256Bytes, 0);
  writeFixedAscii(footer, 32, ARCHIVE_MAGIC);
  return footer;
}
function parseFooter(bytes) {
  if (bytes.length < FOOTER_SIZE) {
    throw new Error("Archive is too small to contain a valid footer");
  }
  const footer = bytes.subarray(bytes.length - FOOTER_SIZE);
  if (readFixedAscii(footer, 32, 5) !== ARCHIVE_MAGIC) {
    throw new Error("Archive footer magic mismatch");
  }
  return {
    manifestSha256: bytesToHex(footer.subarray(0, 32))
  };
}
function createLazyBlobAccessor(bytes, mimeType) {
  let blob = null;
  return {
    enumerable: true,
    get() {
      blob || (blob = new Blob([bytes], { type: mimeType }));
      return blob;
    }
  };
}
function buildZipTree(extractedArchive) {
  var _a2;
  const tree = {};
  for (const file of extractedArchive.files) {
    const segments = [extractedArchive.rootName, ...file.path.split("/")];
    let cursor = tree;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = sanitizeNameSegment(segments[index]);
      if (index === segments.length - 1) {
        cursor[segment] = new Uint8Array(file.bytes);
        continue;
      }
      cursor[segment] = (_a2 = cursor[segment]) != null ? _a2 : {};
      cursor = cursor[segment];
    }
  }
  return tree;
}
async function createStoredArchiveBlock(block, options) {
  var _a2, _b2;
  const chunks = [];
  const manifestFiles = [];
  let offsetInBlock = 0;
  let processedBytes = 0;
  for (const entry of block.entries) {
    const bytes = new Uint8Array(await entry.input.arrayBuffer());
    const fileHash = await sha256Hex(bytes);
    chunks.push(bytes);
    manifestFiles.push({
      path: entry.path,
      size: entry.size,
      mtime: entry.mtime,
      mimeType: entry.mimeType,
      groupKind: entry.groupKind,
      blockId: block.blockId,
      offsetInBlock,
      sha256: fileHash
    });
    offsetInBlock += bytes.length;
    processedBytes += bytes.length;
    (_a2 = options.onProgress) == null ? void 0 : _a2.call(options, {
      phase: "scan",
      processedBytes: options.progressBaseBytes + processedBytes,
      totalBytes: options.totalInputBytes,
      currentFile: entry.path,
      currentBlockId: block.blockId
    });
  }
  const rawBytes = concatChunks(chunks, block.uncompressedSize);
  (_b2 = options.onProgress) == null ? void 0 : _b2.call(options, {
    phase: "compress",
    processedBytes: options.progressBaseBytes + processedBytes,
    totalBytes: options.totalInputBytes,
    currentBlockId: block.blockId
  });
  const compressedBytes = gzipSync(rawBytes, {
    level: options.compressionLevel,
    mtime: 0
  });
  const useRaw = compressedBytes.length >= rawBytes.length - options.rawFallbackThresholdBytes;
  const codec = useRaw ? "raw" : "gzip";
  const storedBytes = useRaw ? rawBytes : compressedBytes;
  const storedHash = await sha256Hex(storedBytes);
  return {
    blockId: block.blockId,
    groupKind: block.groupKind,
    codec,
    storedBytes,
    manifestFiles,
    manifestBlock: {
      blockId: block.blockId,
      codec,
      groupKind: block.groupKind,
      compressedOffset: 0,
      compressedSize: storedBytes.length,
      uncompressedSize: rawBytes.length,
      fileCount: manifestFiles.length,
      sha256: storedHash
    }
  };
}
function normalizeArchiveInputs(inputs, options) {
  const list = Array.from(inputs != null ? inputs : []);
  if (list.length === 0) {
    throw new Error("At least one file is required to create a folder archive");
  }
  if (list.length > options.maxFileCount) {
    throw new Error(`Too many files selected. Limit: ${options.maxFileCount}`);
  }
  let totalInputBytes = 0;
  const originalPaths = [];
  const normalized = list.map((input, index) => {
    if (!input || typeof input.arrayBuffer !== "function") {
      throw new TypeError("Archive inputs must provide arrayBuffer()");
    }
    const size = Number.isFinite(input.size) ? input.size : 0;
    if (size < 0 || !Number.isSafeInteger(size)) {
      throw new Error("Each archive input must expose a safe integer size");
    }
    if (size > options.maxFileBytes) {
      throw new Error(`File exceeds the per-file limit: ${input.name || `file-${index + 1}`}`);
    }
    totalInputBytes += size;
    if (totalInputBytes > options.maxInputBytes) {
      throw new Error(`Folder input exceeds the maximum supported size of ${options.maxInputBytes} bytes`);
    }
    const originalPath = getInputPath(input, index);
    originalPaths.push(originalPath);
    return {
      input,
      originalPath,
      size,
      mtime: Number.isFinite(input.lastModified) ? input.lastModified : 0,
      mimeType: typeof input.type === "string" && input.type ? input.type : "application/octet-stream"
    };
  });
  const commonRoot = options.rootName ? sanitizeNameSegment(options.rootName) : getCommonRoot(originalPaths);
  const rootName = commonRoot != null ? commonRoot : safeFileStem(options.rootName || "transfer-folder");
  const seenPaths = /* @__PURE__ */ new Set();
  const entries = normalized.map((entry) => {
    const relativePath = commonRoot && entry.originalPath.startsWith(`${commonRoot}/`) ? entry.originalPath.slice(commonRoot.length + 1) : entry.originalPath;
    const path = sanitizeRelativePath(relativePath);
    if (seenPaths.has(path)) {
      throw new Error(`Duplicate relative path detected: ${path}`);
    }
    seenPaths.add(path);
    const archiveEntry = {
      input: entry.input,
      path,
      size: entry.size,
      mtime: entry.mtime,
      mimeType: entry.mimeType
    };
    archiveEntry.groupKind = classifyGroupKind(archiveEntry);
    return archiveEntry;
  });
  return {
    rootName,
    totalInputBytes,
    entries
  };
}
function resolveArchiveOptions(options = {}) {
  var _a2, _b2, _c, _d, _e2, _f, _g;
  const profileName = (_a2 = options.profile) != null ? _a2 : "extreme";
  const profile = ARCHIVE_PROFILES[profileName];
  if (!profile) {
    throw new Error(`Unsupported archive profile: ${profileName}`);
  }
  return {
    profile: profileName,
    compressionLevel: (_b2 = options.compressionLevel) != null ? _b2 : profile.compressionLevel,
    maxBlockBytes: (_c = options.maxBlockBytes) != null ? _c : profile.maxBlockBytes,
    rawFallbackThresholdBytes: (_d = options.rawFallbackThresholdBytes) != null ? _d : DEFAULT_RAW_FALLBACK_THRESHOLD_BYTES,
    maxFileCount: (_e2 = options.maxFileCount) != null ? _e2 : DEFAULT_MAX_FILE_COUNT,
    maxInputBytes: (_f = options.maxInputBytes) != null ? _f : DEFAULT_MAX_INPUT_BYTES,
    maxFileBytes: (_g = options.maxFileBytes) != null ? _g : DEFAULT_MAX_FILE_BYTES,
    rootName: options.rootName,
    onProgress: typeof options.onProgress === "function" ? options.onProgress : null
  };
}
async function createArchive(inputs, options = {}) {
  var _a2;
  const resolvedOptions = resolveArchiveOptions(options);
  const normalized = normalizeArchiveInputs(inputs, resolvedOptions);
  const blocks = planBlocks(normalized.entries, resolvedOptions.maxBlockBytes);
  const manifestBlocks = [];
  const manifestFiles = [];
  const blockBytes = [];
  let processedBase = 0;
  for (const block of blocks) {
    const storedBlock = await createStoredArchiveBlock(block, {
      compressionLevel: resolvedOptions.compressionLevel,
      rawFallbackThresholdBytes: resolvedOptions.rawFallbackThresholdBytes,
      onProgress: resolvedOptions.onProgress,
      totalInputBytes: normalized.totalInputBytes,
      progressBaseBytes: processedBase
    });
    processedBase += block.uncompressedSize;
    blockBytes.push(storedBlock.storedBytes);
    manifestBlocks.push(storedBlock.manifestBlock);
    manifestFiles.push(...storedBlock.manifestFiles);
  }
  let compressedOffset = HEADER_SIZE;
  for (const manifestBlock of manifestBlocks) {
    manifestBlock.compressedOffset = compressedOffset;
    compressedOffset += manifestBlock.compressedSize;
  }
  const manifest = {
    format: ARCHIVE_MAGIC,
    version: ARCHIVE_VERSION,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    rootName: normalized.rootName,
    settings: {
      profile: resolvedOptions.profile,
      codec: "gzip",
      solid: true,
      compressionLevel: resolvedOptions.compressionLevel,
      maxBlockBytes: resolvedOptions.maxBlockBytes,
      rawFallbackThresholdBytes: resolvedOptions.rawFallbackThresholdBytes
    },
    blocks: manifestBlocks,
    files: manifestFiles
  };
  const manifestBytes = textEncoder2.encode(JSON.stringify(manifest));
  const manifestSha256 = await sha256Hex(manifestBytes);
  const footerBytes = createFooter(hexToBytes(manifestSha256));
  const headerBytes = createHeader({
    blockCount: manifestBlocks.length,
    manifestOffset: HEADER_SIZE + blockBytes.reduce((sum, bytes) => sum + bytes.length, 0),
    manifestLength: manifestBytes.length,
    totalInputBytes: normalized.totalInputBytes,
    fileCount: manifestFiles.length
  });
  (_a2 = resolvedOptions.onProgress) == null ? void 0 : _a2.call(resolvedOptions, {
    phase: "finalize",
    processedBytes: normalized.totalInputBytes,
    totalBytes: normalized.totalInputBytes,
    currentBlockId: manifestBlocks.length > 0 ? manifestBlocks.length - 1 : 0
  });
  const blob = new Blob([headerBytes, ...blockBytes, manifestBytes, footerBytes], {
    type: ARCHIVE_MIME_TYPE
  });
  const fileName = `${safeFileStem(normalized.rootName)}${ARCHIVE_EXTENSION}`;
  return {
    blob,
    fileName,
    manifestPreview: {
      format: ARCHIVE_MAGIC,
      version: ARCHIVE_VERSION,
      rootName: normalized.rootName,
      fileCount: manifestFiles.length,
      totalInputBytes: normalized.totalInputBytes,
      archiveSize: blob.size,
      blockCount: manifestBlocks.length
    }
  };
}
function validateManifest(manifest, header) {
  if (!manifest || manifest.format !== ARCHIVE_MAGIC || manifest.version !== ARCHIVE_VERSION) {
    throw new Error("Archive manifest is invalid");
  }
  if (!Array.isArray(manifest.blocks) || !Array.isArray(manifest.files)) {
    throw new Error("Archive manifest is missing blocks or files");
  }
  if (manifest.blocks.length !== header.blockCount) {
    throw new Error("Archive block count does not match the header");
  }
  if (manifest.files.length !== header.fileCount) {
    throw new Error("Archive file count does not match the header");
  }
}
async function extractArchive(archive, options = {}) {
  const resolvedOptions = resolveArchiveOptions({
    ...options,
    rootName: void 0
  });
  if (!Number.isFinite(archive.size) || archive.size < HEADER_SIZE + FOOTER_SIZE) {
    throw new Error("Archive is too small");
  }
  const header = parseHeader(new Uint8Array(await archive.slice(0, HEADER_SIZE).arrayBuffer()));
  const footer = parseFooter(new Uint8Array(
    await archive.slice(archive.size - FOOTER_SIZE, archive.size).arrayBuffer()
  ));
  if (header.manifestOffset < HEADER_SIZE || header.manifestOffset + header.manifestLength > archive.size - FOOTER_SIZE) {
    throw new Error("Archive manifest offsets are invalid");
  }
  const manifestBytes = new Uint8Array(await archive.slice(
    header.manifestOffset,
    header.manifestOffset + header.manifestLength
  ).arrayBuffer());
  const manifestSha256 = await sha256Hex(manifestBytes);
  if (manifestSha256 !== footer.manifestSha256) {
    throw new Error("Archive manifest integrity check failed");
  }
  const manifest = JSON.parse(textDecoder.decode(manifestBytes));
  validateManifest(manifest, header);
  const rootName = sanitizeNameSegment(manifest.rootName || "transfer-folder");
  if (manifest.files.length > resolvedOptions.maxFileCount) {
    throw new Error(`Archive exceeds the supported file count limit of ${resolvedOptions.maxFileCount}`);
  }
  const blocksById = /* @__PURE__ */ new Map();
  for (const block of manifest.blocks) {
    if (!Number.isInteger(block.blockId) || block.blockId < 0) {
      throw new Error("Archive block id is invalid");
    }
    if (blocksById.has(block.blockId)) {
      throw new Error(`Duplicate block id detected: ${block.blockId}`);
    }
    if (!Number.isInteger(block.compressedOffset) || !Number.isInteger(block.compressedSize) || !Number.isInteger(block.uncompressedSize) || block.compressedOffset < HEADER_SIZE || block.compressedSize < 0 || block.uncompressedSize < 0 || block.compressedOffset + block.compressedSize > header.manifestOffset) {
      throw new Error("Archive block layout is invalid");
    }
    blocksById.set(block.blockId, block);
  }
  const extractedBlocks = /* @__PURE__ */ new Map();
  for (const block of manifest.blocks) {
    const storedBytes = new Uint8Array(await archive.slice(
      block.compressedOffset,
      block.compressedOffset + block.compressedSize
    ).arrayBuffer());
    const storedHash = await sha256Hex(storedBytes);
    if (storedHash !== block.sha256) {
      throw new Error(`Archive block checksum mismatch for block ${block.blockId}`);
    }
    let rawBytes;
    if (block.codec === "raw") {
      rawBytes = new Uint8Array(storedBytes);
    } else if (block.codec === "gzip") {
      rawBytes = gunzipSync(storedBytes);
    } else {
      throw new Error(`Unsupported archive codec: ${block.codec}`);
    }
    if (rawBytes.length !== block.uncompressedSize) {
      throw new Error(`Archive block size mismatch for block ${block.blockId}`);
    }
    extractedBlocks.set(block.blockId, rawBytes);
  }
  let extractedTotalBytes = 0;
  const seenPaths = /* @__PURE__ */ new Set();
  const files = [];
  for (const file of manifest.files) {
    const path = sanitizeRelativePath(file.path);
    if (seenPaths.has(path)) {
      throw new Error(`Archive contains duplicate file path: ${path}`);
    }
    seenPaths.add(path);
    const block = blocksById.get(file.blockId);
    if (!block) {
      throw new Error(`Archive references missing block ${file.blockId}`);
    }
    if (!Number.isInteger(file.offsetInBlock) || !Number.isInteger(file.size) || file.offsetInBlock < 0 || file.size < 0 || file.offsetInBlock + file.size > block.uncompressedSize) {
      throw new Error(`Archive file offset is invalid for ${path}`);
    }
    extractedTotalBytes += file.size;
    if (extractedTotalBytes > resolvedOptions.maxInputBytes) {
      throw new Error(`Archive expands beyond the supported size limit of ${resolvedOptions.maxInputBytes} bytes`);
    }
    const rawBlock = extractedBlocks.get(file.blockId);
    const fileBytes = rawBlock.slice(file.offsetInBlock, file.offsetInBlock + file.size);
    const fileHash = await sha256Hex(fileBytes);
    if (fileHash !== file.sha256) {
      throw new Error(`Archive file checksum mismatch for ${path}`);
    }
    const fileRecord = {
      path,
      size: file.size,
      mtime: Number.isFinite(file.mtime) ? file.mtime : 0,
      mimeType: typeof file.mimeType === "string" && file.mimeType ? file.mimeType : "application/octet-stream",
      bytes: fileBytes
    };
    Object.defineProperty(
      fileRecord,
      "blob",
      createLazyBlobAccessor(
        fileBytes,
        typeof file.mimeType === "string" && file.mimeType ? file.mimeType : "application/octet-stream"
      )
    );
    files.push(fileRecord);
  }
  return {
    fileName: typeof archive.name === "string" && archive.name ? archive.name : `${rootName}${ARCHIVE_EXTENSION}`,
    rootName,
    fileCount: files.length,
    totalInputBytes: header.totalInputBytes,
    files,
    manifest
  };
}
async function createArchiveZipBlob(extractedArchive) {
  const zipBytes = zipSync(buildZipTree(extractedArchive), {
    level: 9
  });
  return {
    blob: new Blob([zipBytes], {
      type: "application/zip"
    }),
    fileName: `${safeFileStem(extractedArchive.rootName)}.zip`
  };
}
async function getUniqueChildDirectoryHandle(parentHandle, baseName) {
  const initialName = sanitizeNameSegment(baseName);
  let attempt = 0;
  while (attempt < 100) {
    const candidateName = attempt === 0 ? initialName : `${initialName}-${attempt + 1}`;
    try {
      await parentHandle.getDirectoryHandle(candidateName);
      attempt += 1;
    } catch (error) {
      if ((error == null ? void 0 : error.name) !== "NotFoundError") {
        throw error;
      }
      return parentHandle.getDirectoryHandle(candidateName, { create: true });
    }
  }
  throw new Error("Could not allocate a unique output folder");
}
async function saveExtractedArchiveToDirectory(extractedArchive, directoryHandle, options = {}) {
  if (!directoryHandle || directoryHandle.kind !== "directory") {
    throw new Error("A directory handle is required");
  }
  const outputRootHandle = await getUniqueChildDirectoryHandle(
    directoryHandle,
    safeFileStem(options.outputDirectoryName || extractedArchive.rootName)
  );
  for (const file of extractedArchive.files) {
    const segments = sanitizeRelativePath(file.path).split("/");
    let parentHandle = outputRootHandle;
    for (let index = 0; index < segments.length - 1; index += 1) {
      parentHandle = await parentHandle.getDirectoryHandle(segments[index], { create: true });
    }
    const fileHandle = await parentHandle.getFileHandle(segments[segments.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(file.bytes);
    } finally {
      await writable.close();
    }
  }
  return {
    directoryName: outputRootHandle.name,
    fileCount: extractedArchive.fileCount
  };
}
async function isArchiveBlob(blobLike) {
  if (!blobLike || typeof blobLike.slice !== "function" || typeof blobLike.arrayBuffer !== "function") {
    return false;
  }
  if (blobLike.type === ARCHIVE_MIME_TYPE) {
    return true;
  }
  const headerSlice = blobLike.slice(0, 5);
  const bytes = new Uint8Array(await headerSlice.arrayBuffer());
  return readFixedAscii(bytes, 0, 5) === ARCHIVE_MAGIC;
}

// src/library.js
var textEncoder3 = new TextEncoder();
function ensureDocument() {
  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    throw new Error("This API requires a browser-like DOM environment.");
  }
}
function isDomTarget(target) {
  return Boolean(target) && typeof target.appendChild === "function" && typeof target.removeChild === "function";
}
function assertTarget(target, label = "target") {
  if (!isDomTarget(target)) {
    throw new TypeError(`${label} must be a DOM element container.`);
  }
}
function createAbortLikeError(message) {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}
function safeMimeType(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
function safeFileName(value, fallback) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
function createNamedBlobLike(blob, fileName, mimeType) {
  const resolvedType = safeMimeType(mimeType, (blob == null ? void 0 : blob.type) || "application/octet-stream");
  const resolvedName = safeFileName(fileName, (blob == null ? void 0 : blob.name) || "transfer.bin");
  if (typeof File !== "undefined") {
    return new File([blob], resolvedName, {
      type: resolvedType
    });
  }
  return {
    name: resolvedName,
    type: resolvedType,
    async arrayBuffer() {
      return blob.arrayBuffer();
    }
  };
}
function createPreparedSummary(prepared, inputKind, extras = {}) {
  return {
    inputKind,
    sessionId: prepared.sessionId,
    fileName: prepared.fileName,
    mimeType: prepared.mimeType,
    size: prepared.fileSize,
    totalChunks: prepared.totalChunks,
    totalFrames: prepared.displayFrames.length,
    symbolsPerFrame: prepared.symbolsPerFrame,
    parityBlockDataChunks: prepared.parityBlockDataChunks,
    estimatedStats: prepared.estimatedStats,
    ...extras
  };
}
function clearCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== "function") {
    return;
  }
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
}
function createManagedCanvas(target) {
  ensureDocument();
  const canvas = document.createElement("canvas");
  canvas.className = "animated-data-qr-canvas";
  canvas.style.width = "100%";
  canvas.style.display = "block";
  target.appendChild(canvas);
  return canvas;
}
function createManagedVideo(target) {
  ensureDocument();
  const video = document.createElement("video");
  video.className = "animated-data-qr-video";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.style.width = "100%";
  video.style.display = "block";
  target.appendChild(video);
  return video;
}
function createManagedScanCanvas() {
  ensureDocument();
  return document.createElement("canvas");
}
function normalizeTransferInputFromBytes(bytes, options = {}) {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("bytes must be a Uint8Array.");
  }
  const mimeType = safeMimeType(options.mimeType, "application/octet-stream");
  const fileName = safeFileName(options.fileName, "transfer.bin");
  return createNamedBlobLike(new Blob([bytes], { type: mimeType }), fileName, mimeType);
}
function normalizeTransferInputFromText(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string.");
  }
  const mimeType = safeMimeType(options.mimeType, "text/plain;charset=utf-8");
  const fileName = safeFileName(options.fileName, "message.txt");
  return createNamedBlobLike(new Blob([textEncoder3.encode(text)], { type: mimeType }), fileName, mimeType);
}
function normalizeTransferInputFromBlob(blob, options = {}) {
  if (!blob || typeof blob.arrayBuffer !== "function") {
    throw new TypeError("blob must be a Blob, File, or blob-like object.");
  }
  const mimeType = safeMimeType(options.mimeType, blob.type || "application/octet-stream");
  const fileName = safeFileName(options.fileName, blob.name || "transfer.bin");
  return createNamedBlobLike(blob, fileName, mimeType);
}
function createSenderState(target, canvas) {
  return {
    status: "idle",
    target,
    elements: {
      canvas
    },
    prepared: null,
    inputKind: null,
    running: false
  };
}
function createReceiverState(target, video, scanCanvas) {
  return {
    status: "idle",
    target,
    elements: {
      video,
      scanCanvas
    },
    manifest: null,
    progress: null,
    diagnostics: null,
    result: null,
    error: null,
    scanning: false,
    decoderMode: null,
    camera: null
  };
}
function createQrSender(target, options = {}) {
  assertTarget(target);
  const canvas = createManagedCanvas(target);
  const sender = new AnimatedQrSender({
    ...options,
    canvas
  });
  const state = createSenderState(target, canvas);
  let destroyed = false;
  function assertActive() {
    if (destroyed) {
      throw new Error("This sender controller has been destroyed.");
    }
  }
  async function prepareInput(inputKind, blobLike, transferOptions = {}, extraSummary = {}) {
    assertActive();
    const prepared = await sender.prepare(blobLike, { ...options, ...transferOptions });
    state.status = "prepared";
    state.inputKind = inputKind;
    state.prepared = createPreparedSummary(prepared, inputKind, extraSummary);
    state.running = false;
    await sender.renderFrameAt(0);
    return state.prepared;
  }
  return {
    async loadText(text, loadOptions = {}) {
      const blobLike = normalizeTransferInputFromText(text, loadOptions);
      return prepareInput("text", blobLike, loadOptions);
    },
    async loadBytes(bytes, loadOptions = {}) {
      const blobLike = normalizeTransferInputFromBytes(bytes, loadOptions);
      return prepareInput("bytes", blobLike, loadOptions);
    },
    async loadBlob(blob, loadOptions = {}) {
      const blobLike = normalizeTransferInputFromBlob(blob, loadOptions);
      return prepareInput("blob", blobLike, loadOptions);
    },
    async loadFolder(inputs, loadOptions = {}) {
      assertActive();
      if (!inputs || typeof inputs.length !== "number") {
        throw new TypeError("inputs must be an ArrayLike<File>.");
      }
      const archive = await createArchive(inputs, loadOptions);
      const blobLike = createNamedBlobLike(archive.blob, archive.fileName, archive.blob.type);
      return prepareInput("folder", blobLike, loadOptions, {
        archive: archive.manifestPreview
      });
    },
    async start() {
      assertActive();
      if (!state.prepared) {
        throw new Error("No transfer is prepared. Call a load*() method first.");
      }
      await sender.start();
      state.status = "running";
      state.running = true;
    },
    stop() {
      assertActive();
      sender.stop();
      state.running = false;
      state.status = state.prepared ? "prepared" : "idle";
    },
    clear() {
      assertActive();
      sender.stop();
      sender.prepared = null;
      sender.frameIndex = 0;
      sender.loopIndex = 0;
      state.status = "idle";
      state.prepared = null;
      state.inputKind = null;
      state.running = false;
      clearCanvas(canvas);
    },
    destroy() {
      if (destroyed) {
        return;
      }
      this.clear();
      if (canvas.parentNode === target) {
        target.removeChild(canvas);
      }
      state.status = "destroyed";
      destroyed = true;
    },
    getState() {
      return {
        ...state,
        elements: { ...state.elements },
        prepared: state.prepared ? { ...state.prepared } : null
      };
    }
  };
}
function createQrReceiver(target, options = {}) {
  assertTarget(target);
  const video = createManagedVideo(target);
  const scanCanvas = createManagedScanCanvas();
  const receiver = new AnimatedQrReceiver({
    ...options,
    video,
    scanCanvas
  });
  const state = createReceiverState(target, video, scanCanvas);
  let destroyed = false;
  let activePromise = null;
  let activeResolve = null;
  let activeReject = null;
  function assertActive() {
    if (destroyed) {
      throw new Error("This receiver controller has been destroyed.");
    }
  }
  function settlePending(error, result) {
    if (!activePromise) {
      return;
    }
    const resolve = activeResolve;
    const reject = activeReject;
    activePromise = null;
    activeResolve = null;
    activeReject = null;
    if (error) {
      reject == null ? void 0 : reject(error);
      return;
    }
    resolve == null ? void 0 : resolve(result);
  }
  async function resolveReceiveResult(result) {
    if (await isArchiveBlob(result.blob)) {
      const extracted = await extractArchive(result.blob);
      return {
        kind: "folder",
        sessionId: result.sessionId,
        archiveBlob: result.blob,
        archiveFileName: result.fileName,
        extracted,
        totalChunks: result.totalChunks,
        receivedChunks: result.receivedChunks
      };
    }
    return {
      kind: "file",
      sessionId: result.sessionId,
      blob: result.blob,
      fileName: result.fileName,
      mimeType: result.mimeType,
      size: result.size,
      totalChunks: result.totalChunks,
      receivedChunks: result.receivedChunks
    };
  }
  receiver.on("manifest", (payload) => {
    var _a2;
    state.manifest = payload;
    (_a2 = options.onManifest) == null ? void 0 : _a2.call(options, payload);
  });
  receiver.on("progress", (payload) => {
    var _a2;
    state.progress = payload;
    (_a2 = options.onProgress) == null ? void 0 : _a2.call(options, payload);
  });
  receiver.on("diagnostics", (payload) => {
    var _a2;
    state.diagnostics = payload;
    (_a2 = options.onDiagnostics) == null ? void 0 : _a2.call(options, payload);
  });
  receiver.on("decoder-mode", (payload) => {
    state.decoderMode = payload;
  });
  receiver.on("camera-start", (payload) => {
    var _a2;
    state.camera = payload;
    (_a2 = options.onCameraStart) == null ? void 0 : _a2.call(options, payload);
  });
  receiver.on("camera-stop", (payload) => {
    var _a2;
    (_a2 = options.onCameraStop) == null ? void 0 : _a2.call(options, payload);
  });
  receiver.on("camera-tuned", (payload) => {
    state.camera = {
      ...state.camera || {},
      tuning: payload
    };
  });
  receiver.on("scan-start", () => {
    state.status = "scanning";
    state.scanning = true;
  });
  receiver.on("scan-stop", () => {
    if (state.status !== "completed" && state.status !== "error") {
      state.status = "stopped";
    }
    state.scanning = false;
  });
  receiver.on("error", ({ error }) => {
    var _a2;
    state.error = error;
    state.status = "error";
    state.scanning = false;
    (_a2 = options.onError) == null ? void 0 : _a2.call(options, error);
    settlePending(error instanceof Error ? error : new Error(String(error)));
  });
  receiver.on("complete", (payload) => {
    void (async () => {
      var _a2;
      try {
        const result = await resolveReceiveResult(payload);
        state.result = result;
        state.status = "completed";
        state.scanning = false;
        settlePending(null, result);
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        state.error = normalized;
        state.status = "error";
        state.scanning = false;
        (_a2 = options.onError) == null ? void 0 : _a2.call(options, normalized);
        settlePending(normalized);
      }
    })();
  });
  return {
    async start() {
      assertActive();
      if (activePromise) {
        return activePromise;
      }
      receiver.reset();
      state.status = "starting";
      state.manifest = null;
      state.progress = null;
      state.diagnostics = null;
      state.result = null;
      state.error = null;
      activePromise = new Promise((resolve, reject) => {
        activeResolve = resolve;
        activeReject = reject;
      });
      const pendingPromise = activePromise;
      try {
        await receiver.start();
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error(String(error));
        state.error = normalized;
        state.status = "error";
        settlePending(normalized);
      }
      return pendingPromise;
    },
    stop() {
      assertActive();
      receiver.stop();
      receiver.stopCamera();
      state.scanning = false;
      if (state.status !== "completed") {
        state.status = "stopped";
      }
      settlePending(createAbortLikeError("Receive stopped before completion."));
    },
    reset() {
      assertActive();
      receiver.stop();
      receiver.stopCamera();
      receiver.reset();
      state.status = "idle";
      state.manifest = null;
      state.progress = null;
      state.diagnostics = null;
      state.result = null;
      state.error = null;
      state.scanning = false;
      settlePending(createAbortLikeError("Receive reset before completion."));
    },
    destroy() {
      if (destroyed) {
        return;
      }
      this.reset();
      if (video.parentNode === target) {
        target.removeChild(video);
      }
      state.status = "destroyed";
      destroyed = true;
    },
    getState() {
      var _a2;
      return {
        ...state,
        elements: { ...state.elements },
        manifest: state.manifest ? { ...state.manifest } : null,
        progress: state.progress ? { ...state.progress } : null,
        diagnostics: state.diagnostics ? { ...state.diagnostics } : null,
        result: state.result ? { ...state.result } : null,
        camera: state.camera ? { ...state.camera } : null,
        error: (_a2 = state.error) != null ? _a2 : null
      };
    }
  };
}
export {
  createArchive,
  createArchiveZipBlob,
  createDownloadLink,
  createQrReceiver,
  createQrSender,
  estimateTransferStats,
  extractArchive,
  resolveTransferPreset,
  saveExtractedArchiveToDirectory
};
//# sourceMappingURL=animated-data-qr.esm.js.map

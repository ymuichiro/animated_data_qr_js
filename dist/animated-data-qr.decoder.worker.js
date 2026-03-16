/*! animated-data-qr-js v0.1.0 | MIT */
(() => {
  // src/decoder-assets.js
  var DECODER_WASM_FILE_NAME = "zxing_reader.wasm";
  function ensureTrailingSlash(value) {
    return value.endsWith("/") ? value : `${value}/`;
  }
  function getPageUrl() {
    var _a;
    if (typeof window !== "undefined" && typeof ((_a = window.location) == null ? void 0 : _a.href) === "string") {
      return window.location.href;
    }
    return "";
  }
  function getInjectedModuleUrl() {
    var _a;
    if (typeof __ADQ_MODULE_URL__ === "string" && __ADQ_MODULE_URL__) {
      return __ADQ_MODULE_URL__;
    }
    if (typeof document !== "undefined" && ((_a = document.currentScript) == null ? void 0 : _a.src)) {
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
  function resolveDecoderWasmUrl(assetBaseUrl) {
    if (!assetBaseUrl) {
      return "";
    }
    return new URL(DECODER_WASM_FILE_NAME, ensureTrailingSlash(assetBaseUrl)).href;
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
  function createImageDataFromBuffer(buffer, width, height) {
    return createImageDataLike(new Uint8ClampedArray(buffer), width, height);
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
    }, et = () => mr(""), sr = {}, $r = (r) => {
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
    }, te2 = [], _2 = (r) => {
      var e = te2[r];
      return e || (te2[r] = e = Te2.get(r)), e;
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
    }, ln = () => 2147483648, cn = (r, e) => Math.ceil(r / e) * e, vn = (r) => {
      var e = dr.buffer.byteLength, t = (r - e + 65535) / 65536 | 0;
      try {
        return dr.grow(t), zr(), 1;
      } catch {
      }
    }, dn = (r) => {
      var e = D2.length;
      r >>>= 0;
      var t = ln();
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
      ba: et,
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

  // src/utils/base64.js
  function hasBuffer() {
    return typeof Buffer !== "undefined" && typeof Buffer.from === "function";
  }
  function toBase64(base64UrlString) {
    const base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - base64.length % 4) % 4;
    return base64 + "=".repeat(padding);
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

  // src/protocol.js
  var PROTOCOL_MAGIC = "ADQR1";
  var FRAME_SEPARATOR = "|";
  var FRAME_SEPARATOR_CODE = FRAME_SEPARATOR.charCodeAt(0);
  var PROTOCOL_MAGIC_BYTES = asciiStringToBytes(PROTOCOL_MAGIC);
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
    var _a, _b;
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
      const parityBlockDataChunks = parts.length >= 9 ? (_a = parsePositiveInt(parts[8])) != null ? _a : 0 : 0;
      const symbolsPerFrame = parts.length >= 10 ? (_b = parsePositiveInt(parts[9])) != null ? _b : 1 : 1;
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
  function parseFrame(frameInput) {
    if (typeof frameInput === "string") {
      return parseTextFrame(frameInput);
    }
    return parseBinaryFrame(frameInput);
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
  function createReaderOptions(maxNumberOfSymbols, tryHarder) {
    return {
      formats: ["QRCode"],
      maxNumberOfSymbols: Math.max(1, maxNumberOfSymbols),
      tryHarder,
      tryRotate: true,
      tryInvert: false,
      tryDownscale: false,
      textMode: "Plain"
    };
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
    var _a, _b;
    if (pendingPasses.length <= 1 || detectedBounds.length === 0) {
      return (_a = pendingPasses.shift()) != null ? _a : null;
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
    return (_b = pendingPasses.splice(bestIndex, 1)[0]) != null ? _b : null;
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
        createReaderOptions(remainingSymbols, Boolean(pass.tryHarder))
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

  // src/decoder.worker.js
  function postDecoderError(id, error) {
    self.postMessage({
      id,
      type: "decoder-error",
      message: error instanceof Error ? error.message : String(error)
    });
  }
  self.onmessage = async (event) => {
    var _a, _b, _c, _d, _e2;
    const payload = (_a = event.data) != null ? _a : {};
    const assetBaseUrl = resolveDecoderAssetBaseUrl(
      (_b = payload.assetBaseUrl) != null ? _b : null,
      ((_c = self.location) == null ? void 0 : _c.href) || ""
    );
    const wasmUrl = payload.wasmUrl || resolveDecoderWasmUrl(assetBaseUrl);
    try {
      if (payload.type === "warmup") {
        await warmupZxingDecoder(wasmUrl);
        self.postMessage({
          id: payload.id,
          type: "warmup-ready"
        });
        return;
      }
      if (payload.type === "decode") {
        const imageData = createImageDataFromBuffer(payload.buffer, payload.width, payload.height);
        const frameInputs = await decodeImageDataWithZxing(imageData, {
          wasmUrl,
          passes: (_d = payload.passes) != null ? _d : [],
          expectedSymbolsPerFrame: (_e2 = payload.expectedSymbolsPerFrame) != null ? _e2 : 1
        });
        const frameBuffers = frameInputs.map((frameInput) => frameInput.buffer.slice(0));
        self.postMessage({
          id: payload.id,
          type: "decode-result",
          frames: frameBuffers
        }, frameBuffers);
      }
    } catch (error) {
      postDecoderError(payload.id, error);
    }
  };
})();
//# sourceMappingURL=animated-data-qr.decoder.worker.js.map

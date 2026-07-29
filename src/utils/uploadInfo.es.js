var _e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, sa = { exports: {} };
(function(e, r) {
  (function(n, o) {
    e.exports = o();
  })(_e, function() {
    var n = 1e3, o = 6e4, a = 36e5, i = "millisecond", f = "second", u = "minute", l = "hour", p = "day", $ = "week", y = "month", m = "quarter", O = "year", R = "date", v = "Invalid Date", _ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, x = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, U = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(D) {
      var E = ["th", "st", "nd", "rd"], S = D % 100;
      return "[" + D + (E[(S - 20) % 10] || E[S] || E[0]) + "]";
    } }, T = function(D, E, S) {
      var b = String(D);
      return !b || b.length >= E ? D : "" + Array(E + 1 - b.length).join(S) + D;
    }, P = { s: T, z: function(D) {
      var E = -D.utcOffset(), S = Math.abs(E), b = Math.floor(S / 60), C = S % 60;
      return (E <= 0 ? "+" : "-") + T(b, 2, "0") + ":" + T(C, 2, "0");
    }, m: function D(E, S) {
      if (E.date() < S.date())
        return -D(S, E);
      var b = 12 * (S.year() - E.year()) + (S.month() - E.month()), C = E.clone().add(b, y), F = S - C < 0, B = E.clone().add(b + (F ? -1 : 1), y);
      return +(-(b + (S - C) / (F ? C - B : B - C)) || 0);
    }, a: function(D) {
      return D < 0 ? Math.ceil(D) || 0 : Math.floor(D);
    }, p: function(D) {
      return { M: y, y: O, w: $, d: p, D: R, h: l, m: u, s: f, ms: i, Q: m }[D] || String(D || "").toLowerCase().replace(/s$/, "");
    }, u: function(D) {
      return D === void 0;
    } }, j = "en", W = {};
    W[j] = U;
    var K = "$isDayjsObject", Y = function(D) {
      return D instanceof le || !(!D || !D[K]);
    }, se = function D(E, S, b) {
      var C;
      if (!E)
        return j;
      if (typeof E == "string") {
        var F = E.toLowerCase();
        W[F] && (C = F), S && (W[F] = S, C = F);
        var B = E.split("-");
        if (!C && B.length > 1)
          return D(B[0]);
      } else {
        var c = E.name;
        W[c] = E, C = c;
      }
      return !b && C && (j = C), C || !b && j;
    }, X = function(D, E) {
      if (Y(D))
        return D.clone();
      var S = typeof E == "object" ? E : {};
      return S.date = D, S.args = arguments, new le(S);
    }, G = P;
    G.l = se, G.i = Y, G.w = function(D, E) {
      return X(D, { locale: E.$L, utc: E.$u, x: E.$x, $offset: E.$offset });
    };
    var le = function() {
      function D(S) {
        this.$L = se(S.locale, null, !0), this.parse(S), this.$x = this.$x || S.x || {}, this[K] = !0;
      }
      var E = D.prototype;
      return E.parse = function(S) {
        this.$d = function(b) {
          var C = b.date, F = b.utc;
          if (C === null)
            return /* @__PURE__ */ new Date(NaN);
          if (G.u(C))
            return /* @__PURE__ */ new Date();
          if (C instanceof Date)
            return new Date(C);
          if (typeof C == "string" && !/Z$/i.test(C)) {
            var B = C.match(_);
            if (B) {
              var c = B[2] - 1 || 0, g = (B[7] || "0").substring(0, 3);
              return F ? new Date(Date.UTC(B[1], c, B[3] || 1, B[4] || 0, B[5] || 0, B[6] || 0, g)) : new Date(B[1], c, B[3] || 1, B[4] || 0, B[5] || 0, B[6] || 0, g);
            }
          }
          return new Date(C);
        }(S), this.init();
      }, E.init = function() {
        var S = this.$d;
        this.$y = S.getFullYear(), this.$M = S.getMonth(), this.$D = S.getDate(), this.$W = S.getDay(), this.$H = S.getHours(), this.$m = S.getMinutes(), this.$s = S.getSeconds(), this.$ms = S.getMilliseconds();
      }, E.$utils = function() {
        return G;
      }, E.isValid = function() {
        return this.$d.toString() !== v;
      }, E.isSame = function(S, b) {
        var C = X(S);
        return this.startOf(b) <= C && C <= this.endOf(b);
      }, E.isAfter = function(S, b) {
        return X(S) < this.startOf(b);
      }, E.isBefore = function(S, b) {
        return this.endOf(b) < X(S);
      }, E.$g = function(S, b, C) {
        return G.u(S) ? this[b] : this.set(C, S);
      }, E.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, E.valueOf = function() {
        return this.$d.getTime();
      }, E.startOf = function(S, b) {
        var C = this, F = !!G.u(b) || b, B = G.p(S), c = function(H, J) {
          var fe = G.w(C.$u ? Date.UTC(C.$y, J, H) : new Date(C.$y, J, H), C);
          return F ? fe : fe.endOf(p);
        }, g = function(H, J) {
          return G.w(C.toDate()[H].apply(C.toDate("s"), (F ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(J)), C);
        }, A = this.$W, M = this.$M, N = this.$D, Z = "set" + (this.$u ? "UTC" : "");
        switch (B) {
          case O:
            return F ? c(1, 0) : c(31, 11);
          case y:
            return F ? c(1, M) : c(0, M + 1);
          case $:
            var q = this.$locale().weekStart || 0, Q = (A < q ? A + 7 : A) - q;
            return c(F ? N - Q : N + (6 - Q), M);
          case p:
          case R:
            return g(Z + "Hours", 0);
          case l:
            return g(Z + "Minutes", 1);
          case u:
            return g(Z + "Seconds", 2);
          case f:
            return g(Z + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, E.endOf = function(S) {
        return this.startOf(S, !1);
      }, E.$set = function(S, b) {
        var C, F = G.p(S), B = "set" + (this.$u ? "UTC" : ""), c = (C = {}, C[p] = B + "Date", C[R] = B + "Date", C[y] = B + "Month", C[O] = B + "FullYear", C[l] = B + "Hours", C[u] = B + "Minutes", C[f] = B + "Seconds", C[i] = B + "Milliseconds", C)[F], g = F === p ? this.$D + (b - this.$W) : b;
        if (F === y || F === O) {
          var A = this.clone().set(R, 1);
          A.$d[c](g), A.init(), this.$d = A.set(R, Math.min(this.$D, A.daysInMonth())).$d;
        } else
          c && this.$d[c](g);
        return this.init(), this;
      }, E.set = function(S, b) {
        return this.clone().$set(S, b);
      }, E.get = function(S) {
        return this[G.p(S)]();
      }, E.add = function(S, b) {
        var C, F = this;
        S = Number(S);
        var B = G.p(b), c = function(M) {
          var N = X(F);
          return G.w(N.date(N.date() + Math.round(M * S)), F);
        };
        if (B === y)
          return this.set(y, this.$M + S);
        if (B === O)
          return this.set(O, this.$y + S);
        if (B === p)
          return c(1);
        if (B === $)
          return c(7);
        var g = (C = {}, C[u] = o, C[l] = a, C[f] = n, C)[B] || 1, A = this.$d.getTime() + S * g;
        return G.w(A, this);
      }, E.subtract = function(S, b) {
        return this.add(-1 * S, b);
      }, E.format = function(S) {
        var b = this, C = this.$locale();
        if (!this.isValid())
          return C.invalidDate || v;
        var F = S || "YYYY-MM-DDTHH:mm:ssZ", B = G.z(this), c = this.$H, g = this.$m, A = this.$M, M = C.weekdays, N = C.months, Z = C.meridiem, q = function(J, fe, me, de) {
          return J && (J[fe] || J(b, F)) || me[fe].slice(0, de);
        }, Q = function(J) {
          return G.s(c % 12 || 12, J, "0");
        }, H = Z || function(J, fe, me) {
          var de = J < 12 ? "AM" : "PM";
          return me ? de.toLowerCase() : de;
        };
        return F.replace(x, function(J, fe) {
          return fe || function(me) {
            switch (me) {
              case "YY":
                return String(b.$y).slice(-2);
              case "YYYY":
                return G.s(b.$y, 4, "0");
              case "M":
                return A + 1;
              case "MM":
                return G.s(A + 1, 2, "0");
              case "MMM":
                return q(C.monthsShort, A, N, 3);
              case "MMMM":
                return q(N, A);
              case "D":
                return b.$D;
              case "DD":
                return G.s(b.$D, 2, "0");
              case "d":
                return String(b.$W);
              case "dd":
                return q(C.weekdaysMin, b.$W, M, 2);
              case "ddd":
                return q(C.weekdaysShort, b.$W, M, 3);
              case "dddd":
                return M[b.$W];
              case "H":
                return String(c);
              case "HH":
                return G.s(c, 2, "0");
              case "h":
                return Q(1);
              case "hh":
                return Q(2);
              case "a":
                return H(c, g, !0);
              case "A":
                return H(c, g, !1);
              case "m":
                return String(g);
              case "mm":
                return G.s(g, 2, "0");
              case "s":
                return String(b.$s);
              case "ss":
                return G.s(b.$s, 2, "0");
              case "SSS":
                return G.s(b.$ms, 3, "0");
              case "Z":
                return B;
            }
            return null;
          }(J) || B.replace(":", "");
        });
      }, E.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, E.diff = function(S, b, C) {
        var F, B = this, c = G.p(b), g = X(S), A = (g.utcOffset() - this.utcOffset()) * o, M = this - g, N = function() {
          return G.m(B, g);
        };
        switch (c) {
          case O:
            F = N() / 12;
            break;
          case y:
            F = N();
            break;
          case m:
            F = N() / 3;
            break;
          case $:
            F = (M - A) / 6048e5;
            break;
          case p:
            F = (M - A) / 864e5;
            break;
          case l:
            F = M / a;
            break;
          case u:
            F = M / o;
            break;
          case f:
            F = M / n;
            break;
          default:
            F = M;
        }
        return C ? F : G.a(F);
      }, E.daysInMonth = function() {
        return this.endOf(y).$D;
      }, E.$locale = function() {
        return W[this.$L];
      }, E.locale = function(S, b) {
        if (!S)
          return this.$L;
        var C = this.clone(), F = se(S, b, !0);
        return F && (C.$L = F), C;
      }, E.clone = function() {
        return G.w(this.$d, this);
      }, E.toDate = function() {
        return new Date(this.valueOf());
      }, E.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, E.toISOString = function() {
        return this.$d.toISOString();
      }, E.toString = function() {
        return this.$d.toUTCString();
      }, D;
    }(), ge = le.prototype;
    return X.prototype = ge, [["$ms", i], ["$s", f], ["$m", u], ["$H", l], ["$W", p], ["$M", y], ["$y", O], ["$D", R]].forEach(function(D) {
      ge[D[1]] = function(E) {
        return this.$g(E, D[0], D[1]);
      };
    }), X.extend = function(D, E) {
      return D.$i || (D(E, le, X), D.$i = !0), X;
    }, X.locale = se, X.isDayjs = Y, X.unix = function(D) {
      return X(1e3 * D);
    }, X.en = W[j], X.Ls = W, X.p = {}, X;
  });
})(sa);
var ua = { exports: {} };
/*! simple-query-string v1.3.2 - MIT license */
(function(e) {
  (function(r, n) {
    e.exports ? e.exports = n() : r.simpleQueryString = n();
  })(_e, function() {
    Array.isArray || (Array.isArray = function(a) {
      return Object.prototype.toString.call(a) === "[object Array]";
    });
    function r(a) {
      var i = Object.prototype.hasOwnProperty, f = [], u;
      for (u in a)
        i.call(a, u) && f.push(u);
      return f;
    }
    function n(a) {
      return a === void 0 ? null : a && decodeURIComponent(a);
    }
    function o(a) {
      switch (typeof a) {
        case "string":
          return encodeURIComponent(a);
        case "boolean":
          return a ? "true" : "false";
        case "number":
          return isFinite(a) ? a : "";
        case "object":
          return a == null ? "" : JSON && JSON.stringify ? encodeURIComponent(JSON.stringify(a)) : "";
        default:
          return "";
      }
    }
    return {
      version: "1.3.2",
      /**
       * parse a query string.
       * Can receive as parameter the full url or `url.split('?')[1]` or `location.search` or `location.hash`.
       *
       * @param {String} str - the string containing the query string to be parsed.
       * @param {String} [delimiter] - if undefined (no value) the default ampersand '&' will be the pairs separator.
       * Else you can provide an alternative separator, for instance the semicolon ';' in case of URLs embedded in HTML.
       * @param {String} [eq] - key/pair separator.
       * @returns {Object} parsed object (use as a dictionary)
       */
      parse: function(a, i, f) {
        var u;
        i = i || "&", f = f || "=";
        var l = /* @__PURE__ */ Object.create(null);
        if (typeof a != "string" || (u = a.indexOf("?"), u < 0 && a.indexOf(f) < 0))
          return l;
        u >= 0 && (a = a.substr(u + 1)), a = a.replace(/^[\s\uFEFF\xA0\?#&]+|[\s\uFEFF\xA0&]+$/g, ""), u = a.lastIndexOf("#"), u > 0 && (a = a.substr(0, u));
        var p = a.split(i);
        for (u = 0; u < p.length; ++u) {
          var $ = p[u].replace(/\+/g, " "), y = $.indexOf(f), m, O;
          if (!(y === 0 || $.length === 0)) {
            y < 0 ? (m = n($), O = null) : (m = n($.substr(0, y)), O = n($.substr(y + 1)));
            var R = l[m];
            R === void 0 ? l[m] = O : Array.isArray(R) ? R.push(O) : l[m] = [R, O];
          }
        }
        return l;
      },
      /**
       * creates a query string from an object/dictionary.
       *
       * @param {Object} obj - the object that will have its properties parsed into a key/value string.
       * @param {String} [delimiter] - if undefined (no value) the default ampersand '&' will be the pairs separator.
       * Else you can provide an alternative separator, for instance the semicolon ';' in case of URLs embedded in HTML.
       * @returns {String} query string
       */
      stringify: function(a, i, f) {
        if (i = i || "&", f = f || "=", typeof a != "object" && typeof a != "function" || a === null)
          return "";
        var u = r(a);
        if (!u || !u.length)
          return "";
        for (var l = [], p = 0, $, y, m; p < u.length; p++)
          if (y = o(u[p]), m = a[y], m !== void 0 && typeof m != "function")
            if (Array.isArray(m))
              for ($ = 0; $ < m.length; ++$)
                l.push(y + f + (m[$] ? o(m[$]) : ""));
            else
              m !== null && (m = o(m)), l.push(m == null ? y : y + f + m);
        return l.join(i);
      }
    };
  });
})(ua);
function ca() {
  const e = window.navigator.userAgent.toLowerCase(), r = /micromessenger/.test(e), n = /iphone|ipad|ipod|ios/.test(e);
  return r && n;
}
function fa(e, r, n) {
  return new Promise((o, a) => {
    const i = document.createElement(n || "video");
    i.preload = "auto", i.crossOrigin = "Anonymous", i.autoplay = !1, i.src = e, i.setAttribute("playsinline", ""), i.setAttribute("webkit-playsinline", ""), i.setAttribute("x5-video-player-type", "h5"), i.setAttribute("x5-video-player-fullscreen", "false");
    try {
      i.load();
    } catch (f) {
      console.warn("iOS微信中load()可能受限:", f);
    }
    if (r !== void 0 && (i.currentTime = r), ca())
      setTimeout(() => {
        o(i);
      }, 3e3);
    else {
      const f = () => {
        console.log("媒体加载成功"), l(), o(i);
      }, u = (p) => {
        console.error("媒体加载失败", e, p), l(), a(p);
      }, l = () => {
        i.removeEventListener("loadedmetadata", f), i.removeEventListener("canplay", f), i.removeEventListener("error", u);
      };
      i.addEventListener("loadedmetadata", f), i.addEventListener("canplay", f), i.addEventListener("error", u);
    }
  });
}
function la(e) {
  e = e.split("?")[0];
  const r = e.split(".");
  return r.length > 1 ? r.pop().toLowerCase() : null;
}
function da(e, r) {
  if (r || (r = la(e)), r)
    switch (r.toLocaleLowerCase()) {
      case "png":
      case "jpeg":
      case "jpg":
        return "image";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg";
      case "aac":
      case "wav":
      case "mp3":
        return "audio";
      case "mp4":
        return "video";
      default:
        return null;
    }
  else
    return null;
}
async function pa(e, r, n) {
  e = e.cloneNode(), e.muted = !0, e.currentTime = n || 1, await e.play(), e.pause();
  const o = document.createElement("canvas"), a = e.videoWidth, i = e.videoHeight, f = r / a;
  return o.width = r, o.height = Math.floor(i * f), o.getContext("2d").drawImage(e, 0, 0, o.width, o.height), o.toDataURL("image/jpeg");
}
let ha = (e = 21) => crypto.getRandomValues(new Uint8Array(e)).reduce((r, n) => (n &= 63, n < 36 ? r += n.toString(36) : n < 62 ? r += (n - 26).toString(36).toUpperCase() : n > 62 ? r += "-" : r += "_", r), "");
var va = typeof _e == "object" && _e && _e.Object === Object && _e, Ir = va, ga = Ir, ya = typeof self == "object" && self && self.Object === Object && self, ma = ga || ya || Function("return this")(), ve = ma, ba = ve, _a = ba.Symbol, tt = _a, pr = tt, Br = Object.prototype, wa = Br.hasOwnProperty, Sa = Br.toString, Fe = pr ? pr.toStringTag : void 0;
function $a(e) {
  var r = wa.call(e, Fe), n = e[Fe];
  try {
    e[Fe] = void 0;
    var o = !0;
  } catch {
  }
  var a = Sa.call(e);
  return o && (r ? e[Fe] = n : delete e[Fe]), a;
}
var Oa = $a, Ea = Object.prototype, Ca = Ea.toString;
function Ra(e) {
  return Ca.call(e);
}
var xa = Ra, hr = tt, ka = Oa, Ta = xa, Pa = "[object Null]", ja = "[object Undefined]", vr = hr ? hr.toStringTag : void 0;
function Aa(e) {
  return e == null ? e === void 0 ? ja : Pa : vr && vr in Object(e) ? ka(e) : Ta(e);
}
var xt = Aa;
function Da(e) {
  return e != null && typeof e == "object";
}
var Fr = Da, Ma = xt, Ia = Fr, Ba = "[object Arguments]";
function Fa(e) {
  return Ia(e) && Ma(e) == Ba;
}
var La = Fa, gr = La, Na = Fr, Lr = Object.prototype, Ua = Lr.hasOwnProperty, Wa = Lr.propertyIsEnumerable;
gr(function() {
  return arguments;
}());
var Ze = { exports: {} };
function za() {
  return !1;
}
var Va = za;
Ze.exports;
(function(e, r) {
  var n = ve, o = Va, a = r && !r.nodeType && r, i = a && !0 && e && !e.nodeType && e, f = i && i.exports === a, u = f ? n.Buffer : void 0, l = u ? u.isBuffer : void 0, p = l || o;
  e.exports = p;
})(Ze, Ze.exports);
Ze.exports;
var Qe = { exports: {} };
Qe.exports;
(function(e, r) {
  var n = Ir, o = r && !r.nodeType && r, a = o && !0 && e && !e.nodeType && e, i = a && a.exports === o, f = i && n.process, u = function() {
    try {
      var l = a && a.require && a.require("util").types;
      return l || f && f.binding && f.binding("util");
    } catch {
    }
  }();
  e.exports = u;
})(Qe, Qe.exports);
var Ha = Qe.exports, yr = Ha;
yr && yr.isTypedArray;
function Ya(e) {
  var r = typeof e;
  return e != null && (r == "object" || r == "function");
}
var Nr = Ya, Ga = xt, qa = Nr, Ka = "[object AsyncFunction]", Ja = "[object Function]", Xa = "[object GeneratorFunction]", Za = "[object Proxy]";
function Qa(e) {
  if (!qa(e))
    return !1;
  var r = Ga(e);
  return r == Ja || r == Xa || r == Ka || r == Za;
}
var eo = Qa, to = ve, ro = to["__core-js_shared__"], no = ro, wt = no, mr = function() {
  var e = /[^.]+$/.exec(wt && wt.keys && wt.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function ao(e) {
  return !!mr && mr in e;
}
var oo = ao, io = Function.prototype, so = io.toString;
function uo(e) {
  if (e != null) {
    try {
      return so.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var Ur = uo, co = eo, fo = oo, lo = Nr, po = Ur, ho = /[\\^$.*+?()[\]{}|]/g, vo = /^\[object .+?Constructor\]$/, go = Function.prototype, yo = Object.prototype, mo = go.toString, bo = yo.hasOwnProperty, _o = RegExp(
  "^" + mo.call(bo).replace(ho, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function wo(e) {
  if (!lo(e) || fo(e))
    return !1;
  var r = co(e) ? _o : vo;
  return r.test(po(e));
}
var So = wo;
function $o(e, r) {
  return e == null ? void 0 : e[r];
}
var Oo = $o, Eo = So, Co = Oo;
function Ro(e, r) {
  var n = Co(e, r);
  return Eo(n) ? n : void 0;
}
var $e = Ro, xo = $e;
(function() {
  try {
    var e = xo(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
})();
function ko() {
  this.__data__ = [], this.size = 0;
}
var To = ko;
function Po(e, r) {
  return e === r || e !== e && r !== r;
}
var jo = Po, Ao = jo;
function Do(e, r) {
  for (var n = e.length; n--; )
    if (Ao(e[n][0], r))
      return n;
  return -1;
}
var rt = Do, Mo = rt, Io = Array.prototype, Bo = Io.splice;
function Fo(e) {
  var r = this.__data__, n = Mo(r, e);
  if (n < 0)
    return !1;
  var o = r.length - 1;
  return n == o ? r.pop() : Bo.call(r, n, 1), --this.size, !0;
}
var Lo = Fo, No = rt;
function Uo(e) {
  var r = this.__data__, n = No(r, e);
  return n < 0 ? void 0 : r[n][1];
}
var Wo = Uo, zo = rt;
function Vo(e) {
  return zo(this.__data__, e) > -1;
}
var Ho = Vo, Yo = rt;
function Go(e, r) {
  var n = this.__data__, o = Yo(n, e);
  return o < 0 ? (++this.size, n.push([e, r])) : n[o][1] = r, this;
}
var qo = Go, Ko = To, Jo = Lo, Xo = Wo, Zo = Ho, Qo = qo;
function Te(e) {
  var r = -1, n = e == null ? 0 : e.length;
  for (this.clear(); ++r < n; ) {
    var o = e[r];
    this.set(o[0], o[1]);
  }
}
Te.prototype.clear = Ko;
Te.prototype.delete = Jo;
Te.prototype.get = Xo;
Te.prototype.has = Zo;
Te.prototype.set = Qo;
var ei = Te, ti = $e, ri = ve, ni = ti(ri, "Map"), Wr = ni, ai = $e, oi = ai(Object, "create"), nt = oi, br = nt;
function ii() {
  this.__data__ = br ? br(null) : {}, this.size = 0;
}
var si = ii;
function ui(e) {
  var r = this.has(e) && delete this.__data__[e];
  return this.size -= r ? 1 : 0, r;
}
var ci = ui, fi = nt, li = "__lodash_hash_undefined__", di = Object.prototype, pi = di.hasOwnProperty;
function hi(e) {
  var r = this.__data__;
  if (fi) {
    var n = r[e];
    return n === li ? void 0 : n;
  }
  return pi.call(r, e) ? r[e] : void 0;
}
var vi = hi, gi = nt, yi = Object.prototype, mi = yi.hasOwnProperty;
function bi(e) {
  var r = this.__data__;
  return gi ? r[e] !== void 0 : mi.call(r, e);
}
var _i = bi, wi = nt, Si = "__lodash_hash_undefined__";
function $i(e, r) {
  var n = this.__data__;
  return this.size += this.has(e) ? 0 : 1, n[e] = wi && r === void 0 ? Si : r, this;
}
var Oi = $i, Ei = si, Ci = ci, Ri = vi, xi = _i, ki = Oi;
function Pe(e) {
  var r = -1, n = e == null ? 0 : e.length;
  for (this.clear(); ++r < n; ) {
    var o = e[r];
    this.set(o[0], o[1]);
  }
}
Pe.prototype.clear = Ei;
Pe.prototype.delete = Ci;
Pe.prototype.get = Ri;
Pe.prototype.has = xi;
Pe.prototype.set = ki;
var Ti = Pe, _r = Ti, Pi = ei, ji = Wr;
function Ai() {
  this.size = 0, this.__data__ = {
    hash: new _r(),
    map: new (ji || Pi)(),
    string: new _r()
  };
}
var Di = Ai;
function Mi(e) {
  var r = typeof e;
  return r == "string" || r == "number" || r == "symbol" || r == "boolean" ? e !== "__proto__" : e === null;
}
var Ii = Mi, Bi = Ii;
function Fi(e, r) {
  var n = e.__data__;
  return Bi(r) ? n[typeof r == "string" ? "string" : "hash"] : n.map;
}
var at = Fi, Li = at;
function Ni(e) {
  var r = Li(this, e).delete(e);
  return this.size -= r ? 1 : 0, r;
}
var Ui = Ni, Wi = at;
function zi(e) {
  return Wi(this, e).get(e);
}
var Vi = zi, Hi = at;
function Yi(e) {
  return Hi(this, e).has(e);
}
var Gi = Yi, qi = at;
function Ki(e, r) {
  var n = qi(this, e), o = n.size;
  return n.set(e, r), this.size += n.size == o ? 0 : 1, this;
}
var Ji = Ki, Xi = Di, Zi = Ui, Qi = Vi, es = Gi, ts = Ji;
function je(e) {
  var r = -1, n = e == null ? 0 : e.length;
  for (this.clear(); ++r < n; ) {
    var o = e[r];
    this.set(o[0], o[1]);
  }
}
je.prototype.clear = Xi;
je.prototype.delete = Zi;
je.prototype.get = Qi;
je.prototype.has = es;
je.prototype.set = ts;
var rs = je, ns = ve;
ns.Uint8Array;
var wr = tt, Sr = wr ? wr.prototype : void 0;
Sr && Sr.valueOf;
var as = $e, os = ve, is = as(os, "DataView"), ss = is, us = $e, cs = ve, fs = us(cs, "Promise"), ls = fs, ds = $e, ps = ve, hs = ds(ps, "Set"), vs = hs, gs = $e, ys = ve, ms = gs(ys, "WeakMap"), bs = ms, St = ss, $t = Wr, Ot = ls, Et = vs, Ct = bs, zr = xt, Ae = Ur, $r = "[object Map]", _s = "[object Object]", Or = "[object Promise]", Er = "[object Set]", Cr = "[object WeakMap]", Rr = "[object DataView]", ws = Ae(St), Ss = Ae($t), $s = Ae(Ot), Os = Ae(Et), Es = Ae(Ct), xe = zr;
(St && xe(new St(new ArrayBuffer(1))) != Rr || $t && xe(new $t()) != $r || Ot && xe(Ot.resolve()) != Or || Et && xe(new Et()) != Er || Ct && xe(new Ct()) != Cr) && (xe = function(e) {
  var r = zr(e), n = r == _s ? e.constructor : void 0, o = n ? Ae(n) : "";
  if (o)
    switch (o) {
      case ws:
        return Rr;
      case Ss:
        return $r;
      case $s:
        return Or;
      case Os:
        return Er;
      case Es:
        return Cr;
    }
  return r;
});
var Vr = rs, Cs = "Expected a function";
function kt(e, r) {
  if (typeof e != "function" || r != null && typeof r != "function")
    throw new TypeError(Cs);
  var n = function() {
    var o = arguments, a = r ? r.apply(this, o) : o[0], i = n.cache;
    if (i.has(a))
      return i.get(a);
    var f = e.apply(this, o);
    return n.cache = i.set(a, f) || i, f;
  };
  return n.cache = new (kt.Cache || Vr)(), n;
}
kt.Cache = Vr;
var Rs = kt, xs = Rs, ks = 500;
function Ts(e) {
  var r = xs(e, function(o) {
    return n.size === ks && n.clear(), o;
  }), n = r.cache;
  return r;
}
var Ps = Ts, js = Ps, As = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Ds = /\\(\\)?/g;
js(function(e) {
  var r = [];
  return e.charCodeAt(0) === 46 && r.push(""), e.replace(As, function(n, o, a, i) {
    r.push(a ? i.replace(Ds, "$1") : o || n);
  }), r;
});
var xr = tt, kr = xr ? xr.prototype : void 0;
kr && kr.toString;
var z = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Tr;
function Ms() {
  if (Tr)
    return z;
  Tr = 1;
  var e = Symbol.for("react.element"), r = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), i = Symbol.for("react.provider"), f = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), p = Symbol.for("react.memo"), $ = Symbol.for("react.lazy"), y = Symbol.iterator;
  function m(c) {
    return c === null || typeof c != "object" ? null : (c = y && c[y] || c["@@iterator"], typeof c == "function" ? c : null);
  }
  var O = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, R = Object.assign, v = {};
  function _(c, g, A) {
    this.props = c, this.context = g, this.refs = v, this.updater = A || O;
  }
  _.prototype.isReactComponent = {}, _.prototype.setState = function(c, g) {
    if (typeof c != "object" && typeof c != "function" && c != null)
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, c, g, "setState");
  }, _.prototype.forceUpdate = function(c) {
    this.updater.enqueueForceUpdate(this, c, "forceUpdate");
  };
  function x() {
  }
  x.prototype = _.prototype;
  function U(c, g, A) {
    this.props = c, this.context = g, this.refs = v, this.updater = A || O;
  }
  var T = U.prototype = new x();
  T.constructor = U, R(T, _.prototype), T.isPureReactComponent = !0;
  var P = Array.isArray, j = Object.prototype.hasOwnProperty, W = { current: null }, K = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Y(c, g, A) {
    var M, N = {}, Z = null, q = null;
    if (g != null)
      for (M in g.ref !== void 0 && (q = g.ref), g.key !== void 0 && (Z = "" + g.key), g)
        j.call(g, M) && !K.hasOwnProperty(M) && (N[M] = g[M]);
    var Q = arguments.length - 2;
    if (Q === 1)
      N.children = A;
    else if (1 < Q) {
      for (var H = Array(Q), J = 0; J < Q; J++)
        H[J] = arguments[J + 2];
      N.children = H;
    }
    if (c && c.defaultProps)
      for (M in Q = c.defaultProps, Q)
        N[M] === void 0 && (N[M] = Q[M]);
    return { $$typeof: e, type: c, key: Z, ref: q, props: N, _owner: W.current };
  }
  function se(c, g) {
    return { $$typeof: e, type: c.type, key: g, ref: c.ref, props: c.props, _owner: c._owner };
  }
  function X(c) {
    return typeof c == "object" && c !== null && c.$$typeof === e;
  }
  function G(c) {
    var g = { "=": "=0", ":": "=2" };
    return "$" + c.replace(/[=:]/g, function(A) {
      return g[A];
    });
  }
  var le = /\/+/g;
  function ge(c, g) {
    return typeof c == "object" && c !== null && c.key != null ? G("" + c.key) : g.toString(36);
  }
  function D(c, g, A, M, N) {
    var Z = typeof c;
    (Z === "undefined" || Z === "boolean") && (c = null);
    var q = !1;
    if (c === null)
      q = !0;
    else
      switch (Z) {
        case "string":
        case "number":
          q = !0;
          break;
        case "object":
          switch (c.$$typeof) {
            case e:
            case r:
              q = !0;
          }
      }
    if (q)
      return q = c, N = N(q), c = M === "" ? "." + ge(q, 0) : M, P(N) ? (A = "", c != null && (A = c.replace(le, "$&/") + "/"), D(N, g, A, "", function(J) {
        return J;
      })) : N != null && (X(N) && (N = se(N, A + (!N.key || q && q.key === N.key ? "" : ("" + N.key).replace(le, "$&/") + "/") + c)), g.push(N)), 1;
    if (q = 0, M = M === "" ? "." : M + ":", P(c))
      for (var Q = 0; Q < c.length; Q++) {
        Z = c[Q];
        var H = M + ge(Z, Q);
        q += D(Z, g, A, H, N);
      }
    else if (H = m(c), typeof H == "function")
      for (c = H.call(c), Q = 0; !(Z = c.next()).done; )
        Z = Z.value, H = M + ge(Z, Q++), q += D(Z, g, A, H, N);
    else if (Z === "object")
      throw g = String(c), Error("Objects are not valid as a React child (found: " + (g === "[object Object]" ? "object with keys {" + Object.keys(c).join(", ") + "}" : g) + "). If you meant to render a collection of children, use an array instead.");
    return q;
  }
  function E(c, g, A) {
    if (c == null)
      return c;
    var M = [], N = 0;
    return D(c, M, "", "", function(Z) {
      return g.call(A, Z, N++);
    }), M;
  }
  function S(c) {
    if (c._status === -1) {
      var g = c._result;
      g = g(), g.then(function(A) {
        (c._status === 0 || c._status === -1) && (c._status = 1, c._result = A);
      }, function(A) {
        (c._status === 0 || c._status === -1) && (c._status = 2, c._result = A);
      }), c._status === -1 && (c._status = 0, c._result = g);
    }
    if (c._status === 1)
      return c._result.default;
    throw c._result;
  }
  var b = { current: null }, C = { transition: null }, F = { ReactCurrentDispatcher: b, ReactCurrentBatchConfig: C, ReactCurrentOwner: W };
  function B() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return z.Children = { map: E, forEach: function(c, g, A) {
    E(c, function() {
      g.apply(this, arguments);
    }, A);
  }, count: function(c) {
    var g = 0;
    return E(c, function() {
      g++;
    }), g;
  }, toArray: function(c) {
    return E(c, function(g) {
      return g;
    }) || [];
  }, only: function(c) {
    if (!X(c))
      throw Error("React.Children.only expected to receive a single React element child.");
    return c;
  } }, z.Component = _, z.Fragment = n, z.Profiler = a, z.PureComponent = U, z.StrictMode = o, z.Suspense = l, z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = F, z.act = B, z.cloneElement = function(c, g, A) {
    if (c == null)
      throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + c + ".");
    var M = R({}, c.props), N = c.key, Z = c.ref, q = c._owner;
    if (g != null) {
      if (g.ref !== void 0 && (Z = g.ref, q = W.current), g.key !== void 0 && (N = "" + g.key), c.type && c.type.defaultProps)
        var Q = c.type.defaultProps;
      for (H in g)
        j.call(g, H) && !K.hasOwnProperty(H) && (M[H] = g[H] === void 0 && Q !== void 0 ? Q[H] : g[H]);
    }
    var H = arguments.length - 2;
    if (H === 1)
      M.children = A;
    else if (1 < H) {
      Q = Array(H);
      for (var J = 0; J < H; J++)
        Q[J] = arguments[J + 2];
      M.children = Q;
    }
    return { $$typeof: e, type: c.type, key: N, ref: Z, props: M, _owner: q };
  }, z.createContext = function(c) {
    return c = { $$typeof: f, _currentValue: c, _currentValue2: c, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, c.Provider = { $$typeof: i, _context: c }, c.Consumer = c;
  }, z.createElement = Y, z.createFactory = function(c) {
    var g = Y.bind(null, c);
    return g.type = c, g;
  }, z.createRef = function() {
    return { current: null };
  }, z.forwardRef = function(c) {
    return { $$typeof: u, render: c };
  }, z.isValidElement = X, z.lazy = function(c) {
    return { $$typeof: $, _payload: { _status: -1, _result: c }, _init: S };
  }, z.memo = function(c, g) {
    return { $$typeof: p, type: c, compare: g === void 0 ? null : g };
  }, z.startTransition = function(c) {
    var g = C.transition;
    C.transition = {};
    try {
      c();
    } finally {
      C.transition = g;
    }
  }, z.unstable_act = B, z.useCallback = function(c, g) {
    return b.current.useCallback(c, g);
  }, z.useContext = function(c) {
    return b.current.useContext(c);
  }, z.useDebugValue = function() {
  }, z.useDeferredValue = function(c) {
    return b.current.useDeferredValue(c);
  }, z.useEffect = function(c, g) {
    return b.current.useEffect(c, g);
  }, z.useId = function() {
    return b.current.useId();
  }, z.useImperativeHandle = function(c, g, A) {
    return b.current.useImperativeHandle(c, g, A);
  }, z.useInsertionEffect = function(c, g) {
    return b.current.useInsertionEffect(c, g);
  }, z.useLayoutEffect = function(c, g) {
    return b.current.useLayoutEffect(c, g);
  }, z.useMemo = function(c, g) {
    return b.current.useMemo(c, g);
  }, z.useReducer = function(c, g, A) {
    return b.current.useReducer(c, g, A);
  }, z.useRef = function(c) {
    return b.current.useRef(c);
  }, z.useState = function(c) {
    return b.current.useState(c);
  }, z.useSyncExternalStore = function(c, g, A) {
    return b.current.useSyncExternalStore(c, g, A);
  }, z.useTransition = function() {
    return b.current.useTransition();
  }, z.version = "18.3.1", z;
}
var Le = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Le.exports;
var Pr;
function Is() {
  return Pr || (Pr = 1, function(e, r) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var n = "18.3.1", o = Symbol.for("react.element"), a = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), f = Symbol.for("react.strict_mode"), u = Symbol.for("react.profiler"), l = Symbol.for("react.provider"), p = Symbol.for("react.context"), $ = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), m = Symbol.for("react.suspense_list"), O = Symbol.for("react.memo"), R = Symbol.for("react.lazy"), v = Symbol.for("react.offscreen"), _ = Symbol.iterator, x = "@@iterator";
      function U(t) {
        if (t === null || typeof t != "object")
          return null;
        var s = _ && t[_] || t[x];
        return typeof s == "function" ? s : null;
      }
      var T = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, P = {
        transition: null
      }, j = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, W = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, K = {}, Y = null;
      function se(t) {
        Y = t;
      }
      K.setExtraStackFrame = function(t) {
        Y = t;
      }, K.getCurrentStack = null, K.getStackAddendum = function() {
        var t = "";
        Y && (t += Y);
        var s = K.getCurrentStack;
        return s && (t += s() || ""), t;
      };
      var X = !1, G = !1, le = !1, ge = !1, D = !1, E = {
        ReactCurrentDispatcher: T,
        ReactCurrentBatchConfig: P,
        ReactCurrentOwner: W
      };
      E.ReactDebugCurrentFrame = K, E.ReactCurrentActQueue = j;
      function S(t) {
        {
          for (var s = arguments.length, d = new Array(s > 1 ? s - 1 : 0), h = 1; h < s; h++)
            d[h - 1] = arguments[h];
          C("warn", t, d);
        }
      }
      function b(t) {
        {
          for (var s = arguments.length, d = new Array(s > 1 ? s - 1 : 0), h = 1; h < s; h++)
            d[h - 1] = arguments[h];
          C("error", t, d);
        }
      }
      function C(t, s, d) {
        {
          var h = E.ReactDebugCurrentFrame, w = h.getStackAddendum();
          w !== "" && (s += "%s", d = d.concat([w]));
          var I = d.map(function(k) {
            return String(k);
          });
          I.unshift("Warning: " + s), Function.prototype.apply.call(console[t], console, I);
        }
      }
      var F = {};
      function B(t, s) {
        {
          var d = t.constructor, h = d && (d.displayName || d.name) || "ReactClass", w = h + "." + s;
          if (F[w])
            return;
          b("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", s, h), F[w] = !0;
        }
      }
      var c = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: function(t) {
          return !1;
        },
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: function(t, s, d) {
          B(t, "forceUpdate");
        },
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: function(t, s, d, h) {
          B(t, "replaceState");
        },
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: function(t, s, d, h) {
          B(t, "setState");
        }
      }, g = Object.assign, A = {};
      Object.freeze(A);
      function M(t, s, d) {
        this.props = t, this.context = s, this.refs = A, this.updater = d || c;
      }
      M.prototype.isReactComponent = {}, M.prototype.setState = function(t, s) {
        if (typeof t != "object" && typeof t != "function" && t != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, t, s, "setState");
      }, M.prototype.forceUpdate = function(t) {
        this.updater.enqueueForceUpdate(this, t, "forceUpdate");
      };
      {
        var N = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, Z = function(t, s) {
          Object.defineProperty(M.prototype, t, {
            get: function() {
              S("%s(...) is deprecated in plain JavaScript React classes. %s", s[0], s[1]);
            }
          });
        };
        for (var q in N)
          N.hasOwnProperty(q) && Z(q, N[q]);
      }
      function Q() {
      }
      Q.prototype = M.prototype;
      function H(t, s, d) {
        this.props = t, this.context = s, this.refs = A, this.updater = d || c;
      }
      var J = H.prototype = new Q();
      J.constructor = H, g(J, M.prototype), J.isPureReactComponent = !0;
      function fe() {
        var t = {
          current: null
        };
        return Object.seal(t), t;
      }
      var me = Array.isArray;
      function de(t) {
        return me(t);
      }
      function rn(t) {
        {
          var s = typeof Symbol == "function" && Symbol.toStringTag, d = s && t[Symbol.toStringTag] || t.constructor.name || "Object";
          return d;
        }
      }
      function nn(t) {
        try {
          return Tt(t), !1;
        } catch {
          return !0;
        }
      }
      function Tt(t) {
        return "" + t;
      }
      function We(t) {
        if (nn(t))
          return b("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", rn(t)), Tt(t);
      }
      function an(t, s, d) {
        var h = t.displayName;
        if (h)
          return h;
        var w = s.displayName || s.name || "";
        return w !== "" ? d + "(" + w + ")" : d;
      }
      function Pt(t) {
        return t.displayName || "Context";
      }
      function ye(t) {
        if (t == null)
          return null;
        if (typeof t.tag == "number" && b("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof t == "function")
          return t.displayName || t.name || null;
        if (typeof t == "string")
          return t;
        switch (t) {
          case i:
            return "Fragment";
          case a:
            return "Portal";
          case u:
            return "Profiler";
          case f:
            return "StrictMode";
          case y:
            return "Suspense";
          case m:
            return "SuspenseList";
        }
        if (typeof t == "object")
          switch (t.$$typeof) {
            case p:
              var s = t;
              return Pt(s) + ".Consumer";
            case l:
              var d = t;
              return Pt(d._context) + ".Provider";
            case $:
              return an(t, t.render, "ForwardRef");
            case O:
              var h = t.displayName || null;
              return h !== null ? h : ye(t.type) || "Memo";
            case R: {
              var w = t, I = w._payload, k = w._init;
              try {
                return ye(k(I));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var Me = Object.prototype.hasOwnProperty, jt = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, At, Dt, ct;
      ct = {};
      function Mt(t) {
        if (Me.call(t, "ref")) {
          var s = Object.getOwnPropertyDescriptor(t, "ref").get;
          if (s && s.isReactWarning)
            return !1;
        }
        return t.ref !== void 0;
      }
      function It(t) {
        if (Me.call(t, "key")) {
          var s = Object.getOwnPropertyDescriptor(t, "key").get;
          if (s && s.isReactWarning)
            return !1;
        }
        return t.key !== void 0;
      }
      function on(t, s) {
        var d = function() {
          At || (At = !0, b("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", s));
        };
        d.isReactWarning = !0, Object.defineProperty(t, "key", {
          get: d,
          configurable: !0
        });
      }
      function sn(t, s) {
        var d = function() {
          Dt || (Dt = !0, b("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", s));
        };
        d.isReactWarning = !0, Object.defineProperty(t, "ref", {
          get: d,
          configurable: !0
        });
      }
      function un(t) {
        if (typeof t.ref == "string" && W.current && t.__self && W.current.stateNode !== t.__self) {
          var s = ye(W.current.type);
          ct[s] || (b('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', s, t.ref), ct[s] = !0);
        }
      }
      var ft = function(t, s, d, h, w, I, k) {
        var L = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: o,
          // Built-in properties that belong on the element
          type: t,
          key: s,
          ref: d,
          props: k,
          // Record the component responsible for creating this element.
          _owner: I
        };
        return L._store = {}, Object.defineProperty(L._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(L, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: h
        }), Object.defineProperty(L, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: w
        }), Object.freeze && (Object.freeze(L.props), Object.freeze(L)), L;
      };
      function cn(t, s, d) {
        var h, w = {}, I = null, k = null, L = null, V = null;
        if (s != null) {
          Mt(s) && (k = s.ref, un(s)), It(s) && (We(s.key), I = "" + s.key), L = s.__self === void 0 ? null : s.__self, V = s.__source === void 0 ? null : s.__source;
          for (h in s)
            Me.call(s, h) && !jt.hasOwnProperty(h) && (w[h] = s[h]);
        }
        var te = arguments.length - 2;
        if (te === 1)
          w.children = d;
        else if (te > 1) {
          for (var re = Array(te), ne = 0; ne < te; ne++)
            re[ne] = arguments[ne + 2];
          Object.freeze && Object.freeze(re), w.children = re;
        }
        if (t && t.defaultProps) {
          var ae = t.defaultProps;
          for (h in ae)
            w[h] === void 0 && (w[h] = ae[h]);
        }
        if (I || k) {
          var ie = typeof t == "function" ? t.displayName || t.name || "Unknown" : t;
          I && on(w, ie), k && sn(w, ie);
        }
        return ft(t, I, k, L, V, W.current, w);
      }
      function fn(t, s) {
        var d = ft(t.type, s, t.ref, t._self, t._source, t._owner, t.props);
        return d;
      }
      function ln(t, s, d) {
        if (t == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + t + ".");
        var h, w = g({}, t.props), I = t.key, k = t.ref, L = t._self, V = t._source, te = t._owner;
        if (s != null) {
          Mt(s) && (k = s.ref, te = W.current), It(s) && (We(s.key), I = "" + s.key);
          var re;
          t.type && t.type.defaultProps && (re = t.type.defaultProps);
          for (h in s)
            Me.call(s, h) && !jt.hasOwnProperty(h) && (s[h] === void 0 && re !== void 0 ? w[h] = re[h] : w[h] = s[h]);
        }
        var ne = arguments.length - 2;
        if (ne === 1)
          w.children = d;
        else if (ne > 1) {
          for (var ae = Array(ne), ie = 0; ie < ne; ie++)
            ae[ie] = arguments[ie + 2];
          w.children = ae;
        }
        return ft(t.type, I, k, L, V, te, w);
      }
      function Ee(t) {
        return typeof t == "object" && t !== null && t.$$typeof === o;
      }
      var Bt = ".", dn = ":";
      function pn(t) {
        var s = /[=:]/g, d = {
          "=": "=0",
          ":": "=2"
        }, h = t.replace(s, function(w) {
          return d[w];
        });
        return "$" + h;
      }
      var Ft = !1, hn = /\/+/g;
      function Lt(t) {
        return t.replace(hn, "$&/");
      }
      function lt(t, s) {
        return typeof t == "object" && t !== null && t.key != null ? (We(t.key), pn("" + t.key)) : s.toString(36);
      }
      function ze(t, s, d, h, w) {
        var I = typeof t;
        (I === "undefined" || I === "boolean") && (t = null);
        var k = !1;
        if (t === null)
          k = !0;
        else
          switch (I) {
            case "string":
            case "number":
              k = !0;
              break;
            case "object":
              switch (t.$$typeof) {
                case o:
                case a:
                  k = !0;
              }
          }
        if (k) {
          var L = t, V = w(L), te = h === "" ? Bt + lt(L, 0) : h;
          if (de(V)) {
            var re = "";
            te != null && (re = Lt(te) + "/"), ze(V, s, re, "", function(ia) {
              return ia;
            });
          } else
            V != null && (Ee(V) && (V.key && (!L || L.key !== V.key) && We(V.key), V = fn(
              V,
              // Keep both the (mapped) and old keys if they differ, just as
              // traverseAllChildren used to do for objects as children
              d + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
              (V.key && (!L || L.key !== V.key) ? (
                // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                // eslint-disable-next-line react-internal/safe-string-coercion
                Lt("" + V.key) + "/"
              ) : "") + te
            )), s.push(V));
          return 1;
        }
        var ne, ae, ie = 0, ue = h === "" ? Bt : h + dn;
        if (de(t))
          for (var Xe = 0; Xe < t.length; Xe++)
            ne = t[Xe], ae = ue + lt(ne, Xe), ie += ze(ne, s, d, ae, w);
        else {
          var _t = U(t);
          if (typeof _t == "function") {
            var fr = t;
            _t === fr.entries && (Ft || S("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Ft = !0);
            for (var aa = _t.call(fr), lr, oa = 0; !(lr = aa.next()).done; )
              ne = lr.value, ae = ue + lt(ne, oa++), ie += ze(ne, s, d, ae, w);
          } else if (I === "object") {
            var dr = String(t);
            throw new Error("Objects are not valid as a React child (found: " + (dr === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : dr) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return ie;
      }
      function Ve(t, s, d) {
        if (t == null)
          return t;
        var h = [], w = 0;
        return ze(t, h, "", "", function(I) {
          return s.call(d, I, w++);
        }), h;
      }
      function vn(t) {
        var s = 0;
        return Ve(t, function() {
          s++;
        }), s;
      }
      function gn(t, s, d) {
        Ve(t, function() {
          s.apply(this, arguments);
        }, d);
      }
      function yn(t) {
        return Ve(t, function(s) {
          return s;
        }) || [];
      }
      function mn(t) {
        if (!Ee(t))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return t;
      }
      function bn(t) {
        var s = {
          $$typeof: p,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: t,
          _currentValue2: t,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        s.Provider = {
          $$typeof: l,
          _context: s
        };
        var d = !1, h = !1, w = !1;
        {
          var I = {
            $$typeof: p,
            _context: s
          };
          Object.defineProperties(I, {
            Provider: {
              get: function() {
                return h || (h = !0, b("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), s.Provider;
              },
              set: function(k) {
                s.Provider = k;
              }
            },
            _currentValue: {
              get: function() {
                return s._currentValue;
              },
              set: function(k) {
                s._currentValue = k;
              }
            },
            _currentValue2: {
              get: function() {
                return s._currentValue2;
              },
              set: function(k) {
                s._currentValue2 = k;
              }
            },
            _threadCount: {
              get: function() {
                return s._threadCount;
              },
              set: function(k) {
                s._threadCount = k;
              }
            },
            Consumer: {
              get: function() {
                return d || (d = !0, b("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), s.Consumer;
              }
            },
            displayName: {
              get: function() {
                return s.displayName;
              },
              set: function(k) {
                w || (S("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", k), w = !0);
              }
            }
          }), s.Consumer = I;
        }
        return s._currentRenderer = null, s._currentRenderer2 = null, s;
      }
      var Ie = -1, dt = 0, Nt = 1, _n = 2;
      function wn(t) {
        if (t._status === Ie) {
          var s = t._result, d = s();
          if (d.then(function(I) {
            if (t._status === dt || t._status === Ie) {
              var k = t;
              k._status = Nt, k._result = I;
            }
          }, function(I) {
            if (t._status === dt || t._status === Ie) {
              var k = t;
              k._status = _n, k._result = I;
            }
          }), t._status === Ie) {
            var h = t;
            h._status = dt, h._result = d;
          }
        }
        if (t._status === Nt) {
          var w = t._result;
          return w === void 0 && b(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, w), "default" in w || b(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, w), w.default;
        } else
          throw t._result;
      }
      function Sn(t) {
        var s = {
          // We use these fields to store the result.
          _status: Ie,
          _result: t
        }, d = {
          $$typeof: R,
          _payload: s,
          _init: wn
        };
        {
          var h, w;
          Object.defineProperties(d, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return h;
              },
              set: function(I) {
                b("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), h = I, Object.defineProperty(d, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return w;
              },
              set: function(I) {
                b("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), w = I, Object.defineProperty(d, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return d;
      }
      function $n(t) {
        t != null && t.$$typeof === O ? b("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof t != "function" ? b("forwardRef requires a render function but was given %s.", t === null ? "null" : typeof t) : t.length !== 0 && t.length !== 2 && b("forwardRef render functions accept exactly two parameters: props and ref. %s", t.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), t != null && (t.defaultProps != null || t.propTypes != null) && b("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var s = {
          $$typeof: $,
          render: t
        };
        {
          var d;
          Object.defineProperty(s, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return d;
            },
            set: function(h) {
              d = h, !t.name && !t.displayName && (t.displayName = h);
            }
          });
        }
        return s;
      }
      var Ut;
      Ut = Symbol.for("react.module.reference");
      function Wt(t) {
        return !!(typeof t == "string" || typeof t == "function" || t === i || t === u || D || t === f || t === y || t === m || ge || t === v || X || G || le || typeof t == "object" && t !== null && (t.$$typeof === R || t.$$typeof === O || t.$$typeof === l || t.$$typeof === p || t.$$typeof === $ || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        t.$$typeof === Ut || t.getModuleId !== void 0));
      }
      function On(t, s) {
        Wt(t) || b("memo: The first argument must be a component. Instead received: %s", t === null ? "null" : typeof t);
        var d = {
          $$typeof: O,
          type: t,
          compare: s === void 0 ? null : s
        };
        {
          var h;
          Object.defineProperty(d, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return h;
            },
            set: function(w) {
              h = w, !t.name && !t.displayName && (t.displayName = w);
            }
          });
        }
        return d;
      }
      function ce() {
        var t = T.current;
        return t === null && b(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), t;
      }
      function En(t) {
        var s = ce();
        if (t._context !== void 0) {
          var d = t._context;
          d.Consumer === t ? b("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : d.Provider === t && b("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return s.useContext(t);
      }
      function Cn(t) {
        var s = ce();
        return s.useState(t);
      }
      function Rn(t, s, d) {
        var h = ce();
        return h.useReducer(t, s, d);
      }
      function xn(t) {
        var s = ce();
        return s.useRef(t);
      }
      function kn(t, s) {
        var d = ce();
        return d.useEffect(t, s);
      }
      function Tn(t, s) {
        var d = ce();
        return d.useInsertionEffect(t, s);
      }
      function Pn(t, s) {
        var d = ce();
        return d.useLayoutEffect(t, s);
      }
      function jn(t, s) {
        var d = ce();
        return d.useCallback(t, s);
      }
      function An(t, s) {
        var d = ce();
        return d.useMemo(t, s);
      }
      function Dn(t, s, d) {
        var h = ce();
        return h.useImperativeHandle(t, s, d);
      }
      function Mn(t, s) {
        {
          var d = ce();
          return d.useDebugValue(t, s);
        }
      }
      function In() {
        var t = ce();
        return t.useTransition();
      }
      function Bn(t) {
        var s = ce();
        return s.useDeferredValue(t);
      }
      function Fn() {
        var t = ce();
        return t.useId();
      }
      function Ln(t, s, d) {
        var h = ce();
        return h.useSyncExternalStore(t, s, d);
      }
      var Be = 0, zt, Vt, Ht, Yt, Gt, qt, Kt;
      function Jt() {
      }
      Jt.__reactDisabledLog = !0;
      function Nn() {
        {
          if (Be === 0) {
            zt = console.log, Vt = console.info, Ht = console.warn, Yt = console.error, Gt = console.group, qt = console.groupCollapsed, Kt = console.groupEnd;
            var t = {
              configurable: !0,
              enumerable: !0,
              value: Jt,
              writable: !0
            };
            Object.defineProperties(console, {
              info: t,
              log: t,
              warn: t,
              error: t,
              group: t,
              groupCollapsed: t,
              groupEnd: t
            });
          }
          Be++;
        }
      }
      function Un() {
        {
          if (Be--, Be === 0) {
            var t = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: g({}, t, {
                value: zt
              }),
              info: g({}, t, {
                value: Vt
              }),
              warn: g({}, t, {
                value: Ht
              }),
              error: g({}, t, {
                value: Yt
              }),
              group: g({}, t, {
                value: Gt
              }),
              groupCollapsed: g({}, t, {
                value: qt
              }),
              groupEnd: g({}, t, {
                value: Kt
              })
            });
          }
          Be < 0 && b("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var pt = E.ReactCurrentDispatcher, ht;
      function He(t, s, d) {
        {
          if (ht === void 0)
            try {
              throw Error();
            } catch (w) {
              var h = w.stack.trim().match(/\n( *(at )?)/);
              ht = h && h[1] || "";
            }
          return `
` + ht + t;
        }
      }
      var vt = !1, Ye;
      {
        var Wn = typeof WeakMap == "function" ? WeakMap : Map;
        Ye = new Wn();
      }
      function Xt(t, s) {
        if (!t || vt)
          return "";
        {
          var d = Ye.get(t);
          if (d !== void 0)
            return d;
        }
        var h;
        vt = !0;
        var w = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var I;
        I = pt.current, pt.current = null, Nn();
        try {
          if (s) {
            var k = function() {
              throw Error();
            };
            if (Object.defineProperty(k.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(k, []);
              } catch (ue) {
                h = ue;
              }
              Reflect.construct(t, [], k);
            } else {
              try {
                k.call();
              } catch (ue) {
                h = ue;
              }
              t.call(k.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (ue) {
              h = ue;
            }
            t();
          }
        } catch (ue) {
          if (ue && h && typeof ue.stack == "string") {
            for (var L = ue.stack.split(`
`), V = h.stack.split(`
`), te = L.length - 1, re = V.length - 1; te >= 1 && re >= 0 && L[te] !== V[re]; )
              re--;
            for (; te >= 1 && re >= 0; te--, re--)
              if (L[te] !== V[re]) {
                if (te !== 1 || re !== 1)
                  do
                    if (te--, re--, re < 0 || L[te] !== V[re]) {
                      var ne = `
` + L[te].replace(" at new ", " at ");
                      return t.displayName && ne.includes("<anonymous>") && (ne = ne.replace("<anonymous>", t.displayName)), typeof t == "function" && Ye.set(t, ne), ne;
                    }
                  while (te >= 1 && re >= 0);
                break;
              }
          }
        } finally {
          vt = !1, pt.current = I, Un(), Error.prepareStackTrace = w;
        }
        var ae = t ? t.displayName || t.name : "", ie = ae ? He(ae) : "";
        return typeof t == "function" && Ye.set(t, ie), ie;
      }
      function zn(t, s, d) {
        return Xt(t, !1);
      }
      function Vn(t) {
        var s = t.prototype;
        return !!(s && s.isReactComponent);
      }
      function Ge(t, s, d) {
        if (t == null)
          return "";
        if (typeof t == "function")
          return Xt(t, Vn(t));
        if (typeof t == "string")
          return He(t);
        switch (t) {
          case y:
            return He("Suspense");
          case m:
            return He("SuspenseList");
        }
        if (typeof t == "object")
          switch (t.$$typeof) {
            case $:
              return zn(t.render);
            case O:
              return Ge(t.type, s, d);
            case R: {
              var h = t, w = h._payload, I = h._init;
              try {
                return Ge(I(w), s, d);
              } catch {
              }
            }
          }
        return "";
      }
      var Zt = {}, Qt = E.ReactDebugCurrentFrame;
      function qe(t) {
        if (t) {
          var s = t._owner, d = Ge(t.type, t._source, s ? s.type : null);
          Qt.setExtraStackFrame(d);
        } else
          Qt.setExtraStackFrame(null);
      }
      function Hn(t, s, d, h, w) {
        {
          var I = Function.call.bind(Me);
          for (var k in t)
            if (I(t, k)) {
              var L = void 0;
              try {
                if (typeof t[k] != "function") {
                  var V = Error((h || "React class") + ": " + d + " type `" + k + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof t[k] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw V.name = "Invariant Violation", V;
                }
                L = t[k](s, k, h, d, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (te) {
                L = te;
              }
              L && !(L instanceof Error) && (qe(w), b("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", h || "React class", d, k, typeof L), qe(null)), L instanceof Error && !(L.message in Zt) && (Zt[L.message] = !0, qe(w), b("Failed %s type: %s", d, L.message), qe(null));
            }
        }
      }
      function Ce(t) {
        if (t) {
          var s = t._owner, d = Ge(t.type, t._source, s ? s.type : null);
          se(d);
        } else
          se(null);
      }
      var gt;
      gt = !1;
      function er() {
        if (W.current) {
          var t = ye(W.current.type);
          if (t)
            return `

Check the render method of \`` + t + "`.";
        }
        return "";
      }
      function Yn(t) {
        if (t !== void 0) {
          var s = t.fileName.replace(/^.*[\\\/]/, ""), d = t.lineNumber;
          return `

Check your code at ` + s + ":" + d + ".";
        }
        return "";
      }
      function Gn(t) {
        return t != null ? Yn(t.__source) : "";
      }
      var tr = {};
      function qn(t) {
        var s = er();
        if (!s) {
          var d = typeof t == "string" ? t : t.displayName || t.name;
          d && (s = `

Check the top-level render call using <` + d + ">.");
        }
        return s;
      }
      function rr(t, s) {
        if (!(!t._store || t._store.validated || t.key != null)) {
          t._store.validated = !0;
          var d = qn(s);
          if (!tr[d]) {
            tr[d] = !0;
            var h = "";
            t && t._owner && t._owner !== W.current && (h = " It was passed a child from " + ye(t._owner.type) + "."), Ce(t), b('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', d, h), Ce(null);
          }
        }
      }
      function nr(t, s) {
        if (typeof t == "object") {
          if (de(t))
            for (var d = 0; d < t.length; d++) {
              var h = t[d];
              Ee(h) && rr(h, s);
            }
          else if (Ee(t))
            t._store && (t._store.validated = !0);
          else if (t) {
            var w = U(t);
            if (typeof w == "function" && w !== t.entries)
              for (var I = w.call(t), k; !(k = I.next()).done; )
                Ee(k.value) && rr(k.value, s);
          }
        }
      }
      function ar(t) {
        {
          var s = t.type;
          if (s == null || typeof s == "string")
            return;
          var d;
          if (typeof s == "function")
            d = s.propTypes;
          else if (typeof s == "object" && (s.$$typeof === $ || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          s.$$typeof === O))
            d = s.propTypes;
          else
            return;
          if (d) {
            var h = ye(s);
            Hn(d, t.props, "prop", h, t);
          } else if (s.PropTypes !== void 0 && !gt) {
            gt = !0;
            var w = ye(s);
            b("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", w || "Unknown");
          }
          typeof s.getDefaultProps == "function" && !s.getDefaultProps.isReactClassApproved && b("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function Kn(t) {
        {
          for (var s = Object.keys(t.props), d = 0; d < s.length; d++) {
            var h = s[d];
            if (h !== "children" && h !== "key") {
              Ce(t), b("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", h), Ce(null);
              break;
            }
          }
          t.ref !== null && (Ce(t), b("Invalid attribute `ref` supplied to `React.Fragment`."), Ce(null));
        }
      }
      function or(t, s, d) {
        var h = Wt(t);
        if (!h) {
          var w = "";
          (t === void 0 || typeof t == "object" && t !== null && Object.keys(t).length === 0) && (w += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var I = Gn(s);
          I ? w += I : w += er();
          var k;
          t === null ? k = "null" : de(t) ? k = "array" : t !== void 0 && t.$$typeof === o ? (k = "<" + (ye(t.type) || "Unknown") + " />", w = " Did you accidentally export a JSX literal instead of a component?") : k = typeof t, b("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", k, w);
        }
        var L = cn.apply(this, arguments);
        if (L == null)
          return L;
        if (h)
          for (var V = 2; V < arguments.length; V++)
            nr(arguments[V], t);
        return t === i ? Kn(L) : ar(L), L;
      }
      var ir = !1;
      function Jn(t) {
        var s = or.bind(null, t);
        return s.type = t, ir || (ir = !0, S("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(s, "type", {
          enumerable: !1,
          get: function() {
            return S("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: t
            }), t;
          }
        }), s;
      }
      function Xn(t, s, d) {
        for (var h = ln.apply(this, arguments), w = 2; w < arguments.length; w++)
          nr(arguments[w], h.type);
        return ar(h), h;
      }
      function Zn(t, s) {
        var d = P.transition;
        P.transition = {};
        var h = P.transition;
        P.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          t();
        } finally {
          if (P.transition = d, d === null && h._updatedFibers) {
            var w = h._updatedFibers.size;
            w > 10 && S("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), h._updatedFibers.clear();
          }
        }
      }
      var sr = !1, Ke = null;
      function Qn(t) {
        if (Ke === null)
          try {
            var s = ("require" + Math.random()).slice(0, 7), d = e && e[s];
            Ke = d.call(e, "timers").setImmediate;
          } catch {
            Ke = function(w) {
              sr === !1 && (sr = !0, typeof MessageChannel > "u" && b("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var I = new MessageChannel();
              I.port1.onmessage = w, I.port2.postMessage(void 0);
            };
          }
        return Ke(t);
      }
      var Re = 0, ur = !1;
      function cr(t) {
        {
          var s = Re;
          Re++, j.current === null && (j.current = []);
          var d = j.isBatchingLegacy, h;
          try {
            if (j.isBatchingLegacy = !0, h = t(), !d && j.didScheduleLegacyUpdate) {
              var w = j.current;
              w !== null && (j.didScheduleLegacyUpdate = !1, bt(w));
            }
          } catch (ae) {
            throw Je(s), ae;
          } finally {
            j.isBatchingLegacy = d;
          }
          if (h !== null && typeof h == "object" && typeof h.then == "function") {
            var I = h, k = !1, L = {
              then: function(ae, ie) {
                k = !0, I.then(function(ue) {
                  Je(s), Re === 0 ? yt(ue, ae, ie) : ae(ue);
                }, function(ue) {
                  Je(s), ie(ue);
                });
              }
            };
            return !ur && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              k || (ur = !0, b("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), L;
          } else {
            var V = h;
            if (Je(s), Re === 0) {
              var te = j.current;
              te !== null && (bt(te), j.current = null);
              var re = {
                then: function(ae, ie) {
                  j.current === null ? (j.current = [], yt(V, ae, ie)) : ae(V);
                }
              };
              return re;
            } else {
              var ne = {
                then: function(ae, ie) {
                  ae(V);
                }
              };
              return ne;
            }
          }
        }
      }
      function Je(t) {
        t !== Re - 1 && b("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Re = t;
      }
      function yt(t, s, d) {
        {
          var h = j.current;
          if (h !== null)
            try {
              bt(h), Qn(function() {
                h.length === 0 ? (j.current = null, s(t)) : yt(t, s, d);
              });
            } catch (w) {
              d(w);
            }
          else
            s(t);
        }
      }
      var mt = !1;
      function bt(t) {
        if (!mt) {
          mt = !0;
          var s = 0;
          try {
            for (; s < t.length; s++) {
              var d = t[s];
              do
                d = d(!0);
              while (d !== null);
            }
            t.length = 0;
          } catch (h) {
            throw t = t.slice(s + 1), h;
          } finally {
            mt = !1;
          }
        }
      }
      var ea = or, ta = Xn, ra = Jn, na = {
        map: Ve,
        forEach: gn,
        count: vn,
        toArray: yn,
        only: mn
      };
      r.Children = na, r.Component = M, r.Fragment = i, r.Profiler = u, r.PureComponent = H, r.StrictMode = f, r.Suspense = y, r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = E, r.act = cr, r.cloneElement = ta, r.createContext = bn, r.createElement = ea, r.createFactory = ra, r.createRef = fe, r.forwardRef = $n, r.isValidElement = Ee, r.lazy = Sn, r.memo = On, r.startTransition = Zn, r.unstable_act = cr, r.useCallback = jn, r.useContext = En, r.useDebugValue = Mn, r.useDeferredValue = Bn, r.useEffect = kn, r.useId = Fn, r.useImperativeHandle = Dn, r.useInsertionEffect = Tn, r.useLayoutEffect = Pn, r.useMemo = An, r.useReducer = Rn, r.useRef = xn, r.useState = Cn, r.useSyncExternalStore = Ln, r.useTransition = In, r.version = n, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(Le, Le.exports)), Le.exports;
}
process.env.NODE_ENV === "production" ? Ms() : Is();
var Se = 1e6, jr = 1e6, Ne = "[big.js] ", Ue = Ne + "Invalid ", ot = Ue + "decimal places", Bs = Ue + "rounding mode", Hr = Ne + "Division by zero", ee = {}, pe = void 0;
function Oe(e, r, n, o) {
  var a = e.c;
  if (n === pe && (n = e.constructor.RM), n !== 0 && n !== 1 && n !== 2 && n !== 3)
    throw Error(Bs);
  if (r < 1)
    o = n === 3 && (o || !!a[0]) || r === 0 && (n === 1 && a[0] >= 5 || n === 2 && (a[0] > 5 || a[0] === 5 && (o || a[1] !== pe))), a.length = 1, o ? (e.e = e.e - r + 1, a[0] = 1) : a[0] = e.e = 0;
  else if (r < a.length) {
    if (o = n === 1 && a[r] >= 5 || n === 2 && (a[r] > 5 || a[r] === 5 && (o || a[r + 1] !== pe || a[r - 1] & 1)) || n === 3 && (o || !!a[0]), a.length = r, o) {
      for (; ++a[--r] > 9; )
        if (a[r] = 0, r === 0) {
          ++e.e, a.unshift(1);
          break;
        }
    }
    for (r = a.length; !a[--r]; )
      a.pop();
  }
  return e;
}
function De(e, r, n) {
  var o = e.e, a = e.c.join(""), i = a.length;
  if (r)
    a = a.charAt(0) + (i > 1 ? "." + a.slice(1) : "") + (o < 0 ? "e" : "e+") + o;
  else if (o < 0) {
    for (; ++o; )
      a = "0" + a;
    a = "0." + a;
  } else if (o > 0)
    if (++o > i)
      for (o -= i; o--; )
        a += "0";
    else
      o < i && (a = a.slice(0, o) + "." + a.slice(o));
  else
    i > 1 && (a = a.charAt(0) + "." + a.slice(1));
  return e.s < 0 && n ? "-" + a : a;
}
ee.abs = function() {
  var e = new this.constructor(this);
  return e.s = 1, e;
};
ee.cmp = function(e) {
  var r, n = this, o = n.c, a = (e = new n.constructor(e)).c, i = n.s, f = e.s, u = n.e, l = e.e;
  if (!o[0] || !a[0])
    return o[0] ? i : a[0] ? -f : 0;
  if (i != f)
    return i;
  if (r = i < 0, u != l)
    return u > l ^ r ? 1 : -1;
  for (f = (u = o.length) < (l = a.length) ? u : l, i = -1; ++i < f; )
    if (o[i] != a[i])
      return o[i] > a[i] ^ r ? 1 : -1;
  return u == l ? 0 : u > l ^ r ? 1 : -1;
};
ee.div = function(e) {
  var r = this, n = r.constructor, o = r.c, a = (e = new n(e)).c, i = r.s == e.s ? 1 : -1, f = n.DP;
  if (f !== ~~f || f < 0 || f > Se)
    throw Error(ot);
  if (!a[0])
    throw Error(Hr);
  if (!o[0])
    return e.s = i, e.c = [e.e = 0], e;
  var u, l, p, $, y, m = a.slice(), O = u = a.length, R = o.length, v = o.slice(0, u), _ = v.length, x = e, U = x.c = [], T = 0, P = f + (x.e = r.e - e.e) + 1;
  for (x.s = i, i = P < 0 ? 0 : P, m.unshift(0); _++ < u; )
    v.push(0);
  do {
    for (p = 0; p < 10; p++) {
      if (u != (_ = v.length))
        $ = u > _ ? 1 : -1;
      else
        for (y = -1, $ = 0; ++y < u; )
          if (a[y] != v[y]) {
            $ = a[y] > v[y] ? 1 : -1;
            break;
          }
      if ($ < 0) {
        for (l = _ == u ? a : m; _; ) {
          if (v[--_] < l[_]) {
            for (y = _; y && !v[--y]; )
              v[y] = 9;
            --v[y], v[_] += 10;
          }
          v[_] -= l[_];
        }
        for (; !v[0]; )
          v.shift();
      } else
        break;
    }
    U[T++] = $ ? p : ++p, v[0] && $ ? v[_] = o[O] || 0 : v = [o[O]];
  } while ((O++ < R || v[0] !== pe) && i--);
  return !U[0] && T != 1 && (U.shift(), x.e--, P--), T > P && Oe(x, P, n.RM, v[0] !== pe), x;
};
ee.eq = function(e) {
  return this.cmp(e) === 0;
};
ee.gt = function(e) {
  return this.cmp(e) > 0;
};
ee.gte = function(e) {
  return this.cmp(e) > -1;
};
ee.lt = function(e) {
  return this.cmp(e) < 0;
};
ee.lte = function(e) {
  return this.cmp(e) < 1;
};
ee.minus = ee.sub = function(e) {
  var r, n, o, a, i = this, f = i.constructor, u = i.s, l = (e = new f(e)).s;
  if (u != l)
    return e.s = -l, i.plus(e);
  var p = i.c.slice(), $ = i.e, y = e.c, m = e.e;
  if (!p[0] || !y[0])
    return y[0] ? e.s = -l : p[0] ? e = new f(i) : e.s = 1, e;
  if (u = $ - m) {
    for ((a = u < 0) ? (u = -u, o = p) : (m = $, o = y), o.reverse(), l = u; l--; )
      o.push(0);
    o.reverse();
  } else
    for (n = ((a = p.length < y.length) ? p : y).length, u = l = 0; l < n; l++)
      if (p[l] != y[l]) {
        a = p[l] < y[l];
        break;
      }
  if (a && (o = p, p = y, y = o, e.s = -e.s), (l = (n = y.length) - (r = p.length)) > 0)
    for (; l--; )
      p[r++] = 0;
  for (l = r; n > u; ) {
    if (p[--n] < y[n]) {
      for (r = n; r && !p[--r]; )
        p[r] = 9;
      --p[r], p[n] += 10;
    }
    p[n] -= y[n];
  }
  for (; p[--l] === 0; )
    p.pop();
  for (; p[0] === 0; )
    p.shift(), --m;
  return p[0] || (e.s = 1, p = [m = 0]), e.c = p, e.e = m, e;
};
ee.mod = function(e) {
  var r, n = this, o = n.constructor, a = n.s, i = (e = new o(e)).s;
  if (!e.c[0])
    throw Error(Hr);
  return n.s = e.s = 1, r = e.cmp(n) == 1, n.s = a, e.s = i, r ? new o(n) : (a = o.DP, i = o.RM, o.DP = o.RM = 0, n = n.div(e), o.DP = a, o.RM = i, this.minus(n.times(e)));
};
ee.neg = function() {
  var e = new this.constructor(this);
  return e.s = -e.s, e;
};
ee.plus = ee.add = function(e) {
  var r, n, o, a = this, i = a.constructor;
  if (e = new i(e), a.s != e.s)
    return e.s = -e.s, a.minus(e);
  var f = a.e, u = a.c, l = e.e, p = e.c;
  if (!u[0] || !p[0])
    return p[0] || (u[0] ? e = new i(a) : e.s = a.s), e;
  if (u = u.slice(), r = f - l) {
    for (r > 0 ? (l = f, o = p) : (r = -r, o = u), o.reverse(); r--; )
      o.push(0);
    o.reverse();
  }
  for (u.length - p.length < 0 && (o = p, p = u, u = o), r = p.length, n = 0; r; u[r] %= 10)
    n = (u[--r] = u[r] + p[r] + n) / 10 | 0;
  for (n && (u.unshift(n), ++l), r = u.length; u[--r] === 0; )
    u.pop();
  return e.c = u, e.e = l, e;
};
ee.pow = function(e) {
  var r = this, n = new r.constructor("1"), o = n, a = e < 0;
  if (e !== ~~e || e < -jr || e > jr)
    throw Error(Ue + "exponent");
  for (a && (e = -e); e & 1 && (o = o.times(r)), e >>= 1, !!e; )
    r = r.times(r);
  return a ? n.div(o) : o;
};
ee.prec = function(e, r) {
  if (e !== ~~e || e < 1 || e > Se)
    throw Error(Ue + "precision");
  return Oe(new this.constructor(this), e, r);
};
ee.round = function(e, r) {
  if (e === pe)
    e = 0;
  else if (e !== ~~e || e < -Se || e > Se)
    throw Error(ot);
  return Oe(new this.constructor(this), e + this.e + 1, r);
};
ee.sqrt = function() {
  var e, r, n, o = this, a = o.constructor, i = o.s, f = o.e, u = new a("0.5");
  if (!o.c[0])
    return new a(o);
  if (i < 0)
    throw Error(Ne + "No square root");
  i = Math.sqrt(o + ""), i === 0 || i === 1 / 0 ? (r = o.c.join(""), r.length + f & 1 || (r += "0"), i = Math.sqrt(r), f = ((f + 1) / 2 | 0) - (f < 0 || f & 1), e = new a((i == 1 / 0 ? "5e" : (i = i.toExponential()).slice(0, i.indexOf("e") + 1)) + f)) : e = new a(i + ""), f = e.e + (a.DP += 4);
  do
    n = e, e = u.times(n.plus(o.div(n)));
  while (n.c.slice(0, f).join("") !== e.c.slice(0, f).join(""));
  return Oe(e, (a.DP -= 4) + e.e + 1, a.RM);
};
ee.times = ee.mul = function(e) {
  var r, n = this, o = n.constructor, a = n.c, i = (e = new o(e)).c, f = a.length, u = i.length, l = n.e, p = e.e;
  if (e.s = n.s == e.s ? 1 : -1, !a[0] || !i[0])
    return e.c = [e.e = 0], e;
  for (e.e = l + p, f < u && (r = a, a = i, i = r, p = f, f = u, u = p), r = new Array(p = f + u); p--; )
    r[p] = 0;
  for (l = u; l--; ) {
    for (u = 0, p = f + l; p > l; )
      u = r[p] + i[l] * a[p - l - 1] + u, r[p--] = u % 10, u = u / 10 | 0;
    r[p] = u;
  }
  for (u ? ++e.e : r.shift(), l = r.length; !r[--l]; )
    r.pop();
  return e.c = r, e;
};
ee.toExponential = function(e, r) {
  var n = this, o = n.c[0];
  if (e !== pe) {
    if (e !== ~~e || e < 0 || e > Se)
      throw Error(ot);
    for (n = Oe(new n.constructor(n), ++e, r); n.c.length < e; )
      n.c.push(0);
  }
  return De(n, !0, !!o);
};
ee.toFixed = function(e, r) {
  var n = this, o = n.c[0];
  if (e !== pe) {
    if (e !== ~~e || e < 0 || e > Se)
      throw Error(ot);
    for (n = Oe(new n.constructor(n), e + n.e + 1, r), e = e + n.e + 1; n.c.length < e; )
      n.c.push(0);
  }
  return De(n, !1, !!o);
};
ee[Symbol.for("nodejs.util.inspect.custom")] = ee.toJSON = ee.toString = function() {
  var e = this, r = e.constructor;
  return De(e, e.e <= r.NE || e.e >= r.PE, !!e.c[0]);
};
ee.toNumber = function() {
  var e = Number(De(this, !0, !0));
  if (this.constructor.strict === !0 && !this.eq(e.toString()))
    throw Error(Ne + "Imprecise conversion");
  return e;
};
ee.toPrecision = function(e, r) {
  var n = this, o = n.constructor, a = n.c[0];
  if (e !== pe) {
    if (e !== ~~e || e < 1 || e > Se)
      throw Error(Ue + "precision");
    for (n = Oe(new o(n), e, r); n.c.length < e; )
      n.c.push(0);
  }
  return De(n, e <= n.e || n.e <= o.NE || n.e >= o.PE, !!a);
};
ee.valueOf = function() {
  var e = this, r = e.constructor;
  if (r.strict === !0)
    throw Error(Ne + "valueOf disallowed");
  return De(e, e.e <= r.NE || e.e >= r.PE, !0);
};
function Fs(e, ...r) {
  const n = r.join("/");
  return e.replace(/\/+$/, "") + "/" + n.replace(/^\/+/, "");
}
function Ls(e = "", r = "") {
  return e.startsWith("data:image") || e.startsWith("blob:http") || /https?:\/\/.+/i.test(e) ? e : Fs(r, e);
}
function be(e) {
  return ha(e || 10);
}
function Ar(e) {
  return new Promise((r) => {
    var n = new XMLHttpRequest();
    n.open("GET", e), n.responseType = "blob", n.onload = function() {
      var o = n.response, a = new FileReader();
      a.onloadend = function() {
        var i = a.result;
        r(i);
      }, a.readAsDataURL(o);
    }, n.send();
  });
}
function ke(e) {
  return URL.createObjectURL(Ns(e));
}
function Ns(e) {
  const r = e.split(","), n = r[0].match(/:(.*?);/)[1], o = atob(r[1]);
  let a = o.length;
  const i = new Uint8Array(a);
  for (; a--; )
    i[a] = o.charCodeAt(a);
  return new Blob([i], {
    type: n
  });
}
function Us() {
  const e = window.navigator.userAgent.toLowerCase(), r = /micromessenger/.test(e), n = /iphone|ipad|ipod|ios/.test(e);
  return r && n;
}
function Dr(e, r, n) {
  return new Promise((o, a) => {
    const i = document.createElement(n || "video");
    i.preload = "auto", i.crossOrigin = "Anonymous", i.autoplay = !1, i.src = e, i.setAttribute("playsinline", ""), i.setAttribute("webkit-playsinline", ""), i.setAttribute("x5-video-player-type", "h5"), i.setAttribute("x5-video-player-fullscreen", "false");
    try {
      i.load();
    } catch (f) {
      console.warn("iOS微信中load()可能受限:", f);
    }
    if (r !== void 0 && (i.currentTime = r), Us())
      setTimeout(() => {
        o(i);
      }, 3e3);
    else {
      const f = () => {
        console.log("媒体加载成功"), l(), o(i);
      }, u = (p) => {
        console.error("媒体加载失败", e, p), l(), a(p);
      }, l = () => {
        i.removeEventListener("loadedmetadata", f), i.removeEventListener("canplay", f), i.removeEventListener("error", u);
      };
      i.addEventListener("loadedmetadata", f), i.addEventListener("canplay", f), i.addEventListener("error", u);
    }
  });
}
var we = {}, Yr = {}, he = {};
Object.defineProperty(he, "__esModule", {
  value: !0
});
he.loop = he.conditional = he.parse = void 0;
var Ws = function e(r, n) {
  var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : o;
  if (Array.isArray(n))
    n.forEach(function(f) {
      return e(r, f, o, a);
    });
  else if (typeof n == "function")
    n(r, o, a, e);
  else {
    var i = Object.keys(n)[0];
    Array.isArray(n[i]) ? (a[i] = {}, e(r, n[i], o, a[i])) : a[i] = n[i](r, o, a, e);
  }
  return o;
};
he.parse = Ws;
var zs = function(r, n) {
  return function(o, a, i, f) {
    n(o, a, i) && f(o, r, a, i);
  };
};
he.conditional = zs;
var Vs = function(r, n) {
  return function(o, a, i, f) {
    for (var u = [], l = o.pos; n(o, a, i); ) {
      var p = {};
      if (f(o, r, a, p), o.pos === l)
        break;
      l = o.pos, u.push(p);
    }
    return u;
  };
};
he.loop = Vs;
var oe = {};
Object.defineProperty(oe, "__esModule", {
  value: !0
});
oe.readBits = oe.readArray = oe.readUnsigned = oe.readString = oe.peekBytes = oe.readBytes = oe.peekByte = oe.readByte = oe.buildStream = void 0;
var Hs = function(r) {
  return {
    data: r,
    pos: 0
  };
};
oe.buildStream = Hs;
var Gr = function() {
  return function(r) {
    return r.data[r.pos++];
  };
};
oe.readByte = Gr;
var Ys = function() {
  var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
  return function(n) {
    return n.data[n.pos + r];
  };
};
oe.peekByte = Ys;
var it = function(r) {
  return function(n) {
    return n.data.subarray(n.pos, n.pos += r);
  };
};
oe.readBytes = it;
var Gs = function(r) {
  return function(n) {
    return n.data.subarray(n.pos, n.pos + r);
  };
};
oe.peekBytes = Gs;
var qs = function(r) {
  return function(n) {
    return Array.from(it(r)(n)).map(function(o) {
      return String.fromCharCode(o);
    }).join("");
  };
};
oe.readString = qs;
var Ks = function(r) {
  return function(n) {
    var o = it(2)(n);
    return r ? (o[1] << 8) + o[0] : (o[0] << 8) + o[1];
  };
};
oe.readUnsigned = Ks;
var Js = function(r, n) {
  return function(o, a, i) {
    for (var f = typeof n == "function" ? n(o, a, i) : n, u = it(r), l = new Array(f), p = 0; p < f; p++)
      l[p] = u(o);
    return l;
  };
};
oe.readArray = Js;
var Xs = function(r, n, o) {
  for (var a = 0, i = 0; i < o; i++)
    a += r[n + i] && Math.pow(2, o - i - 1);
  return a;
}, Zs = function(r) {
  return function(n) {
    for (var o = Gr()(n), a = new Array(8), i = 0; i < 8; i++)
      a[7 - i] = !!(o & 1 << i);
    return Object.keys(r).reduce(function(f, u) {
      var l = r[u];
      return l.length ? f[u] = Xs(a, l.index, l.length) : f[u] = a[l.index], f;
    }, {});
  };
};
oe.readBits = Zs;
(function(e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var r = he, n = oe, o = {
    blocks: function(m) {
      for (var O = 0, R = [], v = m.data.length, _ = 0, x = (0, n.readByte)()(m); x !== O && x; x = (0, n.readByte)()(m)) {
        if (m.pos + x >= v) {
          var U = v - m.pos;
          R.push((0, n.readBytes)(U)(m)), _ += U;
          break;
        }
        R.push((0, n.readBytes)(x)(m)), _ += x;
      }
      for (var T = new Uint8Array(_), P = 0, j = 0; j < R.length; j++)
        T.set(R[j], P), P += R[j].length;
      return T;
    }
  }, a = (0, r.conditional)({
    gce: [{
      codes: (0, n.readBytes)(2)
    }, {
      byteSize: (0, n.readByte)()
    }, {
      extras: (0, n.readBits)({
        future: {
          index: 0,
          length: 3
        },
        disposal: {
          index: 3,
          length: 3
        },
        userInput: {
          index: 6
        },
        transparentColorGiven: {
          index: 7
        }
      })
    }, {
      delay: (0, n.readUnsigned)(!0)
    }, {
      transparentColorIndex: (0, n.readByte)()
    }, {
      terminator: (0, n.readByte)()
    }]
  }, function(y) {
    var m = (0, n.peekBytes)(2)(y);
    return m[0] === 33 && m[1] === 249;
  }), i = (0, r.conditional)({
    image: [{
      code: (0, n.readByte)()
    }, {
      descriptor: [{
        left: (0, n.readUnsigned)(!0)
      }, {
        top: (0, n.readUnsigned)(!0)
      }, {
        width: (0, n.readUnsigned)(!0)
      }, {
        height: (0, n.readUnsigned)(!0)
      }, {
        lct: (0, n.readBits)({
          exists: {
            index: 0
          },
          interlaced: {
            index: 1
          },
          sort: {
            index: 2
          },
          future: {
            index: 3,
            length: 2
          },
          size: {
            index: 5,
            length: 3
          }
        })
      }]
    }, (0, r.conditional)({
      lct: (0, n.readArray)(3, function(y, m, O) {
        return Math.pow(2, O.descriptor.lct.size + 1);
      })
    }, function(y, m, O) {
      return O.descriptor.lct.exists;
    }), {
      data: [{
        minCodeSize: (0, n.readByte)()
      }, o]
    }]
  }, function(y) {
    return (0, n.peekByte)()(y) === 44;
  }), f = (0, r.conditional)({
    text: [{
      codes: (0, n.readBytes)(2)
    }, {
      blockSize: (0, n.readByte)()
    }, {
      preData: function(m, O, R) {
        return (0, n.readBytes)(R.text.blockSize)(m);
      }
    }, o]
  }, function(y) {
    var m = (0, n.peekBytes)(2)(y);
    return m[0] === 33 && m[1] === 1;
  }), u = (0, r.conditional)({
    application: [{
      codes: (0, n.readBytes)(2)
    }, {
      blockSize: (0, n.readByte)()
    }, {
      id: function(m, O, R) {
        return (0, n.readString)(R.blockSize)(m);
      }
    }, o]
  }, function(y) {
    var m = (0, n.peekBytes)(2)(y);
    return m[0] === 33 && m[1] === 255;
  }), l = (0, r.conditional)({
    comment: [{
      codes: (0, n.readBytes)(2)
    }, o]
  }, function(y) {
    var m = (0, n.peekBytes)(2)(y);
    return m[0] === 33 && m[1] === 254;
  }), p = [
    {
      header: [{
        signature: (0, n.readString)(3)
      }, {
        version: (0, n.readString)(3)
      }]
    },
    {
      lsd: [{
        width: (0, n.readUnsigned)(!0)
      }, {
        height: (0, n.readUnsigned)(!0)
      }, {
        gct: (0, n.readBits)({
          exists: {
            index: 0
          },
          resolution: {
            index: 1,
            length: 3
          },
          sort: {
            index: 4
          },
          size: {
            index: 5,
            length: 3
          }
        })
      }, {
        backgroundColorIndex: (0, n.readByte)()
      }, {
        pixelAspectRatio: (0, n.readByte)()
      }]
    },
    (0, r.conditional)({
      gct: (0, n.readArray)(3, function(y, m) {
        return Math.pow(2, m.lsd.gct.size + 1);
      })
    }, function(y, m) {
      return m.lsd.gct.exists;
    }),
    // content frames
    {
      frames: (0, r.loop)([a, u, l, i, f], function(y) {
        var m = (0, n.peekByte)()(y);
        return m === 33 || m === 44;
      })
    }
  ], $ = p;
  e.default = $;
})(Yr);
var st = {};
Object.defineProperty(st, "__esModule", {
  value: !0
});
st.deinterlace = void 0;
var Qs = function(r, n) {
  for (var o = new Array(r.length), a = r.length / n, i = function(m, O) {
    var R = r.slice(O * n, (O + 1) * n);
    o.splice.apply(o, [m * n, n].concat(R));
  }, f = [0, 4, 2, 1], u = [8, 8, 4, 2], l = 0, p = 0; p < 4; p++)
    for (var $ = f[p]; $ < a; $ += u[p])
      i($, l), l++;
  return o;
};
st.deinterlace = Qs;
var ut = {};
Object.defineProperty(ut, "__esModule", {
  value: !0
});
ut.lzw = void 0;
var eu = function(r, n, o) {
  var a = 4096, i = -1, f = o, u, l, p, $, y, m, O, W, R, v, j, _, K, Y, X, se, x = new Array(o), U = new Array(a), T = new Array(a), P = new Array(a + 1);
  for (_ = r, l = 1 << _, y = l + 1, u = l + 2, O = i, $ = _ + 1, p = (1 << $) - 1, R = 0; R < l; R++)
    U[R] = 0, T[R] = R;
  var j, W, K, Y, se, X;
  for (j = W = K = Y = se = X = 0, v = 0; v < f; ) {
    if (Y === 0) {
      if (W < $) {
        j += n[X] << W, W += 8, X++;
        continue;
      }
      if (R = j & p, j >>= $, W -= $, R > u || R == y)
        break;
      if (R == l) {
        $ = _ + 1, p = (1 << $) - 1, u = l + 2, O = i;
        continue;
      }
      if (O == i) {
        P[Y++] = T[R], O = R, K = R;
        continue;
      }
      for (m = R, R == u && (P[Y++] = K, R = O); R > l; )
        P[Y++] = T[R], R = U[R];
      K = T[R] & 255, P[Y++] = K, u < a && (U[u] = O, T[u] = K, u++, !(u & p) && u < a && ($++, p += u)), O = m;
    }
    Y--, x[se++] = P[Y], v++;
  }
  for (v = se; v < f; v++)
    x[v] = 0;
  return x;
};
ut.lzw = eu;
Object.defineProperty(we, "__esModule", {
  value: !0
});
var qr = we.decompressFrames = we.decompressFrame = Kr = we.parseGIF = void 0, tu = iu(Yr), ru = he, nu = oe, au = st, ou = ut;
function iu(e) {
  return e && e.__esModule ? e : { default: e };
}
var su = function(r) {
  var n = new Uint8Array(r);
  return (0, ru.parse)((0, nu.buildStream)(n), tu.default);
}, Kr = we.parseGIF = su, uu = function(r) {
  for (var n = r.pixels.length, o = new Uint8ClampedArray(n * 4), a = 0; a < n; a++) {
    var i = a * 4, f = r.pixels[a], u = r.colorTable[f] || [0, 0, 0];
    o[i] = u[0], o[i + 1] = u[1], o[i + 2] = u[2], o[i + 3] = f !== r.transparentIndex ? 255 : 0;
  }
  return o;
}, Jr = function(r, n, o) {
  if (!r.image) {
    console.warn("gif frame does not have associated image.");
    return;
  }
  var a = r.image, i = a.descriptor.width * a.descriptor.height, f = (0, ou.lzw)(a.data.minCodeSize, a.data.blocks, i);
  a.descriptor.lct.interlaced && (f = (0, au.deinterlace)(f, a.descriptor.width));
  var u = {
    pixels: f,
    dims: {
      top: r.image.descriptor.top,
      left: r.image.descriptor.left,
      width: r.image.descriptor.width,
      height: r.image.descriptor.height
    }
  };
  return a.descriptor.lct && a.descriptor.lct.exists ? u.colorTable = a.lct : u.colorTable = n, r.gce && (u.delay = (r.gce.delay || 10) * 10, u.disposalType = r.gce.extras.disposal, r.gce.extras.transparentColorGiven && (u.transparentIndex = r.gce.transparentColorIndex)), o && (u.patch = uu(u)), u;
};
we.decompressFrame = Jr;
var cu = function(r, n) {
  return r.frames.filter(function(o) {
    return o.image;
  }).map(function(o) {
    return Jr(o, r.gct, n);
  });
};
qr = we.decompressFrames = cu;
function fu(e, r, n) {
  let o = null;
  const a = [], i = document.createElement("canvas"), f = i.getContext("2d", {
    willReadFrequently: !0
  }), u = document.createElement("canvas"), l = u.getContext("2d");
  i.width = n.lsd.width, i.height = n.lsd.height;
  for (const $ of e) {
    var p = $.dims;
    if ((!o || p.width != o.width || p.height != o.height) && (u.width = p.width, u.height = p.height, o = l.createImageData(p.width, p.height)), o.data.set($.patch), l.putImageData(o, 0, 0), f.drawImage(u, p.left, p.top), r === "base64")
      a.push(i.toDataURL());
    else {
      const y = i.toDataURL();
      a.push(y);
    }
  }
  return a;
}
const lu = (e) => {
  let r = null;
  for (const n of e.frames)
    r = n.gce ?? r, "image" in n && !("gce" in n) && (n.gce = r);
};
async function du(e, r = "base64") {
  var u, l;
  const o = await (await fetch(e)).arrayBuffer(), a = Kr(o);
  lu(a);
  const i = a.frames[~~(a.frames.length / 2)] || {
    gce: {
      delay: 0.1
    }
  }, f = qr(a, !0);
  try {
    return {
      gifArr: r === "base64" ? fu(f, r, a) : f,
      totalFrame: a.frames.length,
      delayFrame: i.gce && i.gce.delay / 100 || 0.1,
      width: (u = a.lsd) == null ? void 0 : u.width,
      height: (l = a.lsd) == null ? void 0 : l.height
    };
  } catch (p) {
    return console.error("gif2frames err", p), null;
  }
}
function pu(e) {
  const r = e.split(",");
  if (!r[1])
    return !1;
  const n = r[0].match(/:(.*?);/)[1], o = atob(r[1]);
  let a = o.length;
  const i = new Uint8Array(a);
  for (; a--; )
    i[a] = o.charCodeAt(a);
  return new Blob([i], {
    type: n
  });
}
function hu(e) {
  if (!e.ok)
    throw new Error(`${e.status} (${e.statusText})`);
  return e.arrayBuffer();
}
class Mr {
  constructor({
    url: r,
    buffer: n,
    maxWidth: o
  }) {
    this.url = r || null, this.audioBuffer = n || null, this.context = new AudioContext(), this.maxWidth = o || 1e4;
  }
  set _url(r) {
    this.url = r;
  }
  _getPeaks(r, n, o) {
    const a = this.audioBuffer.duration * 50, i = this.audioBuffer.length / a, f = ~~(i / 10) || 1, u = Array.isArray(n) ? n : [];
    for (let l = 0; l < a; l++) {
      const p = ~~(l * i), $ = ~~(p + i);
      let y = r[0], m = r[0];
      for (let O = p; O < $; O += f) {
        const R = r[O];
        R > m && (m = R), R < y && (y = R);
      }
      (o === 0 || m > u[2 * l]) && (u[2 * l] = m), (o === 0 || y < u[2 * l + 1]) && (u[2 * l + 1] = y);
    }
    return u;
  }
  /**
   * @return {String} path of SVG path element
   */
  _svgPath(r) {
    const n = r.length;
    let o = "";
    for (let a = 0; a < n; a++)
      a % 2 === 0 ? o += ` M${~~(a / 2)}, ${r.shift()}` : o += ` L${~~(a / 2)}, ${r.shift()}`;
    return o;
  }
  splitAndAverage(r, n) {
    if (n <= 0)
      return [];
    const o = [];
    for (let a = 0; a < r.length; a += n) {
      const i = r.slice(a, a + n);
      i.length > 0 && o.push(Math.max(...i));
    }
    return o;
  }
  // 获取到音频图片，通过svg转图片
  async images(r, n, o) {
    const a = this.maxWidth, i = Math.ceil(r / a), f = document.createElement("canvas"), u = 12;
    f.width = Math.min(r, a), f.height = u;
    const l = o || this.getPeaks(), p = 2, $ = 2, y = Math.ceil(r / (p + $) / n), m = this.distributeNumbers(l, y).map((_) => Math.max(..._, 0));
    i > 1 && (f.width = a);
    const O = f.getContext("2d");
    O.lineWidth = 2, O.strokeStyle = "rgb(255, 255, 255)";
    const R = [];
    let v = 0;
    for (let _ = 0; _ < i; _++) {
      O.clearRect(0, 0, f.width, f.height), O.beginPath();
      for (let T = v; T < m.length; T++) {
        let P = (T - v) * (p + $);
        if (P <= a) {
          let j = (1 - m[T]) * u;
          if (O.beginPath(), O.moveTo(P, u), O.lineTo(P, j), O.strokeStyle = "rgb(255, 255, 255)", O.stroke(), m[T] > 0.6 && (O.beginPath(), O.moveTo(P, u * (1 - 0.6)), O.lineTo(P, j), O.strokeStyle = "rgb(229, 60, 7)", O.stroke()), P === a) {
            v = T + 1;
            break;
          }
        }
      }
      const x = f.toDataURL("image/png"), U = pu(x);
      R.push(URL.createObjectURL(U));
    }
    return f.remove(), R;
  }
  sleep(r) {
    return new Promise((n) => {
      setTimeout(() => {
        n(null);
      }, r * 1e3);
    });
  }
  async loadFromUrl() {
    if (!this.url)
      return null;
    const r = await fetch(this.url), n = await hu(r);
    return this.audioBuffer = await this.context.decodeAudioData(n), this.audioBuffer;
  }
  getPeaks(r) {
    if (!this.audioBuffer)
      return console.log("No audio buffer to proccess"), null;
    const n = this.audioBuffer.numberOfChannels;
    let o = [];
    for (let i = 0; i < n; i++)
      o.push(this.audioBuffer.getChannelData(i));
    return typeof r == "function" && (o = o.reduce(r, [])), o.reduce(
      // change places of arguments in _getPeaks call
      (i, f, ...u) => this._getPeaks(f, i, ...u),
      []
    ).map((i) => this.toNum(i, 2));
  }
  toNum(r, n) {
    return n === void 0 && (n = 0), Number(r.toFixed(n));
  }
  getPath(r) {
    const n = this.getPeaks(r);
    return this._svgPath(n);
  }
  /**
   * 将数组分组
   * @param {*} arr1
   * @param {*} arr2Length
   * @returns
   */
  distributeNumbers(r, n) {
    for (var o = r.length / n, a = [], i = 0; i < n; i++) {
      var f = Math.round(i * o), u = Math.round((i + 1) * o), l = r.slice(f, u);
      a.push(l);
    }
    return a;
  }
}
var et = { exports: {} };
et.exports;
(function(e, r) {
  (function(n, o) {
    var a = {};
    n.PubSub ? (a = n.PubSub, console.warn("PubSub already loaded, using existing version")) : (n.PubSub = a, o(a)), e !== void 0 && e.exports && (r = e.exports = a), r.PubSub = a, e.exports = r = a;
  })(typeof window == "object" && window || _e, function(n) {
    var o = {}, a = -1, i = "*";
    function f(v) {
      var _;
      for (_ in v)
        if (Object.prototype.hasOwnProperty.call(v, _))
          return !0;
      return !1;
    }
    function u(v) {
      return function() {
        throw v;
      };
    }
    function l(v, _, x) {
      try {
        v(_, x);
      } catch (U) {
        setTimeout(u(U), 0);
      }
    }
    function p(v, _, x) {
      v(_, x);
    }
    function $(v, _, x, U) {
      var T = o[_], P = U ? p : l, j;
      if (Object.prototype.hasOwnProperty.call(o, _))
        for (j in T)
          Object.prototype.hasOwnProperty.call(T, j) && P(T[j], v, x);
    }
    function y(v, _, x) {
      return function() {
        var T = String(v), P = T.lastIndexOf(".");
        for ($(v, v, _, x); P !== -1; )
          T = T.substr(0, P), P = T.lastIndexOf("."), $(v, T, _, x);
        $(v, i, _, x);
      };
    }
    function m(v) {
      var _ = String(v), x = !!(Object.prototype.hasOwnProperty.call(o, _) && f(o[_]));
      return x;
    }
    function O(v) {
      for (var _ = String(v), x = m(_) || m(i), U = _.lastIndexOf("."); !x && U !== -1; )
        _ = _.substr(0, U), U = _.lastIndexOf("."), x = m(_);
      return x;
    }
    function R(v, _, x, U) {
      v = typeof v == "symbol" ? v.toString() : v;
      var T = y(v, _, U), P = O(v);
      return P ? (x === !0 ? T() : setTimeout(T, 0), !0) : !1;
    }
    n.publish = function(v, _) {
      return R(v, _, !1, n.immediateExceptions);
    }, n.publishSync = function(v, _) {
      return R(v, _, !0, n.immediateExceptions);
    }, n.subscribe = function(v, _) {
      if (typeof _ != "function")
        return !1;
      v = typeof v == "symbol" ? v.toString() : v, Object.prototype.hasOwnProperty.call(o, v) || (o[v] = {});
      var x = "uid_" + String(++a);
      return o[v][x] = _, x;
    }, n.subscribeAll = function(v) {
      return n.subscribe(i, v);
    }, n.subscribeOnce = function(v, _) {
      var x = n.subscribe(v, function() {
        n.unsubscribe(x), _.apply(this, arguments);
      });
      return n;
    }, n.clearAllSubscriptions = function() {
      o = {};
    }, n.clearSubscriptions = function(_) {
      var x;
      for (x in o)
        Object.prototype.hasOwnProperty.call(o, x) && x.indexOf(_) === 0 && delete o[x];
    }, n.countSubscriptions = function(_) {
      var x, U, T = 0;
      for (x in o)
        if (Object.prototype.hasOwnProperty.call(o, x) && x.indexOf(_) === 0) {
          for (U in o[x])
            T++;
          break;
        }
      return T;
    }, n.getSubscriptions = function(_) {
      var x, U = [];
      for (x in o)
        Object.prototype.hasOwnProperty.call(o, x) && x.indexOf(_) === 0 && U.push(x);
      return U;
    }, n.unsubscribe = function(v) {
      var _ = function(Y) {
        var se;
        for (se in o)
          if (Object.prototype.hasOwnProperty.call(o, se) && se.indexOf(Y) === 0)
            return !0;
        return !1;
      }, x = typeof v == "string" && (Object.prototype.hasOwnProperty.call(o, v) || _(v)), U = !x && typeof v == "string", T = typeof v == "function", P = !1, j, W, K;
      if (x) {
        n.clearSubscriptions(v);
        return;
      }
      for (j in o)
        if (Object.prototype.hasOwnProperty.call(o, j)) {
          if (W = o[j], U && W[v]) {
            delete W[v], P = v;
            break;
          }
          if (T)
            for (K in W)
              Object.prototype.hasOwnProperty.call(W, K) && W[K] === v && (delete W[K], P = !0);
        }
      return P;
    };
  });
})(et, et.exports);
et.exports;
async function Xr(e) {
  return new Promise((r) => {
    window.MediaInfo.mediaInfoFactory({
      format: "JSON"
      // locateFile: path => {
      //   if (path.endsWith('.wasm')) {
      //     return '/assets/MediaInfoModule.wasm'; // 自定义路径
      //   }
      //   return path; // 其他文件使用默认路径
      // },
    }, async (n) => {
      const o = await n.analyzeData(e.size, async (a, i) => new Uint8Array(await e.slice(i, i + a).arrayBuffer())).then((a) => a).catch((a) => {
        console.error(`An error occured:
${a.stack}`);
      });
      r(JSON.parse(o));
    });
  });
}
async function vu(e) {
  let {
    url: r,
    type: n,
    workerPath: o = "/assets/worker",
    uploadBase64: a,
    file: i,
    reURL: f
  } = e;
  switch (n || (n = da(r)), f || (f = Ls), n) {
    case "audio": {
      const u = await Dr(f(r), void 0, "audio"), l = new Mr({
        url: f(r),
        buffer: null,
        maxWidth: 1e4
      });
      await l.loadFromUrl();
      const p = await l.getPeaks(), $ = "data:text/text;base64," + btoa(JSON.stringify(p));
      if (a) {
        const [y, m] = await a({
          content: $,
          name: be() + ".json"
          // file_type: 'json',
        });
        return m && console.error("上传wave base64 到服务器出现异常:", m), {
          wave: y ? y.storage_path : "",
          duration: u.duration
        };
      } else
        return {
          wave: $,
          duration: u.duration,
          _localURL: ke($)
        };
    }
    case "image":
    case "image/svg": {
      const u = await Rt(r, 200);
      if (a) {
        const [l] = await a({
          content: u._base64,
          name: be() + ".png",
          file_type: "image"
        });
        return {
          ...u,
          thumb: l.storage_path
        };
      } else
        return {
          ...u,
          _localURL: ke(u._base64)
        };
    }
    case "image/gif": {
      const u = await Rt(r, 200), {
        gifArr: l,
        delayFrame: p,
        totalFrame: $
      } = await du(r, "base64"), y = u.naturalWidth / u.naturalHeight, m = await en({
        gifArr: l,
        delayFrame: p,
        totalFrame: $
      }, y, 50);
      if (a) {
        const [O, R] = await Promise.all([a({
          content: u._base64,
          name: be() + ".png",
          file_type: "image"
        }).then((v) => {
          var _;
          return (_ = v[0]) == null ? void 0 : _.storage_path;
        }), a({
          content: m,
          name: be() + ".png",
          file_type: "image"
        }).then((v) => {
          var _;
          return (_ = v[0]) == null ? void 0 : _.storage_path;
        })]);
        return {
          ...u,
          delayFrame: p,
          totalFrame: $,
          thumb: O,
          frames: R
        };
      } else
        return {
          ...u,
          frames: m,
          _localThumb: ke(u.base64),
          _localFrames: ke(m)
        };
    }
    case "video": {
      let u = null, l = null;
      if (i) {
        const P = await Xr(i);
        console.log("MediaInfo 输出信息 >>", P), l = P.media.track.find((j) => j["@type"].toLocaleLowerCase() === "video"), u = P.media.track.find((j) => j["@type"].toLocaleLowerCase() === "audio");
      }
      const p = await Dr(f(r), 1, "video"), $ = await pa(p, 200, 3), y = p.videoWidth / p.videoHeight, m = 2;
      console.log("aspectRatio", y), console.dir(p);
      let O;
      const R = await fa(f(r));
      u && parseInt(u.Duration, 10) === 0 && (console.warn("音频轨道异常，时长为0"), u = null);
      const v = await Zr({
        url: f(r),
        aspectRatio: y,
        audioTrack: u,
        videoRotation: Number((l == null ? void 0 : l.Rotation) || 0),
        frameScale: m,
        duration: R.duration,
        workerPath: o
      });
      console.warn("解码获取视频帧数据", {
        url: f(r),
        aspectRatio: y,
        audioTrack: u,
        rotation: Number((l == null ? void 0 : l.Rotation) || 0),
        frameScale: m
      }, v), typeof v == "object" && (O = v.url);
      const {
        duration: _,
        videoHeight: x,
        videoWidth: U
      } = p;
      let T = null;
      if (u) {
        const P = new Mr({
          url: r,
          buffer: null,
          maxWidth: 1e4
        });
        await P.loadFromUrl();
        const j = await P.getPeaks();
        T = "data:text/text;base64," + btoa(JSON.stringify(j));
      }
      if (a) {
        let P, j, W;
        return $ && (P = await a({
          content: $,
          name: be() + ".png",
          file_type: "image"
        }).then((K) => {
          var Y;
          return (Y = K[0]) == null ? void 0 : Y.storage_path;
        })), O && (j = await a({
          content: await Ar(O),
          name: be() + ".png",
          file_type: "image"
        }).then((K) => {
          var Y;
          return (Y = K[0]) == null ? void 0 : Y.storage_path;
        })), T && (W = await a({
          content: T,
          name: be() + ".json"
        }).then((K) => {
          var Y;
          return (Y = K[0]) == null ? void 0 : Y.storage_path;
        })), console.log("Number(videoTrack.rotation || 0)", l, Number((l == null ? void 0 : l.Rotation) || 0)), {
          rotate: v.rotate,
          noAudioTracks: !u,
          thumb: P,
          frames: j,
          frameScale: m || 1,
          wave: W,
          rotation: Number((l == null ? void 0 : l.Rotation) || 0),
          duration: _,
          videoWidth: U,
          videoHeight: x
        };
      } else
        return {
          rotate: v.rotate,
          noAudioTracks: !u,
          thumb: $,
          frames: await Ar(O),
          frameScale: m || 1,
          wave: T,
          duration: _,
          videoWidth: U,
          videoHeight: x,
          _localThumb: ke($),
          _localFrames: O,
          _localWave: T ? ke(T) : ""
        };
    }
    default:
      throw new Error("未知文件类型" + r);
  }
}
async function Zr(e) {
  return new Promise((r) => {
    const {
      url: n,
      aspectRatio: o,
      duration: a,
      // 部分AI生成的视频获取不到movie_duration
      audioTrack: i,
      videoRotation: f,
      frameScale: u,
      workerPath: l = ""
    } = e;
    Qr({
      url: n,
      workerPath: l + "/decode.worker.js",
      aspectRatio: o,
      frameHeight: 50,
      duration: a,
      videoRotation: f,
      noAudioTracks: !i,
      frameScale: u
    }, "decodeFrameImage", (p) => {
      switch (console.log("---->", p), p.type) {
        case "drawFrameImageSuccess":
          r(p.data);
          break;
        case "drawFrameImageBefore":
          console.log("waiting...");
          break;
        case "end":
          r("end");
          break;
        default:
          console.error(p), r("error");
      }
    });
  });
}
function Qr(e, r, n) {
  const a = document.createElement("canvas").transferControlToOffscreen(), i = new Worker(e.workerPath);
  i.postMessage({
    type: r,
    canvas: a,
    options: {
      ...e
    }
  }, [a]), i.onmessage = function(f) {
    n({
      data: f.data.data,
      type: f.data.type,
      workerInstance: i
    });
  };
}
function Rt(e, r) {
  return new Promise((n) => {
    const o = new Image();
    o.crossOrigin = "anonymous", o.src = e, o.onload = async () => {
      const a = r, i = o.height / o.width * r, f = document.createElement("canvas");
      f.width = a, f.height = i, f.getContext("2d").drawImage(o, 0, 0, a, i), n({
        _base64: f.toDataURL(),
        naturalWidth: o.naturalWidth,
        naturalHeight: o.naturalHeight
      });
    };
  });
}
async function en(e, r, n = 50) {
  const {
    gifArr: o,
    delayFrame: a,
    totalFrame: i
  } = e, f = document.createElement("canvas"), u = r * n, l = f.getContext("2d"), p = Math.ceil(i * a);
  f.height = n, f.width = u * p;
  for (let $ = 0; $ < p; $++) {
    let y = Math.round($ / a);
    y > o.length - 1 && (y = o.length - 1);
    const m = await tn(o[y]);
    l.drawImage(m, $ * u, 0, u, n);
  }
  return f.toDataURL("image/jpeg", 0.7);
}
function tn(e) {
  return new Promise((r) => {
    const n = new Image();
    n.crossOrigin = "anonymous", n.src = e, n.onload = () => {
      r(n);
    };
  });
}
const gu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  decoderVideo: Qr,
  decoderVideoDrawFrameImage: Zr,
  getUploadBeforeData: vu,
  gifArr2FrameImage: en,
  imageThumb: Rt,
  lazyBase64: tn,
  mediaInfo: Xr
}, Symbol.toStringTag, { value: "Module" }));
export {
  gu as uploadInfo
};

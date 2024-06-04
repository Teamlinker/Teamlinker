var ce = Object.defineProperty;
var he = (E, e, s) => e in E ? ce(E, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : E[e] = s;
var w = (E, e, s) => (he(E, typeof e != "symbol" ? e + "" : e, s), s);
import { nextTick as M, toRaw as Q, reactive as pe, defineComponent as te, ref as V, openBlock as D, createElementBlock as X, Fragment as U, renderList as Y, normalizeStyle as le, toDisplayString as de, onBeforeMount as ue, withModifiers as fe, createElementVNode as $, withDirectives as me, vModelText as ge, createCommentVNode as ee, createTextVNode as ye, getCurrentInstance as Ee, watch as ie, onBeforeUnmount as xe, mergeProps as Ie, unref as G, withKeys as se, createBlock as re, Teleport as oe, createVNode as ae } from "vue";
var y = /* @__PURE__ */ ((E) => (E[E.TEXT = 0] = "TEXT", E[E.LINK = 1] = "LINK", E[E.IMAGE = 2] = "IMAGE", E))(y || {});
class b {
  static handle(e, s) {
    let o = "";
    for (let t of e.arr) {
      let i;
      if (t.type == y.TEXT)
        if (t.style && Object.keys(t.style).length > 0) {
          if (i = document.createElement("span"), i.innerText = t.value, t.style)
            for (let l in t.style)
              i.style[l] = t.style[l];
        } else {
          o += t.value;
          continue;
        }
      else
        t.type == y.LINK ? i = document.createElement("a") : t.type == y.IMAGE ? i = document.createElement("img") : i = document.createElement("a"), s == null || s(i, t);
      i && (o += i.outerHTML);
    }
    return o;
  }
  static handleInnerHtml(e, s, o = !1, t) {
    e.selectEndIndexPath = [], e.selectStartIndexPath = [], e.arr = [], s.childNodes.forEach((a) => {
      var p, u, h, f, g, k, I, L;
      if (a.nodeType == Node.TEXT_NODE) {
        let O = {
          value: a.nodeValue,
          style: {},
          type: y.TEXT
        };
        e.arr.push(O);
      } else if (a.nodeType == Node.ELEMENT_NODE) {
        let O = {
          value: "",
          style: {}
        }, v = a;
        v.tagName == "SPAN" ? (O.type = y.TEXT, O.value = v.innerText ?? "") : t == null || t(O, v), (p = v.style) != null && p.color && (O.style.color = (u = v.style) == null ? void 0 : u.color), (h = v.style) != null && h.fontStyle && (O.style.fontStyle = v.style.fontStyle), (f = v.style) != null && f.fontWeight && (O.style.fontWeight = v.style.fontWeight), (g = v.style) != null && g.fontSize && (O.style.fontSize = v.style.fontSize), (k = v.style) != null && k.backgroundColor && (O.style.backgroundColor = (I = v.style) == null ? void 0 : I.backgroundColor), (L = v.style) != null && L.textDecoration && (O.style.textDecoration = v.style.textDecoration), e.arr.push(O);
      }
    });
    let i = window.getSelection(), l;
    i.rangeCount > 0 ? l = i.getRangeAt(0) : (l = document.createRange(), l.selectNodeContents(s), l.collapse(!1));
    let n = l.startOffset, r = l.endOffset, c = l.startContainer, d = l.endContainer;
    if (s.contains(c))
      if (s == c)
        c.childNodes.length == 0 || n >= c.childNodes.length ? e.selectStartIndexPath = [n > 0 ? n - 1 : 0, c.childNodes.length == 0 ? 0 : c.lastChild.textContent ? c.lastChild.textContent.length : 0] : e.selectStartIndexPath = [n, 0];
      else {
        e.selectStartIndexPath.unshift(n);
        let a = c.parentElement;
        a == s ? (n = Array.from(a.childNodes).indexOf(c), e.selectStartIndexPath.unshift(n)) : (n = Array.from(a.parentElement.childNodes).indexOf(a), e.selectStartIndexPath.unshift(n));
      }
    if (s.contains(d))
      if (s == d)
        d.childNodes.length == 0 || r >= d.childNodes.length ? e.selectEndIndexPath = [r > 0 ? r - 1 : 0, d.childNodes.length == 0 ? 0 : d.lastChild.textContent ? d.lastChild.textContent.length : 0] : e.selectEndIndexPath = [r, 0];
      else {
        e.selectEndIndexPath.unshift(r);
        let a = d.parentElement;
        a == s ? (r = Array.from(a.childNodes).indexOf(d), e.selectEndIndexPath.unshift(r)) : (r = Array.from(a.parentElement.childNodes).indexOf(a), e.selectEndIndexPath.unshift(r));
      }
    if (o) {
      for (; c.tagName !== "DIV"; )
        c = c.parentElement;
      for (; d.tagName !== "DIV"; )
        d = d.parentElement;
      M(() => {
        if (c == s) {
          let a = c.childNodes[e.selectStartIndexPath[0]];
          if (!a)
            return;
          if (a.nodeType == Node.TEXT_NODE)
            l.setStart(a, e.selectStartIndexPath[1]);
          else if (a.nodeType == Node.ELEMENT_NODE)
            if (a.tagName == "BR") {
              l.selectNode(a);
              return;
            } else if (a.tagName == "IMG") {
              l.selectNode(a), l.collapse(!1);
              return;
            } else
              a.contentEditable == "true" && l.setStart(a.firstChild, e.selectStartIndexPath[1]);
        }
        if (d == s) {
          let a = d.childNodes[e.selectEndIndexPath[0]];
          if (!a)
            return;
          if (a.nodeType == Node.TEXT_NODE)
            l.setEnd(a, e.selectEndIndexPath[1]);
          else if (a.nodeType == Node.ELEMENT_NODE)
            if (a.tagName == "BR" || a.tagName == "IMG") {
              l.selectNode(a);
              return;
            } else
              a.contentEditable === "true" && l.setEnd(a.firstChild, e.selectEndIndexPath[1]);
        }
      });
    }
  }
  static fixLine(e, s) {
    for (let o = 1; o < e.arr.length; o++) {
      let t = e.arr[o], i = e.arr[o - 1];
      if (t.style && i.style && JSON.stringify(t.style) === JSON.stringify(i.style) && t.type == i.type && t.type == y.TEXT || !t.value && t.type != y.IMAGE) {
        let l = i.value.length;
        i.value += t.value, e.arr.splice(o, 1), o--, s && (Q(s.startItem) === Q(t) && (s.startItem = i, s.startIndex += l), Q(s.endItem) === Q(t) && (s.endItem = i, s.endIndex += l));
      }
    }
    for (let o = 0; o < e.arr.length; o++) {
      let t = e.arr[o];
      !t.value && t.type != y.IMAGE && (e.arr.splice(o, 1), o--);
    }
  }
}
function be(E, e) {
  let s = E.getLineList(), o = E.getRoot(), t = E.getSelectElementList();
  if (t.length == 1) {
    let i = s[Array.from(o.value.children).indexOf(t[0])];
    if (i.selectStartIndexPath.length > 0 && i.selectEndIndexPath.length > 0) {
      let l;
      if (i.selectEndIndexPath[0] > i.selectStartIndexPath[0]) {
        let n = i.arr[i.selectStartIndexPath[0]], r = i.arr[i.selectEndIndexPath[0]], c;
        for (let a = i.selectStartIndexPath[0]; a <= i.selectEndIndexPath[0]; a++) {
          let p = i.arr[a];
          p == n ? i.selectStartIndexPath[1] > 0 && p.link != e ? (c = {
            style: {
              ...p.style
            },
            value: p.value.substring(i.selectStartIndexPath[1]),
            type: y.LINK,
            link: e
          }, p.value = p.value.substring(0, i.selectStartIndexPath[1]), i.arr.splice(a + 1, 0, c), a++, i.selectEndIndexPath[0]++, n = c) : (p.link = e, p.type = y.LINK, n = p) : p == r ? (n.value += p.value.substring(0, i.selectEndIndexPath[1]), p.value = p.value.substring(i.selectEndIndexPath[1])) : (n.value += p.value, i.arr.splice(a, 1), a--, i.selectEndIndexPath[0]--);
        }
        let d = {
          startItem: n
        };
        b.fixLine(i, d), M(() => {
          let a = window.getSelection(), p = document.createRange(), u = t[0].childNodes[i.arr.indexOf(d.startItem)];
          p.selectNode(u), a.removeAllRanges(), a.addRange(p);
        });
      } else {
        let n = i.arr[i.selectStartIndexPath[0]];
        if (!n)
          return;
        let r, c = n.value.substring(i.selectStartIndexPath[1], i.selectEndIndexPath[1]), d = n.value.substring(0, i.selectStartIndexPath[1]), a = n.value.substring(i.selectEndIndexPath[1]);
        n.value = d, l = {
          value: c,
          style: {
            ...n.style
          },
          type: y.LINK,
          link: e
        }, i.arr.splice(i.selectStartIndexPath[0] + 1, 0, l, {
          value: a,
          style: {
            ...n.style
          },
          type: n.type,
          ...n.link && {
            link: n.link
          }
        }), b.fixLine(i), r = l, M(() => {
          let p = window.getSelection(), u = document.createRange(), h = t[0].childNodes[i.arr.indexOf(r)];
          h && (u.selectNode(h), p.removeAllRanges(), p.addRange(u));
        });
      }
    }
  }
}
function Le(E, e, s) {
  let o = E.getLineList(), t = E.getRoot(), i = E.getSelectElementList();
  if (i.length == 1) {
    let l = o[Array.from(t.value.children).indexOf(i[0])];
    if (b.handleInnerHtml(l, t.value.children[o.indexOf(l)], !1, E.onGetLineConfigType), l.arr.length == 0) {
      let n = {
        type: y.IMAGE,
        link: e,
        value: "",
        width: s
      };
      l.arr.push(n);
    } else {
      let n = l.arr[l.selectStartIndexPath[0]], r = {
        type: y.IMAGE,
        value: "",
        link: e,
        width: s
      }, c = JSON.parse(JSON.stringify(n));
      c.type == y.IMAGE ? l.arr.splice(l.selectStartIndexPath[0] + 1, 0, r) : (c.value = c.value.substring(l.selectStartIndexPath[1]), n.value = n.value.substring(0, l.selectStartIndexPath[1]), l.arr.splice(l.selectStartIndexPath[0] + 1, 0, r, c));
    }
  }
}
function F(E, e, s) {
  let o = E.getLineList(), t = E.getRoot(), i = E.getSelectElementList();
  if (i.length == 1) {
    let l = o[Array.from(t.value.children).indexOf(i[0])];
    if (l.selectStartIndexPath.length > 0 && l.selectEndIndexPath.length > 0) {
      let n;
      if (l.selectEndIndexPath[0] > l.selectStartIndexPath[0]) {
        let r = l.arr[l.selectStartIndexPath[0]], c = l.arr[l.selectEndIndexPath[0]], d, a;
        for (let u = l.selectStartIndexPath[0]; u <= l.selectEndIndexPath[0]; u++) {
          let h = l.arr[u];
          if (h == r)
            if (l.selectStartIndexPath[1] > 0 && h.style[e] != s) {
              let f;
              if (s)
                f = {
                  style: Object.assign({}, h.style, {
                    [e]: s
                  }),
                  value: h.value.substring(l.selectStartIndexPath[1]),
                  type: y.TEXT
                };
              else {
                let g = {
                  ...h.style
                };
                delete g[e], f = {
                  style: g,
                  value: h.value.substring(l.selectStartIndexPath[1]),
                  type: y.TEXT
                };
              }
              h.value = h.value.substring(0, l.selectStartIndexPath[1]), l.arr.splice(u + 1, 0, f), u++, l.selectEndIndexPath[0]++, r = f, d = 0;
            } else
              s ? Object.assign(h.style, h.style, {
                [e]: s
              }) : delete h.style[e], r = h, d = l.selectStartIndexPath[1];
          else if (h == c)
            if (l.selectEndIndexPath[1] < h.value.length && h.style[e] != s) {
              let f;
              if (s)
                f = {
                  style: Object.assign({}, h.style, {
                    [e]: s
                  }),
                  value: h.value.substring(0, l.selectEndIndexPath[1]),
                  type: y.TEXT
                };
              else {
                let g = {
                  ...h.style
                };
                delete g[e], f = {
                  style: g,
                  value: h.value.substring(0, l.selectEndIndexPath[1]),
                  type: y.TEXT
                };
              }
              h.value = h.value.substring(l.selectEndIndexPath[1]), l.arr.splice(u, 0, f), u++, l.selectEndIndexPath[0]++, c = f, a = f.value.length;
            } else
              s ? Object.assign(h.style, h.style, {
                [e]: s
              }) : delete h.style[e], c = h, a = l.selectEndIndexPath[1];
          else
            s ? Object.assign(h.style, h.style, {
              [e]: s
            }) : delete h.style[e];
        }
        let p = {
          startItem: r,
          endItem: c,
          startIndex: d,
          endIndex: a
        };
        b.fixLine(l, p), M(() => {
          let u = window.getSelection(), h = document.createRange(), f = i[0].childNodes[l.arr.indexOf(p.startItem)], g = i[0].childNodes[l.arr.indexOf(p.endItem)];
          f.nodeType == Node.TEXT_NODE ? h.setStart(f, p.startIndex) : f.nodeType == Node.ELEMENT_NODE && (f.tagName == "IMG" ? h.setStartBefore(f) : h.setStart(f.firstChild, p.startIndex)), g.nodeType == Node.TEXT_NODE ? h.setEnd(g, p.endIndex) : g.nodeType == Node.ELEMENT_NODE && (g.tagName == "IMG" ? h.setEndAfter(g) : h.setEnd(g.firstChild, p.endIndex)), u.removeAllRanges(), u.addRange(h);
        });
      } else {
        let r = l.arr[l.selectStartIndexPath[0]];
        if (!r)
          return;
        let c, d, a;
        if (r.style[e] != s) {
          let p = r.value.substring(l.selectStartIndexPath[1], l.selectEndIndexPath[1]), u = r.value.substring(0, l.selectStartIndexPath[1]), h = r.value.substring(l.selectEndIndexPath[1]);
          if (r.value = u, s)
            n = JSON.parse(JSON.stringify(r)), n.value = p, n.style = Object.assign({}, r.style, {
              [e]: s
            });
          else {
            n = JSON.parse(JSON.stringify(r));
            let f = {
              ...r.style
            };
            delete f[e], n.value = p, n.style = f;
          }
          l.arr.splice(l.selectStartIndexPath[0] + 1, 0, n, {
            value: h,
            style: {
              ...r.style
            },
            type: y.TEXT
          }), b.fixLine(l), c = 0, d = n.value.length, a = n;
        } else
          a = r, c = l.selectStartIndexPath[1], d = l.selectEndIndexPath[1];
        M(() => {
          let p = window.getSelection(), u = document.createRange(), h = i[0].childNodes[l.arr.indexOf(a)];
          h && (h.nodeType == Node.TEXT_NODE ? (u.setStart(h, c), u.setEnd(h, d)) : h.nodeType == Node.ELEMENT_NODE && (h.tagName == "IMG" ? u.selectNode(h) : (u.setStart(h.firstChild, c), u.setEnd(h.firstChild, d))), p.removeAllRanges(), p.addRange(u));
        });
      }
    }
  } else if (i.length > 1) {
    let l = [];
    i.forEach((N) => {
      l.push(o[Array.from(t.value.children).indexOf(N)]);
    });
    let n = window.getSelection(), r = n.getRangeAt(0), c = r.startOffset, d = r.endOffset, a = r.startContainer, p = r.endContainer, u = [], h = [];
    if (a.tagName == "DIV")
      u = [c, 0];
    else {
      u.unshift(c);
      let N = a.parentElement;
      N.tagName == "DIV" ? (c = Array.from(N.childNodes).indexOf(a), u.unshift(c)) : (c = Array.from(N.parentElement.childNodes).indexOf(N), u.unshift(c));
    }
    if (p.tagName == "DIV")
      h = [d, p.childNodes[d].textContent.length];
    else {
      h.unshift(d);
      let N = p.parentElement;
      N.tagName == "DIV" ? (d = Array.from(N.childNodes).indexOf(p), h.unshift(d)) : (d = Array.from(N.parentElement.childNodes).indexOf(N), h.unshift(d));
    }
    let f = l[0], g = l[l.length - 1], k = f.arr[u[0]], I = g.arr[h[0]], L = k, O = I, v, q;
    for (let N of l)
      if (N == f)
        for (let P = u[0]; P < f.arr.length; P++) {
          let C = f.arr[P];
          if (C.style[e] != s)
            if (C == k) {
              let H;
              if (s)
                H = {
                  value: C.value.substring(u[1]),
                  style: {
                    ...C.style,
                    [e]: s
                  },
                  type: y.TEXT
                };
              else {
                let _ = {
                  ...C.style
                };
                delete _[e], H = {
                  value: C.value.substring(u[1]),
                  style: _,
                  type: y.TEXT
                };
              }
              C.value = C.value.substring(0, u[1]), f.arr.splice(P + 1, 0, H), P++, L = H, v = 0;
            } else
              s ? C.style[e] = s : delete C.style[e];
          else
            C == k && (v = u[1]);
        }
      else if (N == g)
        for (let P = 0; P <= h[0]; P++) {
          let C = g.arr[P];
          if (C.style[e] != s)
            if (C == I) {
              let H;
              if (s)
                H = {
                  value: C.value.substring(0, h[1]),
                  style: {
                    ...C.style,
                    [e]: s
                  },
                  type: y.TEXT
                };
              else {
                let _ = {
                  ...C.style
                };
                delete _[e], H = {
                  value: C.value.substring(0, h[1]),
                  style: _,
                  type: y.TEXT
                };
              }
              C.value = C.value.substring(h[1]), g.arr.splice(P, 0, H), O = H, q = H.value.length;
            } else
              s ? C.style[e] = s : delete C.style[e];
          else
            C == I && (q = h[1]);
        }
      else
        N.arr.forEach((P) => {
          P.style[e] != s && (s ? P.style[e] = s : delete P.style[e]);
        });
    let K = {
      startItem: L,
      startIndex: v
    }, J = {
      endItem: O,
      endIndex: q
    };
    for (let N of l)
      N == f ? b.fixLine(N, K) : N == g ? b.fixLine(N, J) : b.fixLine(N);
    M(() => {
      let N = i[0].childNodes[f.arr.indexOf(K.startItem)], P = i[i.length - 1].childNodes[g.arr.indexOf(J.endItem)];
      N.nodeType == Node.TEXT_NODE ? r.setStart(N, K.startIndex) : N.nodeType == Node.ELEMENT_NODE && (N.tagName == "IMG" ? r.setStartBefore(N) : r.setStart(N.firstChild, K.startIndex)), P.nodeType == Node.TEXT_NODE ? r.setEnd(P, J.endIndex) : P.nodeType == Node.ELEMENT_NODE && (P.tagName == "IMG" ? r.setEndAfter(P) : r.setEnd(P.firstChild, J.endIndex)), n.removeAllRanges(), n.addRange(r);
    });
  }
}
function W(E, e, s) {
  let o = [];
  E.getSelectionItemList().forEach((t) => {
    o.push(...t.data.filter((i) => i.type === y.TEXT || i.type === y.LINK));
  });
  for (let t of o)
    if (!t.style || t.style[e] != s)
      return !1;
  return !0;
}
class B {
  static isBold(e) {
    return W(e, "fontWeight", "bold");
  }
  static bold(e, s) {
    F(e, "fontWeight", s ? "bold" : void 0);
  }
  static isItalic(e) {
    return W(e, "fontStyle", "italic");
  }
  static italic(e, s) {
    F(e, "fontStyle", s ? "italic" : void 0);
  }
  static isUnderLine(e) {
    return W(e, "textDecoration", "underline");
  }
  static underLine(e, s) {
    F(e, "textDecoration", s ? "underline" : void 0);
  }
  static isDeleteLine(e) {
    return W(e, "textDecoration", "line-through");
  }
  static deleteLine(e, s) {
    F(e, "textDecoration", s ? "line-through" : void 0);
  }
  static fontSize(e, s) {
    F(e, "fontSize", s);
  }
  static color(e, s) {
    F(e, "color", s);
  }
  static backgroundColor(e, s) {
    F(e, "backgroundColor", s);
  }
  static link(e, s) {
    be(e, s);
  }
  static image(e, s) {
    let o = document.createElement("img");
    o.src = s, o.onload = () => {
      Le(e, s, o.width), o = null;
    };
  }
}
let j;
function Ne(E) {
  var s, o, t;
  let e = (s = window.getSelection()) == null ? void 0 : s.getRangeAt(0);
  if (E.key === "Backspace" && j && e && ((o = j.getRoot().value) != null && o.contains(e.commonAncestorContainer)) && j.getSelectElementList().length > 0 && !((t = window.getSelection().getRangeAt(0)) != null && t.collapsed)) {
    E.preventDefault(), E.stopPropagation();
    let i = j.getSelectionItemList(), l = {
      startItem: null,
      startIndex: 0
    };
    if (i.length == 1) {
      let n = i[0].line, r = n.arr[n.selectStartIndexPath[0]], c = n.arr[n.selectEndIndexPath[0]];
      if (r === c) {
        if (r.type === y.TEXT || r.type === y.LINK) {
          let d = r.value.substring(0, n.selectStartIndexPath[1]), a = r.value.substring(n.selectEndIndexPath[1]);
          r.value = d + a;
        } else
          n.arr.splice(n.selectStartIndexPath[0], 1);
        l.startItem = r, l.startIndex = n.selectStartIndexPath[1];
      } else
        for (let d of i[0].data)
          d === r ? (r.type === y.TEXT || r.type === y.LINK ? r.value = r.value.substring(0, n.selectStartIndexPath[1]) : n.arr.splice(n.arr.indexOf(r), 1), l.startItem = r, l.startIndex = n.selectStartIndexPath[1]) : d === c ? c.type === y.TEXT || c.type === y.LINK ? c.value = c.value.substring(n.selectEndIndexPath[1]) : n.arr.splice(n.arr.indexOf(c), 1) : n.arr.splice(n.arr.indexOf(d), 1);
      b.fixLine(n, l);
    } else {
      let n;
      for (let r = 0; r < i.length; r++) {
        let c = i[r], d = c.line;
        if (r == 0 || r == i.length - 1)
          if (r == 0) {
            n = d;
            for (let a = 0; a < c.data.length; a++) {
              let p = c.data[a];
              a == 0 && (p.type === y.TEXT || p.type === y.LINK) ? p.value = p.value.substring(0, d.selectStartIndexPath[1]) : d.arr.splice(d.arr.indexOf(p), 1);
            }
          } else {
            for (let a = 0; a < c.data.length; a++) {
              let p = c.data[a];
              a == c.data.length - 1 && (p.type === y.TEXT || p.type === y.LINK) ? p.value = p.value.substring(d.selectEndIndexPath[1]) : d.arr.splice(d.arr.indexOf(p), 1);
            }
            n.arr = n.arr.concat(d.arr), j.getLineList().splice(j.getLineList().indexOf(d), 1), b.fixLine(n);
          }
        else
          j.getLineList().splice(j.getLineList().indexOf(d), 1);
      }
    }
    M(() => {
      let n = window.getSelection(), r = document.createRange(), c = j.getLineList().indexOf(i[0].line), d = j.getRoot().value.children[c].childNodes[i[0].line.selectStartIndexPath[0]];
      if (d) {
        if (d.nodeType === Node.TEXT_NODE || d.tagName === "SPAN") {
          let a = d.tagName === "SPAN" ? d.innerText : d.textContent;
          i[0].line.selectStartIndexPath[1] >= a.length ? (r.setStartAfter(d), r.setEndAfter(d)) : (r.setStart(d, i[0].line.selectStartIndexPath[1]), r.setEnd(d, i[0].line.selectStartIndexPath[1]));
        } else
          r.setStartAfter(d), r.setEndAfter(d);
        n.removeAllRanges(), n.addRange(r);
        for (let a of j.getSelectElementList())
          a.contentEditable = "true";
        j.setSelectElementList([]);
      }
    });
  }
}
class Se {
  constructor(e, s, o) {
    w(this, "selectElementList", []);
    w(this, "isMouseDown", !1);
    w(this, "root");
    w(this, "lineList", pe([]));
    w(this, "imageHelperElement");
    w(this, "resizeImage");
    w(this, "resizeObserver");
    w(this, "selectionMenuElement");
    w(this, "selectionTextElement");
    w(this, "selectionLinkElement");
    w(this, "selectionColorElement");
    w(this, "linkEditElement");
    w(this, "popMenuPosition");
    w(this, "quotePosition");
    w(this, "destroyFunc");
    w(this, "destroyQuoteFunc");
    w(this, "onUploadFileFunc");
    w(this, "onPopMenuClickFunc");
    w(this, "onCustomMenuClickFunc");
    w(this, "onQuoteListFunc");
    w(this, "onSetLineConfigType");
    w(this, "onGetLineConfigType");
    this.root = e, this.popMenuPosition = s, this.quotePosition = o, document.addEventListener("keydown", Ne);
  }
  setSelectElementList(e) {
    this.selectElementList = e;
  }
  clear() {
    var e, s, o, t, i, l;
    (e = this.destroyFunc) == null || e.call(this), (s = this.destroyQuoteFunc) == null || s.call(this), (o = this.imageHelperElement) == null || o.remove(), (t = this.resizeObserver) == null || t.disconnect(), (i = this.selectionMenuElement) == null || i.remove(), (l = this.linkEditElement) == null || l.remove(), this.popMenuPosition.value = null, this.quotePosition.value = null;
  }
  clearQuote() {
    this.quotePosition.value = null;
  }
  getLineList() {
    return this.lineList;
  }
  setLineList(e) {
    this.lineList.splice(0, this.lineList.length, ...e);
  }
  getSelectElementList() {
    return this.selectElementList;
  }
  getRoot() {
    return this.root;
  }
  addLine(e, s) {
    let o = {
      arr: [
        {
          value: e,
          ...s,
          type: y.TEXT
        }
      ],
      selectEndIndexPath: [],
      selectStartIndexPath: []
    };
    this.lineList.push(o);
  }
  onFocus(e, s) {
    j = this, this.selectElementList.length == 0 && (this.selectElementList = [s.currentTarget]);
  }
  onDbClick(e) {
    this.selectElementList = [e.currentTarget];
  }
  onBlur(e, s) {
    b.handleInnerHtml(e, s.currentTarget, !0, this.onGetLineConfigType), this.selectionMenuElement && !this.selectionMenuElement.contains(s.relatedTarget) && !this.selectionLinkElement.contains(s.relatedTarget) && (this.selectionMenuElement.style.display = "none"), this.imageHelperElement && (this.imageHelperElement.style.display = "none", this.resizeObserver.unobserve(this.imageHelperElement), this.resizeImage = null), this.popMenuPosition.value = null;
  }
  onEnter(e, s, o) {
    o.preventDefault(), o.stopPropagation(), b.handleInnerHtml(e, o.currentTarget, !1, this.onGetLineConfigType);
    let t = e.arr[e.selectStartIndexPath[0]], i = {
      arr: e.arr.slice(e.selectStartIndexPath[0] + 1),
      selectStartIndexPath: [],
      selectEndIndexPath: []
    };
    if (!t || t.type === y.TEXT || t.type === y.LINK) {
      let l = t == null ? void 0 : t.value.substring(e.selectStartIndexPath[1]);
      l ? (i.arr.unshift({
        value: l,
        style: {
          ...t.style
        },
        type: y.TEXT
      }), t.value = t.value.substring(0, e.selectStartIndexPath[1])) : i.arr.unshift({
        value: "",
        style: {},
        type: y.TEXT
      });
    }
    e.arr.splice(e.selectStartIndexPath[0] + 1), this.lineList.splice(s + 1, 0, i), M(() => {
      this.selectElementList = [this.root.value.children[s + 1]];
      let l = this.root.value.children[s + 1], n = window.getSelection(), r = document.createRange();
      r.selectNodeContents(l), r.collapse(!0), n.removeAllRanges(), n.addRange(r);
    });
  }
  onDelete(e, s, o) {
    let t = o.currentTarget, l = window.getSelection().getRangeAt(0), n = l.startOffset, r = l.endOffset, c = l.startContainer, d = c, a = l.endContainer, p = a, u = [], h = [];
    if (c.tagName == "DIV")
      u = [0, n];
    else {
      u.unshift(n);
      let f = c.parentElement;
      f.tagName == "DIV" ? (n = Array.from(f.childNodes).indexOf(c), u.unshift(n), c = f) : (n = Array.from(f.parentElement.childNodes).indexOf(f), u.unshift(n), c = f.parentElement);
    }
    if (a.tagName == "DIV")
      h = [0, r];
    else {
      h.unshift(r);
      let f = a.parentElement;
      f.tagName == "DIV" ? (r = Array.from(f.childNodes).indexOf(a), h.unshift(r), a = f) : (r = Array.from(f.parentElement.childNodes).indexOf(f), h.unshift(r), a = f.parentElement);
    }
    if (u[0] == 0 && u[1] == 0 && h[0] == 0 && h[1] == 0 && d == p && e > 0) {
      o.preventDefault(), o.stopPropagation(), b.handleInnerHtml(s, t, !1, this.onGetLineConfigType);
      let f = this.lineList[e - 1];
      s.arr = s.arr.filter((k) => k.value.length > 0 || k.type === y.IMAGE);
      let g = [f.arr.length - 1 >= 0 ? f.arr.length - 1 : 0, f.arr.length > 0 ? f.arr[f.arr.length - 1].value.length : 0];
      f.arr = f.arr.concat(s.arr), this.lineList.splice(e, 1), b.fixLine(f), M(() => {
        let k = window.getSelection(), I = document.createRange(), L = this.root.value.children[e - 1].childNodes[g[0]];
        if (L)
          L.nodeType == Node.TEXT_NODE ? (I.setStart(L, g[1]), I.setEnd(L, g[1])) : L.nodeType == Node.ELEMENT_NODE && (L.tagName == "IMG" || L.tagName == "A" ? (I.selectNode(L), I.collapse(!1)) : (I.setStart(L.firstChild, g[1]), I.setEnd(L.firstChild, g[1])));
        else {
          let O = this.root.value.children[e - 1];
          I.selectNodeContents(O), I.collapse(!0);
        }
        k.removeAllRanges(), k.addRange(I);
      });
    }
  }
  onMouseDown(e) {
    this.popMenuPosition.value = null, this.clearQuote(), e.detail == 1 && (this.selectElementList = [e.currentTarget], this.isMouseDown = !0);
  }
  onMouseMove(e) {
    let s = e.currentTarget;
    if (this.isMouseDown && !this.selectElementList.includes(s)) {
      this.selectElementList.push(s);
      for (let o of this.selectElementList)
        o.innerHTML !== "" && (o.contentEditable = "false");
    }
  }
  onMouseUp(e) {
    this.isMouseDown = !1;
    let s = window.getSelection();
    if (s.rangeCount == 0)
      return;
    let o = s.getRangeAt(0);
    if (this.selectElementList.length > 0) {
      o = o.cloneRange();
      for (let n of this.selectElementList)
        M(() => {
          n.contentEditable = "true";
        });
      let t = o.startContainer;
      for (; t.tagName !== "DIV"; )
        t = t.parentElement;
      let i = o.endContainer;
      for (; i.tagName !== "DIV"; )
        i = i.parentElement;
      let l = Array.from(this.root.value.children);
      this.selectElementList = [];
      for (let n = l.indexOf(t); n <= l.indexOf(i); n++)
        this.selectElementList.push(l[n]);
      s.removeAllRanges(), s.addRange(o), this.handleMenu(e, o);
    }
  }
  onClick(e) {
    var o;
    let s = e.target;
    if (s.tagName === "A" || s.parentElement.tagName === "A") {
      let t;
      s.tagName === "A" ? t = s : s.parentElement.tagName === "A" && (t = s.parentElement);
      let i = t.getAttribute("type");
      i && ((o = this.onCustomMenuClickFunc) == null || o.call(this, Number(i), t.getAttribute("value"), t.getAttribute("link"), t.innerText));
    }
  }
  generatorSelectionMenu(e) {
    let s = e.offsetParent;
    this.selectionMenuElement = document.createElement("div"), this.selectionMenuElement.tabIndex = -1, this.selectionMenuElement.style.position = "absolute", this.selectionMenuElement.style.borderRadius = "5px", this.selectionMenuElement.style.boxShadow = "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", this.selectionMenuElement.style.backgroundColor = "white", this.selectionMenuElement.style.border = "1px solid rgba(169, 169, 169, 0.2)";
    let o = document.createElement("span");
    o.setAttribute("name", "text"), o.style.cursor = "pointer", o.style.display = "inline-block", o.style.width = "50px", o.style.height = "30px", o.style.textAlign = "center", o.style.lineHeight = "30px", o.style.borderRight = "1px solid lightgray", o.innerText = "Text", o.onmouseenter = () => {
      this.selectionTextElement.style.display = "block", this.selectionTextElement.style.left = this.selectionMenuElement.offsetLeft + "px", this.selectionTextElement.style.top = this.selectionMenuElement.offsetTop + this.selectionMenuElement.offsetHeight - 2 + "px";
    }, o.onmouseleave = (d) => {
      let a = d.relatedTarget;
      (!a || !this.selectionTextElement.contains(a)) && (this.selectionTextElement.style.display = "none");
    }, this.selectionMenuElement.appendChild(o);
    let t = document.createElement("button");
    t.setAttribute("name", "bold"), t.style.cursor = "pointer", t.style.width = "30px", t.style.height = "30px", t.style.textAlign = "center", t.style.lineHeight = "30px", t.style.fontWeight = "bold", t.style.backgroundColor = "transparent", t.style.border = "0px", t.innerText = "B", t.onclick = () => {
      B.bold(this, t.style.color == "black"), t.style.color = t.style.color == "black" ? "blue" : "black";
    }, this.selectionMenuElement.appendChild(t);
    let i = document.createElement("button");
    i.setAttribute("name", "italic"), i.style.cursor = "pointer", i.style.width = "30px", i.style.height = "30px", i.style.textAlign = "center", i.style.lineHeight = "30px", i.style.fontStyle = "italic", i.style.backgroundColor = "transparent", i.style.border = "0px", i.innerText = "I", i.onclick = () => {
      B.italic(this, i.style.color == "black"), i.style.color = i.style.color == "black" ? "blue" : "black";
    }, this.selectionMenuElement.appendChild(i);
    let l = document.createElement("button");
    l.setAttribute("name", "underline"), l.style.cursor = "pointer", l.style.width = "30px", l.style.height = "30px", l.style.textAlign = "center", l.style.lineHeight = "30px", l.style.textDecoration = "underline", l.style.backgroundColor = "transparent", l.style.border = "0px", l.innerText = "U", l.onclick = () => {
      B.underLine(this, l.style.color == "black"), l.style.color = l.style.color == "black" ? "blue" : "black";
    }, this.selectionMenuElement.appendChild(l);
    let n = document.createElement("button");
    n.setAttribute("name", "lineThrough"), n.style.cursor = "pointer", n.style.width = "30px", n.style.height = "30px", n.style.textAlign = "center", n.style.lineHeight = "30px", n.style.textDecoration = "line-through", n.style.backgroundColor = "transparent", n.style.border = "0px", n.innerText = "S", n.onclick = () => {
      B.deleteLine(this, n.style.color == "black"), n.style.color = n.style.color == "black" ? "blue" : "black";
    }, this.selectionMenuElement.appendChild(n);
    let r = document.createElement("span");
    r.setAttribute("name", "color"), r.style.cursor = "pointer", r.style.display = "inline-block", r.style.width = "30px", r.style.height = "30px", r.style.textAlign = "center", r.style.lineHeight = "30px", r.innerText = "A", r.onmouseenter = () => {
      this.selectionColorElement.style.display = "block", this.selectionColorElement.style.left = this.selectionMenuElement.offsetLeft + r.offsetLeft - 100 + "px", this.selectionColorElement.style.top = this.selectionMenuElement.offsetTop + this.selectionMenuElement.offsetHeight - 2 + "px";
    }, r.onmouseleave = (d) => {
      let a = d.relatedTarget;
      (!a || !this.selectionColorElement.contains(a)) && (this.selectionColorElement.style.display = "none");
    }, this.selectionMenuElement.appendChild(r);
    let c = document.createElement("span");
    c.setAttribute("name", "link"), c.style.cursor = "pointer", c.style.display = "inline-block", c.style.width = "50px", c.style.height = "30px", c.style.textAlign = "center", c.style.lineHeight = "30px", c.innerText = "Link", c.onmouseenter = () => {
      this.selectionLinkElement.style.display = "block", this.selectionLinkElement.style.left = this.selectionMenuElement.offsetLeft + c.offsetLeft - 100 + "px", this.selectionLinkElement.style.top = this.selectionMenuElement.offsetTop + this.selectionMenuElement.offsetHeight - 2 + "px", this.selectionLinkElement.querySelector("input").value = "";
    }, c.onmouseleave = (d) => {
      let a = d.relatedTarget;
      (!a || !this.selectionLinkElement.contains(a)) && (this.selectionLinkElement.style.display = "none");
    }, this.selectionMenuElement.appendChild(c), s.appendChild(this.selectionMenuElement);
  }
  generatorSelectionColor(e) {
    let s = e.offsetParent;
    this.selectionColorElement = document.createElement("div"), this.selectionColorElement.style.position = "absolute", this.selectionColorElement.setAttribute("name", "colorList"), this.selectionColorElement.style.display = "none", this.selectionColorElement.appendChild(document.createTextNode("Text Color")), this.selectionColorElement.style.borderRadius = "5px", this.selectionColorElement.style.boxShadow = "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", this.selectionColorElement.style.backgroundColor = "white", this.selectionColorElement.style.border = "1px solid rgba(169, 169, 169, 0.2)", this.selectionColorElement.style.width = "200px", this.selectionColorElement.style.padding = "5px", this.selectionColorElement.style.color = "gray", this.selectionColorElement.style.fontSize = "14px", this.selectionColorElement.onmouseleave = () => {
      this.selectionColorElement.style.display = "none";
    };
    let o = document.createElement("div");
    o.style.display = "flex", o.style.flexWrap = "wrap", o.style.marginTop = "5px", o.style.marginBottom = "10px";
    let t = ["black", "red", "blue", "green", "yellow", "gray", "brown", "orange", "pink", "purple"];
    for (let n of t) {
      let r = document.createElement("button");
      r.style.cursor = "pointer", r.style.width = "25px", r.style.height = "25px", r.style.textAlign = "center", r.style.lineHeight = "25px", r.style.backgroundColor = "transparent", r.style.border = "1px solid lightgray", r.style.color = n, r.style.marginRight = "5px", r.style.marginTop = "5px", r.style.borderRadius = "5px", r.innerText = "A", r.onclick = () => {
        B.color(this, n), this.selectionColorElement.style.display = "none";
      }, o.appendChild(r);
    }
    this.selectionColorElement.appendChild(o), this.selectionColorElement.appendChild(document.createTextNode("Background Color"));
    let i = document.createElement("div");
    i.style.display = "flex", i.style.flexWrap = "wrap", i.style.marginTop = "5px";
    let l = ["transparent", "red", "blue", "green", "yellow", "gray", "brown", "orange", "pink", "purple"];
    for (let n of l) {
      let r = document.createElement("button");
      r.style.cursor = "pointer", r.style.width = "25px", r.style.height = "25px", r.style.marginRight = "5px", r.style.marginTop = "5px", r.style.border = "0px", r.style.borderRadius = "5px", n != "transparent" && (r.style.backgroundColor = n), r.onclick = () => {
        B.backgroundColor(this, n), this.selectionColorElement.style.display = "none";
      }, i.appendChild(r);
    }
    this.selectionColorElement.appendChild(i), s.appendChild(this.selectionColorElement);
  }
  generatorSelectionText(e) {
    let s = e.offsetParent;
    this.selectionTextElement = document.createElement("div"), this.selectionTextElement.setAttribute("name", "fontSizeList"), this.selectionTextElement.style.display = "none", this.selectionTextElement.style.flexDirection = "column", this.selectionTextElement.style.width = "60px", this.selectionTextElement.style.position = "absolute", this.selectionTextElement.style.borderRadius = "5px", this.selectionTextElement.style.boxShadow = "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", this.selectionTextElement.style.backgroundColor = "white", this.selectionTextElement.style.border = "1px solid rgba(169, 169, 169, 0.2)", this.selectionTextElement.onmouseleave = () => {
      this.selectionTextElement.style.display = "none";
    };
    for (let o = 16; o <= 48; o += 8) {
      let t = document.createElement("button");
      t.style.cursor = "pointer", t.style.width = "100%", t.style.height = "30px", t.style.textAlign = "center", t.style.lineHeight = "30px", t.style.backgroundColor = "transparent", t.style.border = "0px", o == 16 ? t.innerText = "Normal" : o == 24 ? t.innerText = "H4" : o == 32 ? t.innerText = "H3" : o == 40 ? t.innerText = "H2" : o == 48 && (t.innerText = "H1"), t.onclick = () => {
        B.fontSize(this, String(o) + "px"), this.selectionTextElement.style.display = "none";
      }, this.selectionTextElement.appendChild(t);
    }
    s.appendChild(this.selectionTextElement);
  }
  generatorSelectionLink(e) {
    let s = e.offsetParent;
    this.selectionLinkElement = document.createElement("div"), this.selectionLinkElement.setAttribute("name", "link"), this.selectionLinkElement.style.display = "none", this.selectionLinkElement.style.position = "absolute", this.selectionLinkElement.style.borderRadius = "5px", this.selectionLinkElement.style.boxShadow = "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", this.selectionLinkElement.style.backgroundColor = "white", this.selectionLinkElement.style.border = "1px solid rgba(169, 169, 169, 0.2)", this.selectionLinkElement.style.padding = "5px", this.selectionLinkElement.onmouseleave = () => {
      this.selectionLinkElement.style.display = "none";
    };
    let o = document.createElement("input");
    o.placeholder = "type your link";
    let t = document.createElement("button");
    t.innerText = "save", t.style.backgroundColor = "transparent", t.style.border = "0px", t.style.marginLeft = "10px", t.onclick = () => {
      o.value && (B.link(this, o.value), this.selectionLinkElement.style.display = "none");
    }, this.selectionLinkElement.appendChild(o), this.selectionLinkElement.appendChild(t), s.appendChild(this.selectionLinkElement);
  }
  generatorLinkEdit(e) {
    let s = e.offsetParent;
    this.linkEditElement = document.createElement("div"), this.linkEditElement.setAttribute("name", "linkEdit"), this.linkEditElement.style.display = "none", this.linkEditElement.style.position = "absolute", this.linkEditElement.style.borderRadius = "5px", this.linkEditElement.style.boxShadow = "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", this.linkEditElement.style.backgroundColor = "white", this.linkEditElement.style.border = "1px solid rgba(169, 169, 169, 0.2)", this.linkEditElement.style.padding = "5px", this.linkEditElement.style.color = "gray", this.linkEditElement.style.fontSize = "14px", this.linkEditElement.onmouseleave = () => {
      this.linkEditElement.style.display = "none";
    }, this.linkEditElement.appendChild(document.createTextNode("uri")), this.linkEditElement.appendChild(document.createElement("br"));
    let o = document.createElement("input");
    o.style.marginTop = "5px", o.style.marginBottom = "10px", o.style.width = "90%", o.placeholder = "type your link", this.linkEditElement.appendChild(o), this.linkEditElement.appendChild(document.createElement("br")), this.linkEditElement.appendChild(document.createTextNode("title")), this.linkEditElement.appendChild(document.createElement("br"));
    let t = document.createElement("input");
    t.placeholder = "type your title", t.style.marginTop = "5px", t.style.width = "90%", this.linkEditElement.appendChild(t);
    let i = document.createElement("button");
    i.setAttribute("name", "save"), i.innerText = "save", i.style.borderRadius = "5px", i.style.border = "0px", i.style.marginTop = "10px", i.style.width = "100%", i.style.height = "25px", this.linkEditElement.appendChild(i), this.linkEditElement.appendChild(document.createElement("br"));
    let l = document.createElement("button");
    l.setAttribute("name", "remove"), l.innerText = "remove", l.style.borderRadius = "5px", l.style.border = "0px", l.style.marginTop = "10px", l.style.width = "100%", l.style.height = "25px", this.linkEditElement.appendChild(l), s.appendChild(this.linkEditElement);
  }
  handleMenu(e, s) {
    if (s.collapsed) {
      this.selectionMenuElement && (this.selectionMenuElement.style.display = "none");
      let o = e.target;
      if (o.tagName == "A" && o.getAttribute("target")) {
        this.linkEditElement || this.generatorLinkEdit(o);
        let t = o.parentElement, i = Array.from(t.childNodes).indexOf(o), l = Array.from(this.root.value.children).indexOf(t), n = this.lineList[l].arr[i];
        this.linkEditElement.style.display = "block";
        let r = s.getBoundingClientRect(), d = e.target.offsetParent.getBoundingClientRect(), a = r.left - d.left;
        r.top - d.top;
        let p = r.bottom - d.top, u = a - 10, h = p + 10;
        u < 0 && (u = 0), this.linkEditElement.style.left = u + "px", this.linkEditElement.style.top = h + "px";
        let f = this.linkEditElement.querySelectorAll("input")[0];
        f.value = n.link;
        let g = this.linkEditElement.querySelectorAll("input")[1];
        g.value = n.value;
        let k = this.linkEditElement.querySelector("[name='save']");
        k.onclick = () => {
          let L = this.lineList[l].arr[i], O = f.value, v = g.value;
          !O || !v || (L.link = O, L.value = v, this.linkEditElement.style.display = "none");
        };
        let I = this.linkEditElement.querySelector("[name='remove']");
        I.onclick = () => {
          let L = this.lineList[l].arr[i];
          L.type = y.TEXT, delete L.link, b.fixLine(this.lineList[l]), this.linkEditElement.style.display = "none";
        };
      }
    } else {
      if (!this.selectionMenuElement) {
        let g = e.target;
        this.generatorSelectionMenu(g), this.generatorSelectionText(g), this.generatorSelectionColor(g), this.generatorSelectionLink(g);
      }
      this.selectionMenuElement.style.display = "block";
      let o = s.getBoundingClientRect(), i = e.target.offsetParent.getBoundingClientRect(), l = o.left - i.left, n = o.top - i.top, r = o.bottom - i.top, c = l - 10, d = n - 40;
      c < 0 && (c = l), d < 0 && (d = r + 10), this.selectionMenuElement.style.left = c + "px", this.selectionMenuElement.style.top = d + "px";
      let a = B.isBold(this), p = B.isItalic(this), u = B.isUnderLine(this), h = B.isDeleteLine(this), f = this.selectionMenuElement.querySelector("[name='bold']");
      f.style.color = a ? "blue" : "black", f = this.selectionMenuElement.querySelector("[name='italic']"), f.style.color = p ? "blue" : "black", f = this.selectionMenuElement.querySelector("[name='underline']"), f.style.color = u ? "blue" : "black", f = this.selectionMenuElement.querySelector("[name='lineThrough']"), f.style.color = h ? "blue" : "black";
    }
  }
  onCopy(e) {
    const s = window.getSelection().getRangeAt(0);
    s.startContainer.nodeType === Node.TEXT_NODE && s.startContainer.parentElement.tagName === "A" && s.setStartBefore(s.startContainer.parentElement);
    const o = s.cloneContents(), t = document.createElement("div");
    t.setAttribute("copy", "teamlinker"), t.appendChild(o), e.clipboardData.setData("text/html", t.outerHTML), e.clipboardData.setData("text/plain", t.innerText), e.preventDefault(), e.stopPropagation();
  }
  onPaste(e) {
    var o;
    let s = e.clipboardData.types;
    if (this.getSelectElementList(), s.includes("Files")) {
      let t = e.clipboardData.files[0];
      if (t) {
        let i = window.getSelection(), n = i.getRangeAt(0).startContainer;
        for (; n.tagName != "DIV"; )
          n = n.parentElement;
        let r = Array.from(this.root.value.children).indexOf(n), c = this.lineList[r];
        b.handleInnerHtml(c, n, !0, this.onGetLineConfigType), (o = this.onUploadFileFunc) == null || o.call(this, t, (d, a) => {
          let p = c.arr[c.selectStartIndexPath[0]], u = {
            value: d,
            link: a,
            type: y.IMAGE
          }, h;
          if (p) {
            let f = JSON.parse(JSON.stringify(p));
            f.value = f.value.substring(c.selectStartIndexPath[1]);
            let g = [...c.arr.slice(c.selectStartIndexPath[0] + 1)];
            f.type != y.IMAGE && g.unshift(f), p.value = p.value.substring(0, c.selectStartIndexPath[1]), c.arr.splice(c.selectStartIndexPath[0] + 1, 0, u), h = c.arr.length - 1, c.arr = c.arr.concat(g);
          } else
            c.arr = [u], h = 0;
          b.fixLine(c), M(() => {
            let f = document.createRange();
            f.selectNode(n.childNodes[h]), f.collapse(!1), i.removeAllRanges(), i.addRange(f);
          });
        });
      }
    } else if (s != null && s.includes("text/html")) {
      e.stopPropagation(), e.preventDefault();
      let t = document.createElement("div");
      t.innerHTML = e.clipboardData.getData("text/html");
      let i = t.getElementsByTagName("div"), l = !1;
      t.childNodes.length == 2 && t.firstChild.tagName === "META" && t.childNodes[1].tagName === "DIV" && t.childNodes[1].getAttribute("copy") === "teamlinker" && (l = !0);
      let n = window.getSelection(), c = n.getRangeAt(0).startContainer;
      for (; c.tagName != "DIV"; )
        c = c.parentElement;
      let d = Array.from(this.root.value.children).indexOf(c), a = this.lineList[Array.from(this.root.value.children).indexOf(c)];
      if (b.handleInnerHtml(a, c, !0, this.onGetLineConfigType), l) {
        let p, u = [];
        for (let h = 0; h < i.length; h++) {
          let f = {
            arr: [],
            selectEndIndexPath: [],
            selectStartIndexPath: []
          };
          if (b.handleInnerHtml(f, i[h], !1, this.onGetLineConfigType), h == 0 || h == i.length - 1)
            if (h == 0) {
              let g = "", k = !1;
              if (a.arr.forEach((I) => {
                g += I.value, I.type == y.IMAGE && (k = !0);
              }), !g && !k)
                this.lineList.splice(this.lineList.indexOf(a), 1, f);
              else {
                let I = a.arr[a.selectStartIndexPath[0]], L = JSON.parse(JSON.stringify(I));
                L.value = L.value.substring(a.selectStartIndexPath[1]), p = [...a.arr.slice(a.selectStartIndexPath[0] + 1)], L.type != y.IMAGE && p.unshift(L), I.value = I.value.substring(0, a.selectStartIndexPath[1]), a.arr.splice(a.selectStartIndexPath[0] + 1, a.arr.length, ...f.arr), b.fixLine(a);
              }
              if (i.length == 1) {
                let I;
                p && (I = {
                  endItem: a.arr[a.arr.length - 1]
                }, a.arr = a.arr.concat(p), b.fixLine(a, I)), u = [d + h, I ? a.arr.indexOf(I.endItem) : f.arr.length - 1];
              }
            } else {
              let g;
              p && (g = {
                endItem: f.arr[f.arr.length - 1]
              }, f.arr = f.arr.concat(p), b.fixLine(f, g)), this.lineList.splice(d + h, 0, f), u = [d + h, g ? f.arr.indexOf(g.endItem) : f.arr.length - 1];
            }
          else
            this.lineList.splice(d + h, 0, f);
        }
        M(() => {
          let h = window.getSelection(), f = document.createRange();
          f.selectNode(this.root.value.children[u[0]].childNodes[u[1]]), f.collapse(!1), h.removeAllRanges(), h.addRange(f);
        });
      } else {
        let p = a.arr[a.selectStartIndexPath[0]];
        if (p) {
          let u = (p.value.substring(0, a.selectStartIndexPath[1]) + t.innerText).length;
          p.value = p.value.substring(0, a.selectStartIndexPath[1]) + t.innerText + p.value.substring(a.selectStartIndexPath[1]), M(() => {
            let h = c.childNodes[a.selectStartIndexPath[0]], f = document.createRange();
            h.nodeType == Node.TEXT_NODE ? (f.setStart(h, u), f.setEnd(h, u)) : h.nodeType == Node.ELEMENT_NODE && (h.tagName == "IMG" ? (f.selectNode(h), f.collapse(!1)) : (f.setStart(h.firstChild, u), f.setEnd(h.firstChild, u))), n.removeAllRanges(), n.addRange(f);
          });
        } else
          a.arr.push({
            value: t.innerText,
            type: y.TEXT,
            style: {}
          }), M(() => {
            let u = c.firstChild, h = document.createRange();
            h.selectNodeContents(u), h.collapse(!1), n.removeAllRanges(), n.addRange(h);
          });
      }
    }
  }
  onMouseOver(e) {
    let s = e.target;
    if (s.tagName == "IMG") {
      let o = s.offsetParent, t = o.getBoundingClientRect(), i = s.getBoundingClientRect(), l = i.left - t.left, n = i.top - t.top, r = s.offsetWidth, c = s.offsetHeight;
      this.imageHelperElement || (this.imageHelperElement = document.createElement("div"), o.appendChild(this.imageHelperElement), this.resizeObserver = new ResizeObserver((d, a) => {
        for (let p of d)
          this.resizeImage && (this.resizeImage.width = p.contentRect.width);
      })), this.imageHelperElement.style.border = "1px solid blue", this.imageHelperElement.style.position = "absolute", this.imageHelperElement.style.left = l + "px", this.imageHelperElement.style.top = n + "px", this.imageHelperElement.style.width = r + "px", this.imageHelperElement.style.height = c + "px", this.imageHelperElement.style.overflow = "hidden", this.imageHelperElement.style.resize = "both", this.imageHelperElement.style.display = "block", this.resizeImage = s, this.resizeObserver.observe(this.imageHelperElement);
    } else
      this.imageHelperElement && (this.imageHelperElement.style.display = "none", this.resizeObserver.unobserve(this.imageHelperElement)), this.resizeImage && (this.resizeImage = null);
  }
  onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key == "a") {
      e.stopPropagation(), e.preventDefault();
      let s = window.getSelection(), t = s.getRangeAt(0).startContainer;
      for (; t.tagName != "DIV"; )
        t = t.parentElement;
      let i = Array.from(this.root.value.children).indexOf(t), l = this.lineList[i];
      b.handleInnerHtml(l, t, !1, this.onGetLineConfigType), this.selectElementList = Array.from(this.root.value.children), M(() => {
        let n = document.createRange(), r, c;
        for (let d = 0; d < this.root.value.childNodes.length; d++) {
          let a = this.root.value.childNodes[d];
          for (let p = 0; p < a.childNodes.length; p++) {
            let u = a.childNodes[p];
            if (u) {
              r = u;
              break;
            }
          }
          if (r)
            break;
        }
        for (let d = this.root.value.childNodes.length - 1; d >= 0; d--) {
          let a = this.root.value.childNodes[d];
          for (let p = a.childNodes.length - 1; p >= 0; p--) {
            let u = a.childNodes[p];
            if (u) {
              c = u;
              break;
            }
          }
          if (c)
            break;
        }
        r && c && (n.setStartBefore(r), n.setEndAfter(c), s.removeAllRanges(), s.addRange(n));
      });
    }
    if (e.key === "/") {
      let o = window.getSelection().getRangeAt(0), t = o.getBoundingClientRect();
      if (t.left == 0 && t.top == 0 && t.width == 0 && t.height == 0) {
        if (o.startContainer.tagName == "DIV" && o.startOffset !== 0)
          return;
        t = o.startContainer.getBoundingClientRect();
      }
      let i = t.right + t.width, l = t.bottom, n, r;
      i > 160 ? n = t.left : n = t.left - 150, document.body.clientHeight - l > 210 ? r = t.top + t.height : r = t.top - 200, this.popMenuPosition.value = {
        left: n,
        top: r
      };
    } else
      this.popMenuPosition.value = null;
    if (e.key === "@") {
      if (!this.onQuoteListFunc)
        return;
      let o = window.getSelection().getRangeAt(0), t = o.getBoundingClientRect();
      if (t.left == 0 && t.top == 0 && t.width == 0 && t.height == 0) {
        if (o.startContainer.tagName == "DIV" && o.startOffset !== 0)
          return;
        t = o.startContainer.getBoundingClientRect();
      }
      let i = t.right + t.width, l = t.bottom, n, r;
      i > 160 ? n = t.left : n = t.left - 150, document.body.clientHeight - l > 210 ? r = t.top + t.height : r = t.top - 200, this.quotePosition.value = {
        left: n,
        top: r
      };
    } else
      this.clearQuote();
    if (e.key == "ArrowDown") {
      let s = window.getSelection(), o = s.getRangeAt(0), t = o.startOffset, i = o.startContainer, l = [];
      l.unshift(t);
      let n = i.parentElement;
      if (i.tagName == "DIV" ? l.unshift(0) : n.tagName == "DIV" ? (t = Array.from(n.childNodes).indexOf(i), l.unshift(t), i = n) : (t = Array.from(n.parentElement.childNodes).indexOf(n), l.unshift(t), i = n.parentElement), o.collapsed && (i.childNodes.length == 0 || l[0] == i.childNodes.length - 1 && l[1] == i.lastChild.textContent.length)) {
        e.stopPropagation(), e.preventDefault();
        let r = Array.from(this.root.value.children).indexOf(i);
        if (r < this.lineList.length - 1) {
          let c = document.createRange();
          c.selectNodeContents(this.root.value.children[r + 1]), c.collapse(!0), s.removeAllRanges(), s.addRange(c);
        }
      }
    } else if (e.key == "ArrowUp") {
      let s = window.getSelection(), o = s.getRangeAt(0), t = o.startOffset, i = o.startContainer, l = [];
      if (l.unshift(t), i.tagName == "DIV")
        l.unshift(0);
      else {
        let n = i.parentElement;
        n.tagName == "DIV" ? (t = Array.from(n.childNodes).indexOf(i), l.unshift(t), i = n) : (t = Array.from(n.parentElement.childNodes).indexOf(n), l.unshift(t), i = n.parentElement);
      }
      if (o.collapsed && l[0] == 0 && l[1] == 0) {
        e.stopPropagation(), e.preventDefault();
        let n = Array.from(this.root.value.children).indexOf(i);
        if (n > 0) {
          let r = document.createRange();
          r.selectNodeContents(this.root.value.children[n - 1]), r.collapse(!1), s.removeAllRanges(), s.addRange(r);
        }
      }
    }
  }
  getSelectionItemList() {
    let e = [];
    this.selectElementList.forEach((u) => {
      e.push(this.lineList[Array.from(this.root.value.children).indexOf(u)]);
    });
    let o = window.getSelection().getRangeAt(0), t = o.startOffset, i = o.endOffset, l = o.startContainer, n = o.endContainer, r = [], c = [];
    if (l.tagName == "DIV")
      r = [t, 0];
    else {
      r.unshift(t);
      let u = l.parentElement;
      u.tagName == "DIV" ? (t = Array.from(u.childNodes).indexOf(l), r.unshift(t), l = u) : (t = Array.from(u.parentElement.childNodes).indexOf(u), r.unshift(t), l = u.parentElement);
    }
    if (n.tagName == "DIV")
      c = [i, n.childNodes[i] ? n.childNodes[i].textContent.length : 0];
    else {
      c.unshift(i);
      let u = n.parentElement;
      u.tagName == "DIV" ? (i = Array.from(u.childNodes).indexOf(n), c.unshift(i), n = u) : (i = Array.from(u.parentElement.childNodes).indexOf(u), c.unshift(i), n = u.parentElement);
    }
    let d = e[0];
    d.selectStartIndexPath = r;
    let a = e[e.length - 1];
    a.selectEndIndexPath = c;
    let p = [];
    if (e.length == 1)
      b.handleInnerHtml(e[0], l, !1, this.onGetLineConfigType), p = [{
        line: e[0],
        data: [...e[0].arr.slice(r[0], c[0] + 1)]
      }];
    else
      for (let u of e) {
        let h = p.find((f) => f.line === u);
        if (h || (h = {
          line: u,
          data: []
        }, p.push(h)), u == d) {
          b.handleInnerHtml(u, l, !1, this.onGetLineConfigType);
          for (let f = r[0]; f < d.arr.length; f++) {
            let g = d.arr[f];
            h.data.push(g);
          }
        } else if (u == a) {
          b.handleInnerHtml(u, n, !1, this.onGetLineConfigType);
          for (let f = 0; f <= c[0]; f++) {
            let g = a.arr[f];
            g && h.data.push(g);
          }
        } else
          b.handleInnerHtml(u, this.root.value.children[this.lineList.indexOf(u)], !1, this.onGetLineConfigType), u.arr.forEach((f) => {
            h.data.push(f);
          });
      }
    return p;
  }
  getCurrentInfo() {
    let o = window.getSelection().getRangeAt(0).startContainer, t = o;
    for (; t.tagName != "DIV"; )
      t = t.parentElement;
    let i = Array.from(this.root.value.children).indexOf(t), l = this.lineList[i], n, r;
    return o != t && (r = Array.from(t.childNodes).indexOf(o), n = l.arr[r]), {
      element: t,
      line: l,
      lineIndex: i,
      item: n,
      itemIndex: r
    };
  }
}
const Te = {
  style: { position: "absolute", boxShadow: "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", backgroundColor: "white", border: "1px solid rgba(169, 169, 169, 0.2)", width: "150px", height: "200px", overflow: "auto", outlineWidth: "0", "z-index": "10000" },
  tabIndex: "-1"
}, ve = ["onMousedown"], Ce = /* @__PURE__ */ te({
  __name: "popMenu",
  props: {
    objEditor: {},
    popMenuList: {}
  },
  setup(E) {
    const e = E, s = V(e.popMenuList ?? []), o = async (t) => {
      var n, r;
      let i = e.objEditor.getSelectionItemList(), l = JSON.parse(JSON.stringify(i[0].line.selectStartIndexPath));
      (r = (n = e.objEditor).onPopMenuClickFunc) == null || r.call(n, t.type, (c) => {
        let d = i[0].line, a = e.objEditor.getRoot().value.children[e.objEditor.getLineList().indexOf(d)], p = d.arr[l[0]], u = JSON.parse(JSON.stringify(p));
        u.value = p.value.substring(l[1]), p.value = p.value.substring(0, l[1] - 1), d.arr.splice(l[0] + 1, 0, c, u);
        let h = { startIndex: l[0] + 1 };
        b.fixLine(d, h), M(() => {
          let f = window.getSelection(), g = document.createRange();
          g.setStartAfter(a.childNodes[h.startIndex] ?? a.lastChild), g.setEndAfter(a.childNodes[h.startIndex] ?? a.lastChild), f.removeAllRanges(), f.addRange(g);
        });
      });
    };
    return (t, i) => (D(), X("div", Te, [
      (D(!0), X(U, null, Y(s.value, (l, n) => (D(), X("div", {
        class: "item",
        style: le([{ height: "35px", display: "flex", "align-items": "center", "justify-content": "center", cursor: "pointer" }, { borderBottom: n !== s.value.length - 1 ? "rgb(241,241,241) 1px solid" : "" }]),
        key: l.type,
        onMousedown: (r) => o(l)
      }, de(l.title), 45, ve))), 128))
    ]));
  }
}), ne = (E, e) => {
  const s = E.__vccOpts || E;
  for (const [o, t] of e)
    s[o] = t;
  return s;
}, ke = /* @__PURE__ */ ne(Ce, [["__scopeId", "data-v-f6e1fb69"]]), Pe = { style: { height: "30px", "border-bottom": "1px lightgray solid" } }, we = ["onClick"], Oe = ["src"], Ae = /* @__PURE__ */ te({
  __name: "quote",
  props: {
    objEditor: {},
    quoteType: {},
    position: {}
  },
  setup(E) {
    const e = E, s = V(""), o = V(), t = V([]);
    let i, l;
    const n = async () => {
      var a, p;
      (p = (a = e.objEditor).onQuoteListFunc) == null || p.call(a, s.value, (u) => {
        t.value = u;
      });
    }, r = (a) => {
      e.objEditor.clearQuote();
    }, c = (a) => {
      i || (i = e.objEditor.getSelectionItemList(), l = JSON.parse(JSON.stringify(i[0].line.selectStartIndexPath)));
    }, d = async (a) => {
      e.objEditor.clearQuote();
      let p = i[0].line, u = e.objEditor.getRoot().value.children[e.objEditor.getLineList().indexOf(p)], h = p.arr[l[0]], f = JSON.parse(JSON.stringify(h));
      f.value = h.value.substring(l[1]), h.value = h.value.substring(0, l[1] - 1);
      let g = {
        type: e.quoteType,
        value: a.value,
        label: a.label
      };
      p.arr.splice(l[0] + 1, 0, g, f);
      let k = { startIndex: l[0] + 1 };
      b.fixLine(p, k), M(() => {
        let I = window.getSelection(), L = document.createRange();
        L.setStartAfter(u.childNodes[k.startIndex] ?? u.lastChild), L.setEndAfter(u.childNodes[k.startIndex] ?? u.lastChild), I.removeAllRanges(), I.addRange(L);
      });
    };
    return ue(() => {
      n();
    }), (a, p) => (D(), X("div", {
      style: { width: "100%", height: "100%", position: "absolute", "z-index": "10000", left: "0px", top: "0px" },
      onClick: fe(r, ["self"])
    }, [
      $("div", {
        style: le([{ width: "150px", height: "200px", padding: "5px", "box-sizing": "border-box", position: "absolute", "box-shadow": "0px 0px 2px 2px rgba(169, 169, 169, 0.2)", border: "1px solid rgba(169, 169, 169, 0.2)", "background-color": "white", overflow: "auto", "outline-width": "0" }, {
          left: a.position.left + "px",
          top: a.position.top + "px"
        }]),
        ref_key: "rootEle",
        ref: o,
        onMousedown: c
      }, [
        $("div", Pe, [
          me($("input", {
            "onUpdate:modelValue": p[0] || (p[0] = (u) => s.value = u),
            style: { width: "100%", "box-sizing": "border-box" },
            onInput: n
          }, null, 544), [
            [ge, s.value]
          ])
        ]),
        (D(!0), X(U, null, Y(t.value, (u) => (D(), X("div", {
          class: "hover",
          style: { height: "40px", display: "flex", "align-items": "center" },
          onClick: (h) => d(u)
        }, [
          u.photo ? (D(), X("img", {
            key: 0,
            style: { width: "30px", height: "30px", "border-radius": "15px" },
            src: u.photo
          }, null, 8, Oe)) : ee("", !0),
          ye("  " + de(u.label), 1)
        ], 8, we))), 256))
      ], 36)
    ]));
  }
}), Me = /* @__PURE__ */ ne(Ae, [["__scopeId", "data-v-dd631648"]]), Re = ["onBlur", "innerHTML", "onKeydown", "onFocus", "placeholder"], De = ["innerHTML"], He = /* @__PURE__ */ te({
  __name: "index",
  props: {
    readonly: { type: Boolean },
    modelValue: {},
    border: { type: Boolean },
    popMenuList: {},
    placeholder: {},
    quoteType: {}
  },
  emits: ["update:modelValue", "uploadFile", "popMenuClick", "customAnchorClick", "quoteList", "metaEnter", "linkClick", "setLineConfigType", "getLineConfigType"],
  setup(E, { expose: e, emit: s }) {
    const o = s, t = E, i = V(), l = V([]);
    let n = [0, 0, 0];
    const r = V(), c = V(), d = new Se(i, r, c);
    d.onSetLineConfigType = (m, x) => {
      o("setLineConfigType", m, x);
    }, d.onGetLineConfigType = (m, x) => {
      o("getLineConfigType", m, x);
    }, d.onUploadFileFunc = (m, x) => {
      o("uploadFile", m, x);
    }, d.onPopMenuClickFunc = (m, x) => {
      o("popMenuClick", m, x);
    }, d.onCustomMenuClickFunc = (m, x, T, S) => {
      o("customAnchorClick", m, x, T, S);
    }, Ee().vnode.props.onQuoteList && (d.onQuoteListFunc = (m, x) => {
      o("quoteList", m, x);
    });
    const a = d.getLineList();
    let p = [], u = !1;
    ie(a, () => {
      o("update:modelValue", a);
    }, {
      deep: !0
    }), ie(() => t.modelValue, (m, x, T) => {
      if (d.setLineList(t.modelValue), a.length == 0 && d.addLine(""), x && x.length > 0 && !u) {
        let S = JSON.parse(JSON.stringify(x));
        S.forEach((R) => {
          delete R.selectStartIndexPath, delete R.selectEndIndexPath;
        });
        let A = JSON.stringify(S);
        if (p.length == 0)
          p.unshift(S);
        else {
          let R = p[0];
          JSON.stringify(R) !== A && p.unshift(S);
        }
        p.length > 10 && p.pop();
      } else
        u === !0 && (u = !1);
    }, {
      deep: !0,
      immediate: !0
    });
    const h = (m, x) => {
      d.onFocus(m, x);
    }, f = (m) => {
      d.onDbClick(m);
    }, g = (m, x) => {
      d.onBlur(m, x);
    }, k = (m, x, T) => {
      T.metaKey ? (b.handleInnerHtml(m, T.currentTarget, !1, d.onGetLineConfigType), M(() => {
        o("metaEnter");
      })) : d.onEnter(m, x, T);
    }, I = (m, x, T) => {
      d.onDelete(m, x, T);
    }, L = (m) => {
      d.onMouseDown(m);
    }, O = (m) => {
      d.onMouseMove(m);
    }, v = () => {
      let m = window.getSelection();
      if (m.rangeCount == 0)
        return;
      let x = m.getRangeAt(0), T = x.startOffset;
      n = [];
      let S = x.startContainer;
      if (S.tagName === "DIV")
        n = [0, T], n.unshift(Array.from(S.parentElement.children).indexOf(S));
      else {
        n = [T];
        let A = S.parentElement;
        A.tagName == "DIV" ? (T = Array.from(A.childNodes).indexOf(S), n.unshift(T), S = A) : (T = Array.from(A.parentElement.childNodes).indexOf(A), n.unshift(T), S = A.parentElement), n.unshift(Array.from(S.parentElement.children).indexOf(S));
      }
    }, q = (m) => {
      v();
    }, K = (m) => {
      d.onMouseUp(m), v();
    }, J = (m) => {
      d.onPaste(m);
    }, N = (m) => {
      t.readonly || d.onMouseOver(m);
    }, P = (m) => {
      d.onCopy(m);
    }, C = (m) => {
      if (!t.readonly && (d.onKeyDown(m), m.key == "z" && (m.metaKey || m.ctrlKey))) {
        if (m.stopPropagation(), m.preventDefault(), p.length > 0) {
          let x = p.shift();
          d.setLineList(x);
        }
        u = !0;
      }
    }, H = (m) => {
      if (d.onClick(m), t.readonly) {
        let x = m.target, T = x.getAttribute("type");
        if (x.tagName === "A" && T) {
          let S = x.getAttribute("value");
          o("linkClick", Number(T), S, m.x, m.y);
        }
      }
    }, _ = (m) => {
      if (m.length == 0)
        return;
      let x = [];
      m.forEach((z) => {
        x.push(z, {
          type: y.TEXT,
          value: "&nbsp;"
        });
      });
      let T = a[n[0]], S = l.value[n[0]];
      b.handleInnerHtml(T, S, !1, d.onGetLineConfigType);
      let A = T.arr[n[1]], R;
      if (A) {
        let z = JSON.parse(JSON.stringify(A));
        z.value = A.value.substring(n[2]), A.value = A.value.substring(0, n[2]), T.arr.splice(n[1] + 1, 0, ...x, z), R = { endIndex: n[1] + x.length };
      } else
        T.arr.push(...x), R = { endIndex: n[1] + x.length - 1 };
      b.fixLine(T, R), M(() => {
        let z = window.getSelection(), Z = document.createRange();
        Z.setStart(S.childNodes[R.endIndex], 1), Z.setEnd(S.childNodes[R.endIndex], 1), z.removeAllRanges(), z.addRange(Z);
      });
    };
    return xe(() => {
      d.clear();
    }), e({
      insertConfig: _
    }), (m, x) => {
      var T;
      return D(), X(U, null, [
        $("div", Ie({
          ref_key: "root",
          ref: i,
          onMouseover: N,
          onKeydown: C,
          style: [{ padding: "10px" }, { border: m.border ? "border: 1px solid lightgray;" : "0px" }],
          onKeyup: q,
          onCopy: P
        }, m.$attrs), [
          m.readonly ? (D(!0), X(U, { key: 1 }, Y(G(a), (S, A) => (D(), X("div", {
            onClick: H,
            key: A + 1,
            innerHTML: G(b).handle(S, G(d).onSetLineConfigType),
            style: { "line-height": "1.5", "min-height": "21px" }
          }, null, 8, De))), 128)) : (D(!0), X(U, { key: 0 }, Y(G(a), (S, A) => (D(), X("div", {
            key: A,
            contenteditable: "true",
            onBlur: (R) => g(S, R),
            ref_for: !0,
            ref_key: "elementList",
            ref: l,
            innerHTML: G(b).handle(S, G(d).onSetLineConfigType),
            onKeydown: [
              se((R) => k(S, A, R), ["enter"]),
              se((R) => I(A, S, R), ["delete"])
            ],
            style: { "line-height": "1.5" },
            onFocus: (R) => h(S, R),
            onMousedown: L,
            onMouseup: K,
            onMousemove: O,
            onDblclick: f,
            onPaste: J,
            onClick: H,
            placeholder: m.placeholder ?? "type something"
          }, null, 40, Re))), 128))
        ], 16),
        r.value && ((T = m.popMenuList) == null ? void 0 : T.length) > 0 ? (D(), re(oe, {
          key: 0,
          to: "body"
        }, [
          ae(ke, {
            "obj-editor": G(d),
            "pop-menu-list": m.popMenuList,
            style: le({
              left: r.value.left + "px",
              top: r.value.top + "px"
            })
          }, null, 8, ["obj-editor", "pop-menu-list", "style"])
        ])) : ee("", !0),
        c.value && m.quoteType != null ? (D(), re(oe, {
          key: 1,
          to: "body"
        }, [
          ae(Me, {
            "obj-editor": G(d),
            "quote-type": m.quoteType,
            position: c.value
          }, null, 8, ["obj-editor", "quote-type", "position"])
        ])) : ee("", !0)
      ], 64);
    };
  }
}), je = /* @__PURE__ */ ne(He, [["__scopeId", "data-v-7636bc68"]]), Ge = {
  install(E, e) {
    E.component("TLEditor", je);
  }
};
export {
  y as EEditor_Content_Line_Config_Type,
  je as TLEditor,
  Ge as default
};

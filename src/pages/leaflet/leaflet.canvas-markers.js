/**
 * author github
 * source https://github.com/gisarmory/Leaflet.Canvas-Markers
 *
 */
!function(t) {
  var n = {}

  function i(e) {
    if (n[e]) return n[e].exports
    var a = n[e] = { i: e, l: !1, exports: {} }
    return t[e].call(a.exports, a, a.exports, i), a.l = !0, a.exports
  }

  i.m = t, i.c = n, i.d = function(t, n, e) {
    i.o(t, n) || Object.defineProperty(t, n, { enumerable: !0, get: e })
  }, i.r = function(t) {
    'undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }), Object.defineProperty(t, '__esModule', { value: !0 })
  }, i.t = function(t, n) {
    if (1 & n && (t = i(t)), 8 & n) return t
    if (4 & n && 'object' == typeof t && t && t.__esModule) return t
    var e = Object.create(null)
    if (i.r(e), Object.defineProperty(e, 'default', {
      enumerable: !0,
      value: t
    }), 2 & n && 'string' != typeof t) {
      for (var a in t) {
        i.d(e, a, function(n) {
          return t[n]
        }.bind(null, a))
      }
    }
    return e
  }, i.n = function(t) {
    var n = t && t.__esModule ? function() {
      return t.default
    } : function() {
      return t
    }
    return i.d(n, 'a', n), n
  }, i.o = function(t, n) {
    return Object.prototype.hasOwnProperty.call(t, n)
  }, i.p = '', i(i.s = 0)
}([function(t, n, i) {
  var e = i(1), a = i(3)
  window.L.CanvasIconLayer = a(L), window.rbush = e
}, function(t, n, i) {
  'use strict'
  t.exports = a, t.exports.default = a
  var e = i(2)

  function a(t, n) {
    if (!(this instanceof a)) return new a(t, n)
    this._maxEntries = Math.max(4, t || 9), this._minEntries = Math.max(2, Math.ceil(.4 * this._maxEntries)), n && this._initFormat(n), this.clear()
  }

  function o(t, n, i) {
    if (!i) return n.indexOf(t)
    for (var e = 0; e < n.length; e++) if (i(t, n[e])) return e
    return -1
  }

  function r(t, n) {
    s(t, 0, t.children.length, n, t)
  }

  function s(t, n, i, e, a) {
    a || (a = d(null)), a.minX = 1 / 0, a.minY = 1 / 0, a.maxX = -1 / 0, a.maxY = -1 / 0
    for (var o, r = n; r < i; r++) o = t.children[r], h(a, t.leaf ? e(o) : o)
    return a
  }

  function h(t, n) {
    return t.minX = Math.min(t.minX, n.minX), t.minY = Math.min(t.minY, n.minY), t.maxX = Math.max(t.maxX, n.maxX), t.maxY = Math.max(t.maxY, n.maxY), t
  }

  function c(t, n) {
    return t.minX - n.minX
  }

  function l(t, n) {
    return t.minY - n.minY
  }

  function m(t) {
    return (t.maxX - t.minX) * (t.maxY - t.minY)
  }

  function u(t) {
    return t.maxX - t.minX + (t.maxY - t.minY)
  }

  function _(t, n) {
    return t.minX <= n.minX && t.minY <= n.minY && n.maxX <= t.maxX && n.maxY <= t.maxY
  }

  function f(t, n) {
    return n.minX <= t.maxX && n.minY <= t.maxY && n.maxX >= t.minX && n.maxY >= t.minY
  }

  function d(t) {
    return { children: t, height: 1, leaf: !0, minX: 1 / 0, minY: 1 / 0, maxX: -1 / 0, maxY: -1 / 0 }
  }

  function p(t, n, i, a, o) {
    for (var r, s = [n, i]; s.length;) (i = s.pop()) - (n = s.pop()) <= a || (r = n + Math.ceil((i - n) / a / 2) * a, e(t, r, n, i, o), s.push(n, r, r, i))
  }

  a.prototype = {
    all: function() {
      return this._all(this.data, [])
    }, search: function(t) {
      var n = this.data, i = [], e = this.toBBox
      if (!f(t, n)) return i
      for (var a, o, r, s, h = []; n;) {
        for (a = 0, o = n.children.length; a < o; a++) r = n.children[a], f(t, s = n.leaf ? e(r) : r) && (n.leaf ? i.push(r) : _(t, s) ? this._all(r, i) : h.push(r))
        n = h.pop()
      }
      return i
    }, collides: function(t) {
      var n = this.data, i = this.toBBox
      if (!f(t, n)) return !1
      for (var e, a, o, r, s = []; n;) {
        for (e = 0, a = n.children.length; e < a; e++) {
          if (o = n.children[e], f(t, r = n.leaf ? i(o) : o)) {
            if (n.leaf || _(t, r)) return !0
            s.push(o)
          }
        }
        n = s.pop()
      }
      return !1
    }, load: function(t) {
      if (!t || !t.length) return this
      if (t.length < this._minEntries) {
        for (var n = 0, i = t.length; n < i; n++) this.insert(t[n])
        return this
      }
      var e = this._build(t.slice(), 0, t.length - 1, 0)
      if (this.data.children.length) {
        if (this.data.height === e.height) {
          this._splitRoot(this.data, e)
        } else {
          if (this.data.height < e.height) {
            var a = this.data
            this.data = e, e = a
          }
          this._insert(e, this.data.height - e.height - 1, !0)
        }
      } else {
        this.data = e
      }
      return this
    }, insert: function(t) {
      return t && this._insert(t, this.data.height - 1), this
    }, clear: function() {
      return this.data = d([]), this
    }, remove: function(t, n) {
      if (!t) return this
      for (var i, e, a, r, s = this.data, h = this.toBBox(t), c = [], l = []; s || c.length;) {
        if (s || (s = c.pop(), e = c[c.length - 1], i = l.pop(), r = !0), s.leaf && -1 !== (a = o(t, s.children, n))) return s.children.splice(a, 1), c.push(s), this._condense(c), this
        r || s.leaf || !_(s, h) ? e ? (i++, s = e.children[i], r = !1) : s = null : (c.push(s), l.push(i), i = 0, e = s, s = s.children[0])
      }
      return this
    }, toBBox: function(t) {
      return t
    }, compareMinX: c, compareMinY: l, toJSON: function() {
      return this.data
    }, fromJSON: function(t) {
      return this.data = t, this
    }, _all: function(t, n) {
      for (var i = []; t;) t.leaf ? n.push.apply(n, t.children) : i.push.apply(i, t.children), t = i.pop()
      return n
    }, _build: function(t, n, i, e) {
      var a, o = i - n + 1, s = this._maxEntries
      if (o <= s) return r(a = d(t.slice(n, i + 1)), this.toBBox), a
      e || (e = Math.ceil(Math.log(o) / Math.log(s)), s = Math.ceil(o / Math.pow(s, e - 1))), (a = d([])).leaf = !1, a.height = e
      var h, c, l, m, u = Math.ceil(o / s), _ = u * Math.ceil(Math.sqrt(s))
      for (p(t, n, i, _, this.compareMinX), h = n; h <= i; h += _) for (p(t, h, l = Math.min(h + _ - 1, i), u, this.compareMinY), c = h; c <= l; c += u) m = Math.min(c + u - 1, l), a.children.push(this._build(t, c, m, e - 1))
      return r(a, this.toBBox), a
    }, _chooseSubtree: function(t, n, i, e) {
      for (var a, o, r, s, h, c, l, u, _, f; e.push(n), !n.leaf && e.length - 1 !== i;) {
        for (l = u = 1 / 0, a = 0, o = n.children.length; a < o; a++) h = m(r = n.children[a]), _ = t, f = r, (c = (Math.max(f.maxX, _.maxX) - Math.min(f.minX, _.minX)) * (Math.max(f.maxY, _.maxY) - Math.min(f.minY, _.minY)) - h) < u ? (u = c, l = h < l ? h : l, s = r) : c === u && h < l && (l = h, s = r)
        n = s || n.children[0]
      }
      return n
    }, _insert: function(t, n, i) {
      var e = this.toBBox, a = i ? t : e(t), o = [], r = this._chooseSubtree(a, this.data, n, o)
      for (r.children.push(t), h(r, a); n >= 0 && o[n].children.length > this._maxEntries;) this._split(o, n), n--
      this._adjustParentBBoxes(a, o, n)
    }, _split: function(t, n) {
      var i = t[n], e = i.children.length, a = this._minEntries
      this._chooseSplitAxis(i, a, e)
      var o = this._chooseSplitIndex(i, a, e), s = d(i.children.splice(o, i.children.length - o))
      s.height = i.height, s.leaf = i.leaf, r(i, this.toBBox), r(s, this.toBBox), n ? t[n - 1].children.push(s) : this._splitRoot(i, s)
    }, _splitRoot: function(t, n) {
      this.data = d([t, n]), this.data.height = t.height + 1, this.data.leaf = !1, r(this.data, this.toBBox)
    }, _chooseSplitIndex: function(t, n, i) {
      var e, a, o, r, h, c, l, u, _, f, d, p, x, g
      for (c = l = 1 / 0, e = n; e <= i - n; e++) a = s(t, 0, e, this.toBBox), o = s(t, e, i, this.toBBox), _ = a, f = o, void 0, void 0, void 0, void 0, d = Math.max(_.minX, f.minX), p = Math.max(_.minY, f.minY), x = Math.min(_.maxX, f.maxX), g = Math.min(_.maxY, f.maxY), r = Math.max(0, x - d) * Math.max(0, g - p), h = m(a) + m(o), r < c ? (c = r, u = e, l = h < l ? h : l) : r === c && h < l && (l = h, u = e)
      return u
    }, _chooseSplitAxis: function(t, n, i) {
      var e = t.leaf ? this.compareMinX : c, a = t.leaf ? this.compareMinY : l
      this._allDistMargin(t, n, i, e) < this._allDistMargin(t, n, i, a) && t.children.sort(e)
    }, _allDistMargin: function(t, n, i, e) {
      t.children.sort(e)
      var a, o, r = this.toBBox, c = s(t, 0, n, r), l = s(t, i - n, i, r), m = u(c) + u(l)
      for (a = n; a < i - n; a++) o = t.children[a], h(c, t.leaf ? r(o) : o), m += u(c)
      for (a = i - n - 1; a >= n; a--) o = t.children[a], h(l, t.leaf ? r(o) : o), m += u(l)
      return m
    }, _adjustParentBBoxes: function(t, n, i) {
      for (var e = i; e >= 0; e--) h(n[e], t)
    }, _condense: function(t) {
      for (var n, i = t.length - 1; i >= 0; i--) 0 === t[i].children.length ? i > 0 ? (n = t[i - 1].children).splice(n.indexOf(t[i]), 1) : this.clear() : r(t[i], this.toBBox)
    }, _initFormat: function(t) {
      var n = ['return a', ' - b', ';']
      this.compareMinX = new Function('a', 'b', n.join(t[0])), this.compareMinY = new Function('a', 'b', n.join(t[1])), this.toBBox = new Function('a', 'return {minX: a' + t[0] + ', minY: a' + t[1] + ', maxX: a' + t[2] + ', maxY: a' + t[3] + '};')
    }
  }
}, function(t, n, i) {
  t.exports = function() {
    'use strict'

    function t(t, n, i) {
      var e = t[n]
      t[n] = t[i], t[i] = e
    }

    function n(t, n) {
      return t < n ? -1 : t > n ? 1 : 0
    }

    return function(i, e, a, o, r) {
      !function n(i, e, a, o, r) {
        for (; o > a;) {
          if (o - a > 600) {
            var s = o - a + 1, h = e - a + 1, c = Math.log(s), l = .5 * Math.exp(2 * c / 3),
              m = .5 * Math.sqrt(c * l * (s - l) / s) * (h - s / 2 < 0 ? -1 : 1),
              u = Math.max(a, Math.floor(e - h * l / s + m)), _ = Math.min(o, Math.floor(e + (s - h) * l / s + m))
            n(i, e, u, _, r)
          }
          var f = i[e], d = a, p = o
          for (t(i, a, e), r(i[o], f) > 0 && t(i, a, o); d < p;) {
            for (t(i, d, p), d++, p--; r(i[d], f) < 0;) d++
            for (; r(i[p], f) > 0;) p--
          }
          0 === r(i[a], f) ? t(i, a, p) : t(i, ++p, o), p <= e && (a = p + 1), e <= p && (o = p - 1)
        }
      }(i, e, a || 0, o || i.length - 1, r || n)
    }
  }()
}, function(t, n, i) {
  'use strict'
  t.exports = function(t) {
    var CanvasIconLayer = (L.Layer ? L.Layer : L.Class).extend({

      //Add event listeners to initialized section.
      initialize: function (options) {

        L.setOptions(this, options);
        this._onClickListeners = [];
        this._onHoverListeners = [];
      },

      setOptions: function (options) {

        L.setOptions(this, options);
        return this.redraw();
      },

      redraw: function () {

        this._redraw(true);
      },

      //Multiple layers at a time for rBush performance
      addMarkers: function (markers) {

        var self = this;
        var tmpMark = [];
        var tmpLatLng = [];

        markers.forEach(function (marker) {

          if (!((marker.options.pane == 'markerPane') && marker.options.icon))
          {
            console.error('Layer isn\'t a marker');
            return;
          }

          var latlng = marker.getLatLng();
          var isDisplaying = self._map.getBounds().contains(latlng);
          var s = self._addMarker(marker,latlng,isDisplaying);

          //Only add to Point Lookup if we are on map
          if (isDisplaying ===true) tmpMark.push(s[0]);

          tmpLatLng.push(s[1]);
        });

        self._markers.load(tmpMark);
        self._latlngMarkers.load(tmpLatLng);
      },

      //Adds single layer at a time. Less efficient for rBush
      addMarker: function (marker) {

        var self = this;
        var latlng = marker.getLatLng();
        var isDisplaying = self._map.getBounds().contains(latlng);
        var dat = self._addMarker(marker,latlng,isDisplaying);

        //Only add to Point Lookup if we are on map
        if(isDisplaying ===true) self._markers.insert(dat[0]);

        self._latlngMarkers.insert(dat[1]);
      },

      addLayer: function (layer) {

        if ((layer.options.pane == 'markerPane') && layer.options.icon) this.addMarker(layer);
        else console.error('Layer isn\'t a marker');
      },

      addLayers: function (layers) {

        this.addMarkers(layers);
      },

      removeLayer: function (layer) {

        this.removeMarker(layer,true);
      },

      removeMarker: function (marker,redraw) {

        var self = this;

        //If we are removed point
        if(marker["minX"]) marker = marker.data;

        var latlng = marker.getLatLng();
        var isDisplaying = self._map.getBounds().contains(latlng);

        var markerData = {

          minX: latlng.lng,
          minY: latlng.lat,
          maxX: latlng.lng,
          maxY: latlng.lat,
          data: marker
        };

        self._latlngMarkers.remove(markerData, function (a,b) {

          return a.data._leaflet_id ===b.data._leaflet_id;
        });

        self._latlngMarkers.total--;
        self._latlngMarkers.dirty++;

        if(isDisplaying ===true && redraw ===true) {

          self._redraw(true);
        }
      },

      onAdd: function (map) {

        this._map = map;

        if (!this._canvas) this._initCanvas();

        if (this.options.pane) this.getPane().appendChild(this._canvas);
        else map._panes.overlayPane.appendChild(this._canvas);

        map.on('move', this._reset, this);
        map.on('moveend', this._reset, this);
        map.on('resize',this._reset,this);

        map.on('click', this._executeListeners, this);
        map.on('mousemove', this._executeListeners, this);

        if (map._zoomAnimated) {
          map.on('zoomanim', this._animateZoom, this);
        }
      },

      onRemove: function (map) {

        if (this.options.pane) this.getPane().removeChild(this._canvas);
        else map.getPanes().overlayPane.removeChild(this._canvas);

        map.off('click', this._executeListeners, this);
        map.off('mousemove', this._executeListeners, this);

        map.off('move', this._reset, this);
        map.off('moveend', this._reset, this);
        map.off('resize',this._reset,this);


        if (map._zoomAnimated) {
          map.off('zoomanim', this._animateZoom, this);
        }
      },

      addTo: function (map) {

        map.addLayer(this);
        return this;
      },

      clearLayers: function() {

        this._latlngMarkers = null;
        this._markers = null;
        this._redraw(true);
      },

      _animateZoom: function(event) {
        var scale = this._map.getZoomScale(event.zoom);
        var offset = this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), event.zoom, event.center).min;

        L.DomUtil.setTransform(this._canvas, offset, scale);
      },

      _addMarker: function(marker,latlng,isDisplaying) {

        var self = this;
        //Needed for pop-up & tooltip to work.
        marker._map = self._map;

        //_markers contains Points of markers currently displaying on map
        if (!self._markers) self._markers = new rbush();

        //_latlngMarkers contains Lat\Long coordinates of all markers in layer.
        if (!self._latlngMarkers) {
          self._latlngMarkers = new rbush();
          self._latlngMarkers.dirty=0;
          self._latlngMarkers.total=0;
        }

        L.Util.stamp(marker);

        var pointPos = self._map.latLngToContainerPoint(latlng);
        var iconSize = marker.options.icon.options.iconSize;

        var adj_x = iconSize[0]/2;
        var adj_y = iconSize[1]/2;
        var ret = [({
          minX: (pointPos.x - adj_x),
          minY: (pointPos.y - adj_y),
          maxX: (pointPos.x + adj_x),
          maxY: (pointPos.y + adj_y),
          data: marker
        }),({
          minX: latlng.lng,
          minY: latlng.lat,
          maxX: latlng.lng,
          maxY: latlng.lat,
          data: marker
        })];

        self._latlngMarkers.dirty++;
        self._latlngMarkers.total++;

        //Only draw if we are on map
        if(isDisplaying===true) self._drawMarker(marker, pointPos);

        return ret;
      },

      _drawMarker: function (marker, pointPos) {

        var self = this;

        if (!this._imageLookup) this._imageLookup = {};
        if (!pointPos) {

          pointPos = self._map.latLngToContainerPoint(marker.getLatLng());
        }

        var iconUrl = marker.options.icon.options.iconUrl;

        if (marker.canvas_img) {

          self._drawImage(marker, pointPos);
          self._drawText(marker, pointPos);
        }
        else {

          if(self._imageLookup[iconUrl]) {

            marker.canvas_img = self._imageLookup[iconUrl][0];

            if (self._imageLookup[iconUrl][1] ===false) {

              self._imageLookup[iconUrl][2].push([marker,pointPos]);
            }
            else {

              self._drawImage(marker,pointPos);
              self._drawText(marker,pointPos);
            }
          }
          else {

            var i = new Image();
            i.src = iconUrl;
            marker.canvas_img = i;

            //Image,isLoaded,marker\pointPos ref
            self._imageLookup[iconUrl] = [i, false, [[marker, pointPos]]];

            i.onload = function() {

              self._imageLookup[iconUrl][1] = true;
              self._imageLookup[iconUrl][2].forEach(function (e) {

                self._drawImage(e[0],e[1]);
                self._drawText(e[0],e[1]);
              });
            }
          }
        }
      },

      _drawImage: function (marker, pointPos) {

        var options = marker.options.icon.options;
        var e = marker.options.rotationAngle
        e?(this._context.save(), this._context.translate(pointPos.x, pointPos.y),this._context.rotate(e * Math.PI / 180),
                this._context.drawImage(marker.canvas_img, -  options.iconAnchor[0], -  options.iconAnchor[1], options.iconSize[0], options.iconSize[1]), this._context.restore())
            : this._context.drawImage(marker.canvas_img, pointPos.x - options.iconAnchor[0], pointPos.y - options.iconAnchor[1], options.iconSize[0], options.iconSize[1]);

      },

      _drawText: function (marker, pointPos){

        var options = marker.options.icon.options;
        if(options.text){
          this._context.font = options.textFont,
              this._context.fillStyle = options.textFillStyle,
              this._context.fillText(
                  options.text,
                  pointPos.x - options.textAnchor[0],
                  pointPos.y - options.textAnchor[1],
              );
        }
      },

      _reset: function () {

        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        var size = this._map.getSize();

        this._canvas.width = size.x;
        this._canvas.height = size.y;

        this._redraw();
      },

      _redraw: function (clear) {

        var self = this;

        if (clear) this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        if (!this._map || !this._latlngMarkers) return;

        var tmp = [];

        //If we are 10% individual inserts\removals, reconstruct lookup for efficiency
        if (self._latlngMarkers.dirty/self._latlngMarkers.total >= .1) {

          self._latlngMarkers.all().forEach(function(e) {

            tmp.push(e);
          });

          self._latlngMarkers.clear();
          self._latlngMarkers.load(tmp);
          self._latlngMarkers.dirty=0;
          tmp = [];
        }

        var mapBounds = self._map.getBounds();

        //Only re-draw what we are showing on the map.

        var mapBoxCoords = {

          minX: mapBounds.getWest(),
          minY: mapBounds.getSouth(),
          maxX: mapBounds.getEast(),
          maxY: mapBounds.getNorth(),
        };

        self._latlngMarkers.search(mapBoxCoords).forEach(function (e) {

          //Readjust Point Map
          var pointPos = self._map.latLngToContainerPoint(e.data.getLatLng());

          var iconSize = e.data.options.icon.options.iconSize;
          var adj_x = iconSize[0]/2;
          var adj_y = iconSize[1]/2;

          var newCoords = {
            minX: (pointPos.x - adj_x),
            minY: (pointPos.y - adj_y),
            maxX: (pointPos.x + adj_x),
            maxY: (pointPos.y + adj_y),
            data: e.data
          }

          tmp.push(newCoords);

          //Redraw points
          self._drawMarker(e.data, pointPos);
        });

        //Clear rBush & Bulk Load for performance
        this._markers.clear();
        this._markers.load(tmp);
      },

      _initCanvas: function () {

        this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-icon-layer leaflet-layer');

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        this._context = this._canvas.getContext('2d');

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
      },

      addOnClickListener: function (listener) {
        this._onClickListeners.push(listener);
      },

      addOnHoverListener: function (listener) {
        this._onHoverListeners.push(listener);
      },

      _executeListeners: function (event) {

        if (!this._markers) return;

        var me = this;
        var x = event.containerPoint.x;
        var y = event.containerPoint.y;

        if(me._openToolTip) {

          me._openToolTip.closeTooltip();
          delete me._openToolTip;
        }

        var ret = this._markers.search({ minX: x, minY: y, maxX: x, maxY: y });

        if (ret && ret.length > 0) {

          me._map._container.style.cursor="pointer";

          if (event.type==="click") {

            var hasPopup = ret[0].data.getPopup();
            if(hasPopup) ret[0].data.openPopup();

            me._onClickListeners.forEach(function (listener) { listener(event, ret); });
          }

          if (event.type==="mousemove") {
            var hasTooltip = ret[0].data.getTooltip();
            if(hasTooltip) {
              me._openToolTip = ret[0].data;
              ret[0].data.openTooltip();
            }

            me._onHoverListeners.forEach(function (listener) { listener(event, ret); });
          }
        }
        else {

          me._map._container.style.cursor="";
        }
      }
    });

    L.canvasIconLayer = function (options) {
      return new CanvasIconLayer(options);
    };
  }
}]);

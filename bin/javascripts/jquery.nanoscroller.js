
(function($, window, document) {
  "use strict";
  var DOMSCROLL, DOWN, DRAG, MOUSEDOWN, MOUSEMOVE, MOUSEUP, MOUSEWHEEL, NanoScroll, PANEDOWN, RESIZE, SCROLL, SCROLLBAR, UP, WHEEL, defaults, getScrollbarWidth;
  SCROLLBAR = 'scrollbar';
  SCROLL = 'scroll';
  MOUSEDOWN = 'mousedown';
  MOUSEMOVE = 'mousemove';
  MOUSEWHEEL = 'mousewheel';
  MOUSEUP = 'mouseup';
  RESIZE = 'resize';
  DRAG = 'drag';
  UP = 'up';
  PANEDOWN = 'panedown';
  DOMSCROLL = 'DOMMouseScroll';
  DOWN = 'down';
  WHEEL = 'wheel';
  defaults = {
    paneClass: 'pane',
    sliderClass: 'slider',
    contentClass: 'content'
  };
  getScrollbarWidth = function() {
    var outer, outerStyle, scrollbarWidth;
    outer = document.createElement('div');
    outerStyle = outer.style;
    outerStyle.position = 'absolute';
    outerStyle.width = '100px';
    outerStyle.height = '100px';
    outerStyle.overflow = SCROLL;
    outerStyle.top = '-9999px';
    document.body.appendChild(outer);
    scrollbarWidth = outer.offsetWidth - outer.clientWidth;
    document.body.removeChild(outer);
    return scrollbarWidth;
  };
  NanoScroll = (function() {

    function NanoScroll(el, options) {
      this.options = options;
      this.el = $(el);
      this.doc = $(document);
      this.win = $(window);
      this.generate();
      this.createEvents();
      this.addEvents();
      this.reset();
    }

    NanoScroll.prototype.createEvents = function() {
      var _this = this;
      this.events = {
        down: function(e) {
          _this.isDrag = true;
          _this.offsetY = e.clientY - _this.slider.offset().top;
          _this.pane.addClass('active');
          _this.doc.bind(MOUSEMOVE, _this.events[DRAG]).bind(MOUSEUP, _this.events[UP]);
          return false;
        },
        drag: function(e) {
          _this.sliderY = e.clientY - _this.el.offset().top - _this.offsetY;
          _this.scroll();
          return false;
        },
        up: function(e) {
          _this.isDrag = false;
          _this.pane.removeClass('active');
          _this.doc.unbind(MOUSEMOVE, _this.events[DRAG]).unbind(MOUSEUP, _this.events[UP]);
          return false;
        },
        resize: function(e) {
          _this.reset();
        },
        panedown: function(e) {
          _this.sliderY = e.clientY - _this.el.offset().top - _this.sliderH * 0.5;
          _this.scroll();
          _this.events.down(e);
        },
        scroll: function(e) {
          var content, top;
          if (_this.isDrag === true) return;
          content = _this.content[0];
          top = content.scrollTop / (content.scrollHeight - content.clientHeight) * (_this.paneH - _this.sliderH);
          _this.slider.css({
            top: top + 'px'
          });
        },
        wheel: function(e) {
          _this.sliderY += -e.wheelDeltaY || -e.delta;
          _this.scroll();
          return false;
        }
      };
    };

    NanoScroll.prototype.addEvents = function() {
      var events, pane;
      events = this.events;
      pane = this.pane;
      this.win.bind(RESIZE, events[RESIZE]);
      this.slider.bind(MOUSEDOWN, events[DOWN]);
      pane.bind(MOUSEDOWN, events[PANEDOWN]);
      this.content.bind(SCROLL, events[SCROLL]);
      if (window.addEventListener) {
        pane = pane[0];
        pane.addEventListener(MOUSEWHEEL, events[WHEEL], false);
        pane.addEventListener(DOMSCROLL, events[WHEEL], false);
      }
    };

    NanoScroll.prototype.removeEvents = function() {
      var events, pane;
      events = this.events;
      pane = this.pane;
      this.win.unbind(RESIZE, events[RESIZE]);
      this.slider.unbind(MOUSEDOWN, events[DOWN]);
      pane.unbind(MOUSEDOWN, events[PANEDOWN]);
      this.content.unbind(SCROLL, events[SCROLL]);
      if (window.addEventListener) {
        pane = pane[0];
        pane.removeEventListener(MOUSEWHEEL, events[WHEEL], false);
        pane.removeEventListener(DOMSCROLL, events[WHEEL], false);
      }
    };

    NanoScroll.prototype.generate = function() {
      var options;
      options = this.options;
      this.el.append('<div class="' + options.paneClass + '"><div class="' + options.sliderClass + '" /></div>');
      this.content = $(this.el.children("." + options.contentClass)[0]);
      this.slider = this.el.find("." + options.sliderClass);
      this.pane = this.el.find("." + options.paneClass);
      this.scrollW = getScrollbarWidth();
      this.content.css({
        right: -this.scrollW + 'px'
      });
    };

    NanoScroll.prototype.reset = function() {
      var content, contentStyle, contentStyleOverflowY;
      if (!this.el.find("." + this.options.paneClass).length) {
        this.generate();
        this.stop();
      }
      if (this.isDead === true) {
        this.isDead = false;
        this.pane.show();
        this.addEvents();
      }
      content = this.content[0];
      contentStyle = content.style;
      contentStyleOverflowY = contentStyle.overflowY;
      if ($.browser.msie && parseInt($.browser.version, 10) === 7) {
        this.content.css({
          height: this.content.height()
        });
      }
      this.contentH = content.scrollHeight + this.scrollW;
      this.paneH = this.pane.outerHeight();
      this.sliderH = Math.round(this.paneH / this.contentH * this.paneH);
      this.sliderH = this.sliderH > 20 ? this.sliderH : 20;
      if (contentStyleOverflowY === SCROLL && contentStyle.overflowX !== SCROLL) {
        this.sliderH += this.scrollW;
      }
      this.scrollH = this.paneH - this.sliderH;
      this.slider.height(this.sliderH);
      this.diffH = content.scrollHeight - content.clientHeight;
      this.pane.show();
      if (this.paneH >= content.scrollHeight && contentStyleOverflowY !== SCROLL) {
        this.pane.hide();
      } else if (this.el.height() === content.scrollHeight && contentStyleOverflowY === SCROLL) {
        this.slider.hide();
      } else {
        this.slider.show();
      }
    };

    NanoScroll.prototype.scroll = function() {
      var scrollValue;
      this.sliderY = Math.max(0, this.sliderY);
      this.sliderY = Math.min(this.scrollH, this.sliderY);
      scrollValue = (this.paneH - this.contentH + this.scrollW) * this.sliderY / this.scrollH;
      this.content.scrollTop(-scrollValue);
      this.slider.css({
        top: this.sliderY
      });
    };

    NanoScroll.prototype.scrollBottom = function(offsetY) {
      var diffH, scrollTop;
      diffH = this.diffH;
      scrollTop = this.content[0].scrollTop;
      this.reset();
      if (scrollTop < diffH && scrollTop !== 0) return;
      this.content.scrollTop(this.contentH - this.content.height() - offsetY);
    };

    NanoScroll.prototype.scrollTop = function(offsetY) {
      this.reset();
      this.content.scrollTop(+offsetY);
    };

    NanoScroll.prototype.scrollTo = function(node) {
      var fraction, new_slider, offset;
      this.reset();
      offset = $(node).offset().top;
      if (offset > this.scrollH) {
        fraction = offset / this.contentH;
        new_slider = this.scrollH * fraction;
        this.sliderY = new_slider;
        this.scroll();
      }
    };

    NanoScroll.prototype.stop = function() {
      this.isDead = true;
      this.removeEvents();
      this.pane.hide();
    };

    return NanoScroll;

  })();
  $.fn.nanoScroller = function(settings) {
    var options;
    options = $.extend({}, defaults, settings);
    this.each(function() {
      var me, scrollbar;
      me = this;
      scrollbar = $.data(me, SCROLLBAR);
      if (!scrollbar) {
        scrollbar = new NanoScroll(me, options);
        $.data(me, SCROLLBAR, scrollbar);
      }
      if (options.scrollBottom) {
        return scrollbar.scrollBottom(options.scrollBottom);
      }
      if (options.scrollTop) return scrollbar.scrollTop(options.scrollTop);
      if (options.scrollTo) return scrollbar.scrollTo(options.scrollTo);
      if (options.scroll === 'bottom') return scrollbar.scrollBottom(0);
      if (options.scroll === 'top') return scrollbar.scrollTop(0);
      if (options.scroll instanceof $) return scrollbar.scrollTo(options.scroll);
      if (options.stop) return scrollbar.stop();
      return scrollbar.reset();
    });
  };
})(jQuery, window, document);

/*!
* isVis - v0.5.6 Sep 2012 - Page Visibility API Polyfill
* Copyright (c) 2011 Addy Osmani
* Dual licensed under the MIT and GPL licenses.
*/

/*
* https://gist.github.com/3793323
* Firefox support added based on https://developer.mozilla.org/en-US/docs/DOM/Using_the_Page_Visibility_API
* @juanmhidalgo
*/
(function () {

    window.visibly = {
        b: null,
        q: document,
        p: undefined,
        m: ['focus', 'blur'],
        visibleCallbacks: [],
        hiddenCallbacks: [],
        _callbacks: [],
        hidden:undefined,
        visibilityChange:undefined,


        onVisible: function ( _callback ) {
            this.visibleCallbacks.push(_callback);
        },
        onHidden: function ( _callback ) {
            this.hiddenCallbacks.push(_callback);
        },
        isSupported: function () {
            return (typeof this.hidden !== "undefined");
        },
        _supports: function ( index ) {
            return ((this.prefixes[index] + this.props[2]) in this.q);
        },
        runCallbacks: function ( index ) {
            if ( index ) {
                this._callbacks = (index == 1) ? this.visibleCallbacks : this.hiddenCallbacks;
                for (var i = 0; i < this._callbacks.length; i++) {
                    this._callbacks[i]();
                }
            }
        },
        _visible: function () {
            window.visibly.runCallbacks(1);
        },
        _hidden: function () {
            window.visibly.runCallbacks(2);
        },
        _nativeSwitch: function () {
            ((this.q[this.hidden]) === true) ? this._hidden() : this._visible();
        },
        listen: function () {

            try { /*if no native page visibility support found..*/
                if (!(this.isSupported())) {
                    if (document.addEventListener) { /*for browsers without focusin/out support eg. firefox, opera use focus/blur*/
/*window used instead of doc as Opera complains otherwise*/
                        window.addEventListener(this.m[0], this._visible, 1);
                        window.addEventListener(this.m[1], this._hidden, 1);
                    } else { /*IE <10s most reliable focus events are onfocusin/onfocusout*/
                        this.q.attachEvent('onfocusin', this._visible);
                        this.q.attachEvent('onfocusout', this._hidden);
                    }
                } else { /*switch support based on prefix*/
                    this.q.addEventListener(this.visibilityChange, function () {
                        window.visibly._nativeSwitch.apply(window.visibly, arguments);
                    }, 1);
                }
            } catch (e) {}
        },
        init: function () {
            if (typeof document.hidden !== "undefined") {
                this.hidden = "hidden";
                this.visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                this.hidden = "mozHidden";
                this.visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                this.hidden = "msHidden";
                this.visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                this.hidden = "webkitHidden";
                this.visibilityChange = "webkitvisibilitychange";
            }
            this.listen();
        }
    }

    this.visibly.init();

})();

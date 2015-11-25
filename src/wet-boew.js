( function( window ) {

    var pluginSeed = 0,
    plugin = {
        _init: function() {
            var _this = this;
            function preInit() {
                $( _this ).trigger( "wb.pl-pre-init" );

                function nextStep() {
                    var callback;
                    if ( $.isFunction( _this._postInit ) ) {
                        callback = function() {
                            _this._postInit( postInit );
                        };
                    } else {
                        callback = postInit;
                    }
                    loadDependencies( callback );
                }

                if ( $.isFunction( _this._preInit ) ) {
                    _this._preInit( nextStep );
                } else {
                    nextStep();
                }
            }

            function loadDependencies( callback ) {
                if ( _this.deps && _this.deps.length && _this.deps.length > 0 ) {

                    // TODO: Add dependency loader
                    callback();
                } else {
                    callback();
                }
            }

            function postInit() {
                _this.inited = true;
                $( _this ).trigger( "wb.pl-init" );
            }

            if ( !_this.inited ) {
                preInit();
            }
        },

        create: function( $elm, settings ) {
            var _this = this;

            function nextStep() {
                if ( $.isFunction( _this.beforeCreate ) ) {
                    _this.beforeCreate( $elm, settings );
                }

                if ( $.isFunction( _this._create ) ) {
                    var id = $elm.attr( "id" );

                    if ( !id ) {
                        id = "wb-pl-" + ( pluginSeed += 1 );
                        $elm.attr( "id", id );
                    }

                    // TODO: Merge setting with defaults

                    wb.instances[ id ] = $.extend( {}, { $elm: $elm }, _this._create( $elm, settings ) );
                }
            }

            if ( !_this.inited ) {
                $( _this ).on( "wb.pl-init", nextStep );
                _this._init();

            } else {
                nextStep();
            }
        },

        createFromDOM: function( $elms ) {
            var _this = this,
                elmsLength = $elms.length;

            function nextStep() {
                var settings, e, $elm;

                for ( e = 0; e < elmsLength; e += 1 ) {
                    $elm = $elms.eq( e );
                    if ( $.isFunction( _this._settingsFromDOM ) ) {
                        settings = _this._settingsFromDOM( $elm );
                    }

                    _this.create( $elm, settings );
                }
            }
            if ( !_this.inited ) {
                $( _this ).on( "wb.pl-init", nextStep );
            } else {
                nextStep();
                _this._init();
            }
        }
    },

    getPlugin = function( $elm ) {
        for ( plugin in wb.plugins ) {
            if ( $elm.is( plugin ) ) {
                return wb.plugins[ plugin ];
            }
        }
    },

    createInitialInstances = function( event ) {
        var plugin = event.target;

        plugin.createFromDOM( $( plugin.selector ) );
    },

    wb = {
        plugin: plugin,
        plugins: {},
        instances: {},
        callbacks: {}
    };

    // TODO: Load i18n

    // TODO: Find a better way to defer to after plugins are loaded
    setTimeout( function() {
        var unique = [],
            $instances = $(
                Object.keys( wb.plugins ).join( "," )
            ),
            instancesLength = $instances.length,
            i, $instance;

        for ( i = 0; i < instancesLength; i += 1 ) {
            $instance = $( $instances[ i ] );
            plugin = getPlugin( $instance );
            if ( plugin && unique.indexOf( plugin.selector ) === -1 ) {
                $( plugin ).on( "wb.pl-init", createInitialInstances );
                plugin._init();
                unique.push( plugin.selector );
            }
        }

    }, 500 );

    window.wb = wb;
} )( window );

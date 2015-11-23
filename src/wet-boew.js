( function( window ) {

    var pluginSeed = 0,
    plugin = {
        _init: function() {
            var _this = this;
            function preInit() {
                $( _this ).trigger( "wb.pl-pre-init" );

                function nextStep() {
                    loadDependencies( postInit );
                }

                if ( $.isFunction( _this.preInit ) ) {
                    _this.preInit( nextStep );
                } else {
                    nextStep();
                }
            }

            function loadDependencies( callback ) {
                if ( _this.deps && _this.deps.length && _this.deps.length > 0 ) {
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
            function nextStep() {
                var new_settings = settings;

                if ( $.isFunction( this.beforeCreate ) ) {
                    new_settings = this.beforeCreate( new_settings );
                }

                if ( $.isFunction( this._create ) ) {
                    var id = $elm.attr( "id" );

                    if ( !id ) {
                        id = "wb-pl-" + ( pluginSeed += 1 );
                        $elm.attr( "id", id );
                    }

                    // TODO: Merge setting with defaults

                    wb.instances[ id ] = this._create( new_settings );
                }
            }

            if ( !this.inited ) {
                $( this ).on( "wb.pl-init", nextStep );
            } else {
                nextStep();
            }
        },

        createFromDOM: function( $elm ) {
            function nextStep() {
                if ( $.isFunction( this._settingsFromDOM ) ) {
                    var data = null;
                    this.create( $elm, this._settingsFromDOM( data ) );
                }
            }
            if ( !this.inited ) {
                $( this ).on( "wb.pl-init", nextStep );
            } else {
                nextStep();
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

    createInitialInstances = function( plugin ) {
        window.console.log( plugin );
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

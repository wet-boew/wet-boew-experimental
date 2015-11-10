( function( window ) {

    function isFunction( fn ) {
        if ( fn && typeof fn === "function" ) {
            return true;
        }

        return false;
    }

    var pluginSeed = 0,
    plugin = {
        _init: function() {
            function preInit() {
                $( this ).trigger( "wb.pl-pre-init" );

                function nextStep() {
                    loadDependencies( postInit );
                }

                if ( isFunction( this.preInit ) ) {
                    this.preInit( nextStep );
                } else {
                    nextStep();
                }
            }

            function loadDependencies( callback ) {
                if ( this.deps && this.deps.length && this.deps.length > 0 ) {
                    callback();
                } else {
                    callback();
                }
            }

            function postInit() {
                this.inited = true;
                $( this ).trigger( "wb.pl-init" );
            }

            if ( !this.inited ) {
                preInit();
            }
        },

        create: function( $elm, settings ) {
            function nextStep() {
                var new_settings = settings;

                if ( isFunction( this.beforeCreate ) ) {
                    new_settings = this.beforeCreate( new_settings );
                }

                if ( isFunction( this._create ) ) {
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
                if ( isFunction( this._settingsFromDOM ) ) {
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
    };

    var wb = {
        plugin: plugin,
        plugins: {},
        instances: {},
        callbacks: {}
    };

    // TODO: Load i18n

    // TODO: Find a better way to defer to after plugins are loaded
    setTimeout( function() {
        var unique = [],
            plugins = Object.keys( wb.plugins ),
            $instances = $(
                plugins.join( "," )
            ),
            instancesLength = $instances.length,
            pluginsLength = plugins.length,
            i, $instance, p, plugin;

        for ( i = 0; i < instancesLength; i += 1 ) {
            $instance = $( $instances[ i ] );
            for ( p = 0; p < pluginsLength; p += 1 ) {
                plugin = plugins[ p ];
                if ( $instance.is( plugin ) &&
                        unique.indexOf( plugin ) === -1 ) {
                    wb.plugins[ plugin ]._init();
                    unique.push( plugin );
                }
            }
        }

    }, 500 );

    window.wb = wb;
} )( window );

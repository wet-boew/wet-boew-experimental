( function( window ) {

    var pluginSeed = 0,
    plugin = {
        _initialize: function() {
            var _this = this;
            function preInit() {
                $( _this ).trigger( "wb.pl-pre-init" );

                function nextStep() {
                    var callback;
                    if ( $.isFunction( _this._init ) ) {
                        callback = function() {
                            _this._init( postInit );
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
                function nextStep() {
                    _this.initialized = true;
                    $( _this ).trigger( "wb.pl-init" );
                }

                if ( $.isFunction( _this._postInit ) ) {
                    _this._postInit( nextStep );
                } else {
                    nextStep();
                }
            }

            if ( !_this.initialized ) {
                preInit();
            }
        },

        _settingsFromDOM: function( $elm ) {
            var dataAttr = wb.helpers.toDOMStringMapName( this.name );

            return $elm.data( dataAttr );
        },

        create: function( $elm, settings ) {
            var _this = this;

            function nextStep() {
                if ( $.isFunction( _this.beforeCreate ) ) {
                    _this.beforeCreate( $elm, settings );
                }

                var id = $elm.attr( "id" );

                if ( !id ) {
                    id = "wb-pl-" + ( pluginSeed += 1 );
                    $elm.attr( "id", id );
                }

                if ( $.isFunction( _this._create ) ) {
                    wb.instances[ id ] = $.extend(
                        {},
                        { $elm: $elm },
                        _this._create(
                            $elm,
                            $.extend( {}, _this.defaults, settings )
                        )
                    );
                }
            }

            if ( !_this.initialized ) {
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
            if ( !_this.initialized ) {
                $( _this ).on( "wb.pl-init", nextStep );
            } else {
                nextStep();
                _this._initialize();
            }
        }
    },

    addPlugin = function( plugin ) {
        wb.plugins[ plugin.name ] = $.extend( {}, wb.plugin, plugin );
    },

    getPlugin = function( $elm ) {
        var p, plugin;

        for ( p in wb.plugins ) {
            plugin = wb.plugins[ p ];
            if ( $elm.is( plugin.selector ) ) {
                return plugin;
            }
        }
    },

    getSelectors = function() {
        var selectors = [],
            p;

        for ( p in wb.plugins ) {
            selectors.push( wb.plugins[ p ].selector );
        }

        return selectors;
    },

    processTree = function( $tree ) {
        var unique = [],
            nextStep = function() {
                plugin.createFromDOM( $pluginInstances );
            },
            selectors, $instances, instancesLength, i, $instance, $pluginInstances;

        $tree = $tree || $( document );
        selectors =  wb.getSelectors().join( "," ),
        $instances = $tree.find( selectors );
        instancesLength = $instances.length;

        for ( i = 0; i < instancesLength; i += 1 ) {
            $instance = $( $instances[ i ] );
            plugin = getPlugin( $instance );
            if ( plugin ) {
                $pluginInstances = $tree.find( plugin.selector );

                if ( !plugin.initialized ) {
                    $( plugin ).on( "wb.pl-init", nextStep );
                    plugin._initialize();
                    unique.push( plugin.name );
                } else if ( unique.indexOf( plugin.name ) === -1 ) {
                    nextStep();
                }
            }
        }
    },

    wb = {
        addPlugin: addPlugin,
        callbacks: {},
        getSelectors: getSelectors,
        instances: {},
        plugin: plugin,
        plugins: {},
        processTree: processTree
    };

    // TODO: Load i18n

    // TODO: Find a better way to defer to after plugins are loaded
    setTimeout( processTree, 500 );

    window.wb = wb;
} )( window );

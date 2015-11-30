( function( window, wb ) {
    wb.helpers = {
        toDOMStringMapName: function( name ) {
            return name.replace( /-([a-z])/g, function( dash, firstLetter ) {
                return firstLetter.toUpperCase();
            } );
        }
    };
} )( window, window.wb, jQuery );

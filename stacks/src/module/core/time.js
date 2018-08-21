/**
 * Time class
 * @author Government of Canada
 * @version 1.0
 */

define( [ "module/core/pad" ], function( Pad) {
    "use strict";

    function stamp()
    {
        let date = new Date();

        let month = Pad.start( date.getMonth() + 1, 2, "0" ),
            day = Pad.start( date.getDate(),2, "0" ),
            hour = Pad.start( date.getHours(),2, "0" ),
            min = Pad.start( date.getMinutes(),2, "0" ),
            sec = Pad.start( date.getSeconds(), 2, "0" );

        return date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec;

    }

    return {
        stamp: stamp
    }

} );

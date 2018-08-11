/**
 * timer.js - a timer module that will create a repetative timer on an element
 * @returns {void}
 */
define( [ "module/core/object", "module/element" ], function( ObjectUtil , ElementUtil) {

    function find( $children, classname )
    {
        for (let idx = $children.length - 1; idx >= 0; idx--) {

			if ( ElementUtil.hasClass( $children[idx], classname) )
			{
				return idx
			}
        }
		return -1;
    }

	function reveal( $children, classname, index )
	{
        for (let idx = $children.length - 1; idx >= 0; idx--) {

			if ( idx == index )
			{

				ElementUtil.addClass( $children[idx], classname );
				continue;
			}

			ElementUtil.removeClass( $children[idx], classname );
        }
	}

	function handle( $elm, selector, options ) {

        let properties = Object.assign({ eventname: "increment", classname: "active" }, options ),
            children = ElementUtil.nodes( $elm, selector );

        ElementUtil.addListener( $elm, "increment decrement",function( event ){

			let advance = ( event.type === "increment") ? 1 : -1,
			    current = find( children, properties.classname ),
                total = children.length - 1,
				next = 0;


			if ( current + advance < total )
			{
				next = current + advance;
				next = ( next < 0 ) ? total + next : next;
				return reveal( children, properties.classname, next )
			}

			if ( current + advance > total )
			{
				next = current + advance;
				next = ( next > total ) ? total - next : next;
				return reveal( children, properties.classname,  next  );
			}

			return reveal( children, properties.classname, next);
        });

	}

	return {
		handle: handle
	};
} );

/**
 * Date class
 * @author Government of Canada
 * @version 1.0
 * @requires PadUtil
 */

define( [ "module/core/pad" ], function( PadUtil ) {
	"use strict" ;

	/*
	 * Converts the date to a date-object. The input can be:
	 * <ul>
	 * <li>a Date object: returned without modification.</li>
	 * <li>an array: Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
	 * <li>a number: Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
	 * <li>a string: Any format supported by the javascript engine, like 'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.</li>
	 * <li>an object: Interpreted as an object with year, month and date attributes. **NOTE** month is 0-11.</li>
	 * </ul>
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue
	 * @return {Date | NaN}
	 */
	function convert( dateValue ) {
		let dateConstructor = dateValue.constructor ;

		switch ( dateConstructor ) {
		case Date:
			return dateConstructor ;
		case Array:
			return new Date( dateValue[ 0 ], dateValue[ 1 ], dateValue[ 2 ] ) ;
		case Number:
		case String:
			return new Date( dateValue ) ;
		default:
			return typeof dateValue === "object" ? new Date( dateValue.year, dateValue.month, dateValue.date ) : NaN ;
		}
	}

	/*
	 * Compares two dates (input can be any type supported by the convert function).
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue1
	 * @param {Date | number[] | number | string | object} dateValue2
	 * @return {number | NaN}
	 * @example returns
	 * -1 if dateValue1 < dateValue2
	 * 0 if dateValue1 = dateValue2
	 * 1 if dateValue1 > dateValue2
	 * NaN if dateValue1 or dateValue2 is an illegal date
	 */
	function compare( dateValue1, dateValue2 ) {
		let convert = wb.date.convert ;

		if ( isFinite( dateValue1 = convert( dateValue1 ).valueOf() ) && isFinite( dateValue2 = convert( dateValue2 ).valueOf() ) ) {
			return ( dateValue1 > dateValue2 ) - ( dateValue1 < dateValue2 ) ;
		}
		return NaN ;
	}

	/*
	 * Cross-browser safe way of translating a date to ISO format
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue
	 * @param {boolean} withTime Optional. Whether to include the time in the result, or just the date. False if blank.
	 * @return {string}
	 * @example
	 * toDateISO( new Date() )
	 * returns "2012-04-27"
	 * toDateISO( new Date(), true )
	 * returns "2012-04-27 13:46"
	 */
	function toDateISO( dateValue, withTime ) {
		let date = convert( dateValue ) ;

		return date.getFullYear() + "-" + PadUtil.start( date.getMonth() + 1, 2, "0" ) + "-" + PadUtil.start( date.getDate(), 2, "0" ) +
			( withTime ? " " + PadUtil.start( date.getHours(), 2, "0" ) + ":" + PadUtil.start( date.getMinutes(), 2, "0" ) : "" ) ;
	}

	/*
	 * Cross-browser safe way of creating a date object from a date string in ISO format
	 * @memberof wb.date
	 * @param {string} dateISO Date string in ISO format
	 * @return {Date}
	 */
	function fromDateISO( dateISO ) {
		let date = null ;

		if ( dateISO && dateISO.match( /\d{4}-\d{2}-\d{2}/ ) ) {
			date = new Date( dateISO.substr( 0, 4 ), dateISO.substr( 5, 2 ) - 1, dateISO.substr( 8, 2 ), 0, 0, 0, 0 ) ;
		}
		return date ;
	}

	return {
		convert: convert,
		compare: compare,
		toDateISO: toDateISO,
		fromDateISO: fromDateISO
	} ;
} ) ;

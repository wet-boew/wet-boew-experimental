/**
 * Element class
 * @author Government of Canada
 * @version 1.0
 */

export { css };

/**
 * Creates a STYLE element with the specified content.
 * @param {string} content The stylesheet content.
 * @return {!Element} The created STYLE element.
 */
function css( content ) {
	var style = document.createElement('style');
	var styleSheet = style.styleSheet;
	if (styleSheet) {
		styleSheet.cssText = content;
	}
	else {
		style.appendChild( document.createTextNode( content ) );
	}
	style.type = 'text/css';
	return style;
}

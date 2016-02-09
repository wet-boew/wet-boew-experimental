/*----------------------------------------------------------------
 * Copy Task
 *----------------------------------------------------------------*/

module.exports = {
    main: {
       files: [
 	    	//  Create the directories to build to
		   {expand: true, cwd: 'themes/', src: ['*'], dest: 'build/' }
       ],
     },
};
/**
 * DataObject class
 * @author Government of Canada
 * @version 1.0
 */

define([], function () {
  "use strict";

  let instance = null;

  function DataObject() {
    if (instance !== null) {
      throw new Error("Cannot instantiate more than one dataobject, use <objectname>.getInstance()");
    }
    this.initialize();
  }

  /**
   * DataObject Object
   * @type {{initialize: initialize}}
   * @assumptions:
   *  While we are striving follow the RDF/JS specification for initial versions we will leverage the recommendations
   *  W3C and build the interface but some model elements were assumed
   *  - Quad schema [ subject -> JSON object property, predicate -> equals, object -> value, graph -> page ]
   *  @credits: https://rdf.js.org/dataset-spec/
   */
  DataObject.prototype = {

    initialize: function () {
      this._data = {}
    },

    size: function () {

      if (this._data.length > 0) {
        return this._data.length
      }
      return 0;
    },

    add: function (property, value) {
      this._data[property] = value;
      return this;
    },

    delete: function (property, value) {
      const _var = this._data[property];

      delete this._data[property];

      return _var;
    },

    has: function (property, value) {

      if (value) {
        return this._data.hasOwnProperty(property) && this._data[property] === value
      }

      return this._data.hasOwnProperty(property)
    },

    match: function (property, value) {

      // request will return the true or false if this property and value exist
      // @returns: boolean
      if (value && property) {
        return this.has(property, value);
      }

      // requesting all items that have a value
      // @returns: {array} of keys
      if (value) {

        let _keys = [];

        for (const [_prop, _val] of Object.entries(this._data)) {
          if (value === _val) {
            _keys.push(_prop);
          }
        }

        return (_keys.length) ? _keys : false;
      }

      // check if the store has the property and return it, or false if nothing
      // @returns: {object|boolean}
      return (this.has(property)) ? this._data[property] : false;
    }
  };

  DataObject.getInstance = function () {

    if (instance === null) {
      instance = new DataObject();
    }
    return instance;
  };

  return DataObject.getInstance();
});

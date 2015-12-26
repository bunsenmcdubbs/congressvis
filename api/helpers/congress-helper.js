var mysql = require('mysql');
var Q = require('q');
var _ = require('underscore');

var db = require('../utils/db-connector');
var MemberHelper = require('./member-helper');

/**
 * Helper class for converting and retrieving congress to/from the database
 * @constructor
 * @requires api/helpers/member-helper
 * @requires api/utils/db-connector
 */
function CongressHelper() {}

/**
 * Retrieve members that belong/attended a given congress
 * @param { number } congress - congress number to lookup members for
 * @returns { Promise } a promise that will resolve with a list of members
 */
CongressHelper.prototype.getCongressMembers = function(congress) {
  var query = 'SELECT congress_id FROM congresses WHERE congress_id = ' + congress;
  var call = 'CALL getCongressMembers(' + congress + ')';
  var deferred = Q.defer();
  db.getConnection().then(function (connection) {
    connection.query(query, function(err, rows) {
      if (!rows || rows.length === 0) {
        connection.release();
        deferred.reject([]); // send back an empty array to rejection
      } else {
        connection.query(call, function(err, res) {
          if (err) { deferred.reject(err); }
          else {
            // res[0] -> result rows, res[1] -> status
            deferred.resolve(MemberHelper.transformMembers(res[0]));
          }
          connection.release();
        });
      }
    });
  });
  return deferred.promise;
};

/**
 * A singleton instance of CongressHelper that uses a database connection to
 * lookup and retrieve information about congresses.
 * @module api/helpers/CongressHelper
 * @see CongressHelper
 */
module.exports = new CongressHelper();
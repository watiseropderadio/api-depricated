/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

module.exports.models = {

  /***************************************************************************
   *                                                                          *
   * Your app's default connection. i.e. the name of one of your app's        *
   * connections (see `config/connections.js`)                                *
   *                                                                          *
   ***************************************************************************/
  connection: 'dokkuPostgres',

  /***************************************************************************
   *                                                                          *
   * How and whether Sails will attempt to automatically rebuild the          *
   * tables/collections/etc. in your schema.                                  *
   *                                                                          *
   * See http://sailsjs.org/#!/documentation/concepts/ORM/model-settings.html  *
   *                                                                          *
   ***************************************************************************/
  migrate: 'alter',

  // A flag to toggle the automatic definition of a primary key in your model.
  // The details of this default PK vary between adapters (e.g. MySQL uses
  // an auto-incrementing integer primary key, whereas MongoDB uses a
  // randomized string UUID). In any case, the primary keys generated
  // by autoPK will be unique. If turned off no primary key will be created
  // by default, and you will need to define one manually, e.g.:
  //
  // ```js
  // attributes: {
  //   sku: {
  //     type: 'string',
  //     primaryKey: true,
  //     unique: true
  //   }
  // }
  // ```

  autoPK: true,

};

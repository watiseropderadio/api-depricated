module.exports = {

  User: {

    read: [ 'username', 'updatedAt' ],

    edit: {
      '*': false,
      owner: [ 'username', 'password' ]
    },

    create: true,

    delete: false,

    searchableBy: [ 'username' ],

    owners: [ '_id' ]

  },

  Task: {

    read: true,

    edit: {
      '*': false,
      owner: [ 'title', 'completedAt' ]
    },

    create: true,

    delete: {
      owner: true,
      '*': false
    },

    searchableBy: [],

    owners: [ 'user' ]

  }

};

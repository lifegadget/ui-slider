module.exports = {
	description: 'Installs the underlying slider component using bower',

	normalizeEntityName: function() {
		// this prevents an error when the entityName is
		// not specified (since that doesn't actually matter
		// to us
	},

	afterInstall: function() {
		return this.addBowerPackagesToProject([
      { name: 'seiyria-bootstrap-slider', target: '~6.0.6'  }
    ]);
	}
};

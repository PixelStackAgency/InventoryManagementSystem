const path = require('path')

export default {
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, './dev.db')}`,
    },
  },
}

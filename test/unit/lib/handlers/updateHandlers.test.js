/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const init = require('../../../helpers/util/init')
const {
  updateSingle, updateMultiple, updateProvider
} = require('../../../../lib/handlers/updateHandlers')
const {
  createSingle, createMultiple
} = require('../../../../lib/handlers/createHandlers')
const { errors: ARANGO_ERRORS } = require('@arangodb')

describe('Update Handlers', () => {
  before(init.setup)

  after(init.teardown)

  it('should fail when updating a vertex where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should fail when updating a vertex where ignoreRevs is false and _rev match fails`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = 'v2'
    cnode._rev = 'mismatched_rev'

    expect(() =>
      updateSingle({ pathParams, body: cnode }, { ignoreRevs: false })
    )
      .to.throw()
      .with.property('errorNum', ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
  })

  it('should update a vertex where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update a vertex where ignoreRevs is false and _rev matches`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = 'v2'

    const rnode = updateSingle(
      { pathParams, body: cnode },
      { returnNew: true, ignoreRevs: false }
    ).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.equal('v2')
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should update a single vertex where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update a single vertex where ignoreRevs is true, irrespective of _rev`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = 'v2'
    cnode._rev = 'mismatched_rev'

    const rnode = updateSingle(
      { pathParams, body: cnode },
      { returnNew: true, ignoreRevs: true }
    ).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.equal('v2')
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should remove null values in a single vertex when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should remove null values in a single vertex when keepNull is false`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = null

    const rnode = updateSingle(
      { pathParams, body: cnode },
      { returnNew: true, keepNull: false }
    ).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode._rev).to.not.equal(cnode._rev)
    expect(rnode).to.not.have.property('k1')
    expect(rnode.k2).to.equal('v1')
  })

  it('should preserve null values in a vertex when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should preserve null values in a vertex when keepNull is true`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = null

    const rnode = updateSingle(
      { pathParams, body: cnode },
      { returnNew: true, keepNull: true }
    ).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.be.null
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should replace objects in a vertex when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should replace objects in a vertex when mergeObjects is false`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = { b: 1 }

    const rnode = updateSingle(
      { pathParams, body: cnode },
      { returnNew: true, mergeObjects: false }
    ).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.deep.equal({ b: 1 })
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should merge objects in a vertex when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = { b: 1 }

    const rnode = updateSingle(
      { pathParams, body: cnode },
      { returnNew: true, mergeObjects: true }
    ).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.deep.equal({ b: 1, a: 1 })
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should fail when updating two vertices where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two vertices where ignoreRevs is false and _rev match fails`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two vertices where ignoreRevs is false and _rev match fails`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = 'v2'
          node._rev = 'mismatched_rev'

          return node
        })
      },
      { returnNew: true, ignoreRevs: false }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
    })
  })

  it('should update two vertices where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is false and _rev matches`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is false and _rev matches`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = 'v2'

          return node
        })
      },
      { returnNew: true, ignoreRevs: false }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.equal('v2')
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should update two vertices where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is true, irrespective of _rev`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is true, irrespective of _rev`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = 'v2'
          node._rev = 'mismatched_rev'

          return node
        })
      },
      { returnNew: true, ignoreRevs: true }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.equal('v2')
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should remove null values from two vertices when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two vertices when keepNull is false`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two vertices when keepNull is false`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = null

          return node
        })
      },
      { returnNew: true, keepNull: false }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node).to.not.have.property('k1')
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should preserve null values in two vertices when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two vertices when keepNull is true`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two vertices when keepNull is true`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = null

          return node
        })
      },
      { returnNew: true, keepNull: true }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.be.null
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should replace objects in two vertices when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two vertices when mergeObjects is false`
      },
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two vertices when mergeObjects is false`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = { b: 1 }

          return node
        })
      },
      { returnNew: true, mergeObjects: false }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.deep.equal({ b: 1 })
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should merge objects in two vertices when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two vertices when mergeObjects is true`
      },
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two vertices when mergeObjects is true`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateMultiple(
      {
        pathParams,
        body: cnodes.map(node => {
          node.k1 = { b: 1 }

          return node
        })
      },
      { returnNew: true, mergeObjects: true }
    )

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.deep.equal({ b: 1, a: 1 })
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should fail when updating an edge where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating an edge where ignoreRevs is false and _rev match fails`
      },
      {
        k1: 'v1',
        src: `${__filename}:sshould fail when updating an edge where ignoreRevs is false and _rev match fails`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should fail when updating an edge where ignoreRevs is false and _rev match fails`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = 'v2'
    ecnode._rev = 'mismatched_rev'

    expect(() =>
      updateSingle({ pathParams, body: ecnode }, { ignoreRevs: false })
    )
      .to.throw()
      .with.property('errorNum', ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
  })

  it('should update an edge where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is false and _rev matches`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is false and _rev matches`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update an edge where ignoreRevs is false and _rev matches`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = 'v2'

    const ernode = updateSingle(
      { pathParams, body: ecnode },
      { returnNew: true, ignoreRevs: false }
    ).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.equal('v2')
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should update an edge where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is true, irrespective of _rev`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is true, irrespective of _rev`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update an edge where ignoreRevs is true, irrespective of _rev`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = 'v2'
    ecnode._rev = 'mismatched_rev'

    const ernode = updateSingle(
      { pathParams, body: ecnode },
      { returnNew: true, ignoreRevs: true }
    ).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.equal('v2')
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should remove null values from an edge when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from an edge when keepNull is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from an edge when keepNull is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should remove null values from an edge when keepNull is false`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = null

    const ernode = updateSingle(
      { pathParams, body: ecnode },
      { returnNew: true, keepNull: false }
    ).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode).to.not.have.property('k1')
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should preserve null values in an edge when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in an edge when keepNull is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in an edge when keepNull is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should preserve null values in an edge when keepNull is true`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = null

    const ernode = updateSingle(
      { pathParams, body: ecnode },
      { returnNew: true, keepNull: true }
    ).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.be.null
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should replace objects in an edge when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in an edge when mergeObjects is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in an edge when mergeObjects is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should replace objects in an edge when mergeObjects is false`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = { b: 1 }

    const ernode = updateSingle(
      { pathParams, body: ecnode },
      { returnNew: true, mergeObjects: false }
    ).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.deep.equal({ b: 1 })
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should merge objects in a vertex when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = { b: 1 }

    const ernode = updateSingle(
      { pathParams, body: ecnode },
      { returnNew: true, mergeObjects: true }
    ).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.deep.equal({ b: 1, a: 1 })
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should fail when updating two edges where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      },
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = 'v2'
          node._rev = 'mismatched_rev'

          return node
        })
      },
      { returnNew: true, ignoreRevs: false }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
    })
  })

  it('should update two edges where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = 'v2'

          return node
        })
      },
      { returnNew: true, ignoreRevs: false }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.equal('v2')
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should update two edges where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = 'v2'
          node._rev = 'mismatched_rev'

          return node
        })
      },
      { returnNew: true, ignoreRevs: true }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.equal('v2')
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should remove null values from two edges when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = null

          return node
        })
      },
      { returnNew: true, keepNull: false }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode).to.not.have.property('k1')
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should preserve null values in two edges when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = null

          return node
        })
      },
      { returnNew: true, keepNull: true }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.be.null
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should replace objects in two edges when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = { b: 1 }

          return node
        })
      },
      { returnNew: true, mergeObjects: false }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.deep.equal({ b: 1 })
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should merge objects in two edges when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateMultiple(
      {
        pathParams,
        body: ecnodes.map(node => {
          node.k1 = { b: 1 }

          return node
        })
      },
      { returnNew: true, mergeObjects: true }
    )

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.deep.equal({ b: 1, a: 1 })
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should fail to update a non-existent vertex', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      _key: 'does-not-exist',
      k1: 'v1',
      src: `${__filename}:should fail to update a non-existent vertex`
    }

    expect(() =>
      updateSingle({
        pathParams,
        body
      })
    )
      .to.throw()
      .with.property(
        'errorNum',
        ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
      )
  })

  it('should fail to update two non-existent vertices.', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        _key: 'does-not-exist',
        k1: 'v1',
        src: `${__filename}:should fail to update two non-existent vertices.`
      },
      {
        _key: 'does-not-exist',
        k1: 'v1',
        src: `${__filename}:should fail to update two non-existent vertices.`
      }
    ]

    const nodes = updateMultiple({ pathParams, body })

    expect(nodes).to.be.an.instanceOf(Array)
    nodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(
        ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
      )
    })
  })

  it('should fail to update a non-existent edge', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail to update a non-existent edge`
      },
      {
        k1: 'v1',
        src: `${__filename}:should fail to update a non-existent edge`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      _key: 'does-not-exist',
      src: `${__filename}:should fail to update a non-existent edge`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    expect(() =>
      updateSingle({
        pathParams,
        body: ebody
      })
    )
      .to.throw()
      .with.property(
        'errorNum',
        ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
      )
  })

  it('should fail when updating two edges with non-existing keys', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      },
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        _key: 'does-not-exist',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        _key: 'does-not-exist',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const enodes = updateMultiple({ pathParams, body: ebody })

    expect(enodes).to.be.an.instanceOf(Array)
    expect(enodes).to.have.lengthOf(2)
    enodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(
        ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
      )
    })
  })
})

describe('Update Provider', () => {
  before(init.setup)

  after(init.teardown)

  it('should fail when updating a vertex where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should fail when updating a vertex where ignoreRevs is false and _rev match fails`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = 'v2'
    cnode._rev = 'mismatched_rev'

    expect(() => updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode, { ignoreRevs: false }))
      .to.throw()
      .with.property('errorNum', ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
  })

  it('should update a vertex where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update a vertex where ignoreRevs is false and _rev matches`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = 'v2'

    const rnode = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode,
      { returnNew: true, ignoreRevs: false }).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.equal('v2')
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should update a single vertex where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update a single vertex where ignoreRevs is true, irrespective of _rev`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = 'v2'
    cnode._rev = 'mismatched_rev'

    const rnode = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode,
      { returnNew: true, ignoreRevs: true }).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.equal('v2')
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should remove null values in a single vertex when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should remove null values in a single vertex when keepNull is false`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = null

    const rnode = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode,
      { returnNew: true, keepNull: false }).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode._rev).to.not.equal(cnode._rev)
    expect(rnode).to.not.have.property('k1')
    expect(rnode.k2).to.equal('v1')
  })

  it('should preserve null values in a vertex when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should preserve null values in a vertex when keepNull is true`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = null

    const rnode = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode,
      { returnNew: true, keepNull: true }).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.be.null
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should replace objects in a vertex when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should replace objects in a vertex when mergeObjects is false`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = { b: 1 }

    const rnode = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode,
      { returnNew: true, mergeObjects: false }).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.deep.equal({ b: 1 })
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should merge objects in a vertex when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = {
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
    }

    const cnode = createSingle({ pathParams, body })
    cnode.k1 = { b: 1 }

    const rnode = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnode,
      { returnNew: true, mergeObjects: true }).new

    expect(rnode).to.be.an.instanceOf(Object)
    expect(rnode._id).to.equal(cnode._id)
    expect(rnode._key).to.equal(cnode._key)
    expect(rnode.k1).to.deep.equal({ b: 1, a: 1 })
    expect(rnode.k2).to.equal('v1')
    expect(rnode._rev).to.not.equal(cnode._rev)
  })

  it('should fail when updating two vertices where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two vertices where ignoreRevs is false and _rev match fails`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two vertices where ignoreRevs is false and _rev match fails`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = 'v2'
      node._rev = 'mismatched_rev'

      return node
    }), { returnNew: true, ignoreRevs: false })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
    })
  })

  it('should update two vertices where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is false and _rev matches`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is false and _rev matches`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = 'v2'

      return node
    }), { returnNew: true, ignoreRevs: false })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.equal('v2')
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should update two vertices where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is true, irrespective of _rev`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two vertices where ignoreRevs is true, irrespective of _rev`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = 'v2'
      node._rev = 'mismatched_rev'

      return node
    }), { returnNew: true, ignoreRevs: true })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.equal('v2')
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should remove null values from two vertices when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two vertices when keepNull is false`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two vertices when keepNull is false`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = null

      return node
    }), { returnNew: true, keepNull: false })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node).to.not.have.property('k1')
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should preserve null values in two vertices when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two vertices when keepNull is true`
      },
      {
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two vertices when keepNull is true`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = null

      return node
    }), { returnNew: true, keepNull: true })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.be.null
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should replace objects in two vertices when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two vertices when mergeObjects is false`
      },
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two vertices when mergeObjects is false`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = { b: 1 }

      return node
    }), { returnNew: true, mergeObjects: false })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.deep.equal({ b: 1 })
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should merge objects in two vertices when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const body = [
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two vertices when mergeObjects is true`
      },
      {
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two vertices when mergeObjects is true`
      }
    ]

    const cnodes = createMultiple({ pathParams, body })

    const rnodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, cnodes.map(node => {
      node.k1 = { b: 1 }

      return node
    }), { returnNew: true, mergeObjects: true })

    expect(rnodes).to.be.an.instanceOf(Array)
    expect(rnodes).to.have.lengthOf(2)
    rnodes
      .map(node => node.new)
      .forEach((node, idx) => {
        expect(node).to.be.an.instanceOf(Object)
        expect(node._id).to.equal(cnodes[idx]._id)
        expect(node._key).to.equal(cnodes[idx]._key)
        expect(node.k1).to.deep.equal({ b: 1, a: 1 })
        expect(node.k2).to.equal('v1')
        expect(node._rev).to.not.equal(cnodes[idx]._rev)
      })
  })

  it('should fail when updating an edge where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating an edge where ignoreRevs is false and _rev match fails`
      },
      {
        k1: 'v1',
        src: `${__filename}:sshould fail when updating an edge where ignoreRevs is false and _rev match fails`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should fail when updating an edge where ignoreRevs is false and _rev match fails`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = 'v2'
    ecnode._rev = 'mismatched_rev'

    expect(() => updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode, { ignoreRevs: false }))
      .to.throw()
      .with.property('errorNum', ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
  })

  it('should update an edge where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is false and _rev matches`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is false and _rev matches`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update an edge where ignoreRevs is false and _rev matches`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = 'v2'

    const ernode = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode,
      { returnNew: true, ignoreRevs: false }).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.equal('v2')
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should update an edge where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is true, irrespective of _rev`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update an edge where ignoreRevs is true, irrespective of _rev`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should update an edge where ignoreRevs is true, irrespective of _rev`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = 'v2'
    ecnode._rev = 'mismatched_rev'

    const ernode = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode,
      { returnNew: true, ignoreRevs: true }).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.equal('v2')
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should remove null values from an edge when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from an edge when keepNull is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from an edge when keepNull is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should remove null values from an edge when keepNull is false`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = null

    const ernode = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode,
      { returnNew: true, keepNull: false }).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode).to.not.have.property('k1')
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should preserve null values in an edge when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in an edge when keepNull is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in an edge when keepNull is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      k2: 'v1',
      src: `${__filename}:should preserve null values in an edge when keepNull is true`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = null

    const ernode = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode,
      { returnNew: true, keepNull: true }).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.be.null
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should replace objects in an edge when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in an edge when mergeObjects is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in an edge when mergeObjects is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should replace objects in an edge when mergeObjects is false`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = { b: 1 }

    const ernode = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode,
      { returnNew: true, mergeObjects: false }).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.deep.equal({ b: 1 })
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should merge objects in a vertex when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: { a: 1 },
      k2: 'v1',
      src: `${__filename}:should merge objects in a vertex when mergeObjects is true`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    const ecnode = createSingle({ pathParams, body: ebody })
    ecnode.k1 = { b: 1 }

    const ernode = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnode,
      { returnNew: true, mergeObjects: true }).new

    expect(ernode).to.be.an.instanceOf(Object)
    expect(ernode._id).to.equal(ecnode._id)
    expect(ernode._key).to.equal(ecnode._key)
    expect(ernode._from).to.equal(vnodes[0]._id)
    expect(ernode._to).to.equal(vnodes[1]._id)
    expect(ernode.k1).to.deep.equal({ b: 1, a: 1 })
    expect(ernode.k2).to.equal('v1')
    expect(ernode._rev).to.not.equal(ecnode._rev)
  })

  it('should fail when updating two edges where ignoreRevs is false and _rev match fails', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      },
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should fail when updating two edges where ignoreRevs is false and _rev match fails`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = 'v2'
      node._rev = 'mismatched_rev'

      return node
    }), { returnNew: true, ignoreRevs: false })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(ARANGO_ERRORS.ERROR_ARANGO_CONFLICT.code)
    })
  })

  it('should update two edges where ignoreRevs is false and _rev matches', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is false and _rev matches`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = 'v2'

      return node
    }), { returnNew: true, ignoreRevs: false })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.equal('v2')
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should update two edges where ignoreRevs is true, irrespective of _rev', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      },
      {
        k1: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should update two edges where ignoreRevs is true, irrespective of _rev`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = 'v2'
      node._rev = 'mismatched_rev'

      return node
    }), { returnNew: true, ignoreRevs: true })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.equal('v2')
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should remove null values from two edges when keepNull is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should remove null values from two edges when keepNull is false`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = null

      return node
    }), { returnNew: true, keepNull: false })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode).to.not.have.property('k1')
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should preserve null values in two edges when keepNull is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        k2: 'v1',
        src: `${__filename}:should preserve null values in two edges when keepNull is true`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = null

      return node
    }), { returnNew: true, keepNull: true })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.be.null
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should replace objects in two edges when mergeObjects is false', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      },
      {
        k1: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should replace objects in two edges when mergeObjects is false`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = { b: 1 }

      return node
    }), { returnNew: true, mergeObjects: false })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.deep.equal({ b: 1 })
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should merge objects in two edges when mergeObjects is true', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      },
      {
        k1: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: { a: 1 },
        k2: 'v1',
        src: `${__filename}:should merge objects in two edges when mergeObjects is true`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const ecnodes = createMultiple({ pathParams, body: ebody })

    const ernodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ecnodes.map(node => {
      node.k1 = { b: 1 }

      return node
    }), { returnNew: true, mergeObjects: true })

    expect(ernodes).to.be.an.instanceOf(Array)
    expect(ernodes).to.have.lengthOf(2)
    ernodes
      .map(node => node.new)
      .forEach((ernode, idx) => {
        expect(ernode).to.be.an.instanceOf(Object)
        expect(ernode._id).to.equal(ecnodes[idx]._id)
        expect(ernode._key).to.equal(ecnodes[idx]._key)
        expect(ernode._from).to.equal(vnodes[0]._id)
        expect(ernode._to).to.equal(vnodes[1]._id)
        expect(ernode.k1).to.deep.equal({ b: 1, a: 1 })
        expect(ernode.k2).to.equal('v1')
        expect(ernode._rev).to.not.equal(ecnodes[idx]._rev)
      })
  })

  it('should fail to update a non-existent vertex', () => {
    const body = {
      _key: 'does-not-exist',
      k1: 'v1',
      src: `${__filename}:should fail to update a non-existent vertex`
    }

    expect(() => updateProvider(init.TEST_DATA_COLLECTIONS.vertex, body))
      .to.throw()
      .with.property('errorNum', ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code)
  })

  it('should fail to update two non-existent vertices.', () => {
    const body = [
      {
        _key: 'does-not-exist',
        k1: 'v1',
        src: `${__filename}:should fail to update two non-existent vertices.`
      },
      {
        _key: 'does-not-exist',
        k1: 'v1',
        src: `${__filename}:should fail to update two non-existent vertices.`
      }
    ]

    const nodes = updateProvider(init.TEST_DATA_COLLECTIONS.vertex, body)

    expect(nodes).to.be.an.instanceOf(Array)
    nodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(
        ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
      )
    })
  })

  it('should fail to update a non-existent edge', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail to update a non-existent edge`
      },
      {
        k1: 'v1',
        src: `${__filename}:should fail to update a non-existent edge`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = {
      _from: vnodes[0]._id,
      _to: vnodes[1]._id,
      k1: 'v1',
      _key: 'does-not-exist',
      src: `${__filename}:should fail to update a non-existent edge`
    }
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge

    expect(() => updateSingle(init.TEST_DATA_COLLECTIONS.edge, ebody)).to.throw()
  })

  it('should fail when updating two edges with non-existing keys', () => {
    const pathParams = {
      collection: init.TEST_DATA_COLLECTIONS.vertex
    }
    const vbody = [
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      },
      {
        k1: 'v1',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      }
    ]
    const vnodes = createMultiple({ pathParams, body: vbody })

    const ebody = [
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        _key: 'does-not-exist',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      },
      {
        _from: vnodes[0]._id,
        _to: vnodes[1]._id,
        k1: 'v1',
        _key: 'does-not-exist',
        src: `${__filename}:should fail when updating two edges with non-existing keys`
      }
    ]
    pathParams.collection = init.TEST_DATA_COLLECTIONS.edge
    const enodes = updateProvider(init.TEST_DATA_COLLECTIONS.edge, ebody)

    expect(enodes).to.be.an.instanceOf(Array)
    expect(enodes).to.have.lengthOf(2)
    enodes.forEach(node => {
      expect(node).to.be.an.instanceOf(Object)
      expect(node.errorNum).to.equal(
        ARANGO_ERRORS.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code
      )
    })
  })
})

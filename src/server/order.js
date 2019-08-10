const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

const orderKind = 'Order'
const getOrderKey = (userId, location) => {
  return datastore.key([orderKind, `${userId}|${location}`])
}

const setOrder = (userId, location, order) => {
  if (!userId) {
    throw new Error('Missing user ID')
  }

  if (!location) {
    throw new Error('Missing location')
  }

  if (!order) {
    throw new Error('Missing order')
  }

  return datastore.upsert({
    key: getOrderKey(userId, location),
    data: {
      user: userId,
      location,
      value: order,
    }
  })
}

const deleteOrder = (userId, location) => {
  if (!userId) {
    throw new Error('Missing user ID')
  }

  if (!location) {
    throw new Error('Missing location')
  }

  return datastore.delete(getOrderKey(userId, location))
}

const getOrder = (userId, location) => {
  if (!userId) {
    throw new Error('Missing user ID')
  }

  if (!location) {
    throw new Error('Missing location')
  }

  return datastore.get(getOrderKey(userId, location)).then(([order]) => order)
}

const listOrders = (userId) => {
  if (!userId) {
    throw new Error('Missing user ID')
  }

  const query = datastore.createQuery(orderKind)
                         .filter('user', '=', userId)

  return datastore.runQuery(query).then(([orders]) => orders)
}

module.exports = {
  set: setOrder,
  delete: deleteOrder,
  get: getOrder,
  list: listOrders,
}
import Dict from '../gleam_stdlib/dict.mjs'
import * as gleam from './gleam.mjs'

const devtoolsOptions = {
  serialize: {
    replacer,
  },
}

let connection = (() => {
  if (!window) return null
  const devtools = window.__REDUX_DEVTOOLS_EXTENSION__
  if (!devtools) return null
  console.info('Redux Devtools Extension detected, connecting…')
  const connection = devtools.connect(devtoolsOptions)
  window.__REDUX_DEVTOOLS_CONNECTION__ = connection
  console.info('Redux Devtools Extension connected, initializing…')
  return connection
})()

export function init(state) {
  connection?.init(state)
}

export function send(state, action) {
  action.type = getActionType(action)
  connection?.send(action, state)
}

function getActionType(action, parts = []) {
  const isOk = !!action
  const isObject = typeof action === 'object'
  if (!isOk || !isObject) return parts.join('(') + ')'.repeat(parts.length - 1)
  return getActionType(action.msg, [...parts, action.constructor.name])
}

function typed(type, data) {
  return { __serializedType__: type, data }
}

function replacer(key, value) {
  if (typeof value !== 'object') return value
  if (key === '' && 'action' in value) return actionReplacer(value)
  return toJSON(key, value) ?? value
}

function actionReplacer(value) {
  const { type, ...data } = value.action
  return { type, ...data }
}

function toJSON(_key, value) {
  if (value instanceof gleam.List) {
    const data = value.toArray()
    return typed('List', data)
  }
  if (value instanceof Dict) {
    const entries = value.entries()
    const data = Object.fromEntries(entries)
    return typed('Dict', data)
  }
  if (Array.isArray(value)) {
    const data = {}
    for (const i in value) data[i] = value[i]
    return typed(`Tuple_${value.length}`, data)
  }
  if (value instanceof gleam.CustomType) {
    const name = value.constructor.name
    const entries = Object.entries(value)
    const data = Object.fromEntries(entries)
    return typed(name, data)
  }
  return value
}

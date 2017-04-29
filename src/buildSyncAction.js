import {splitPath} from './utils/index'

let store
export const setStore = (s) => {
	store = s
}

let syncActions = {}
export const setSyncActions = (actions) => {
	syncActions = actions
}

export const callSync = (type, cr, params) => {
	const fn = syncActions[type]
	return fn ?
		fn(type, cr, params) :
		console.error(`VSM Sync error`)
}

const errorMessage = (message, param) => {
	console.error(`VSM: ${message}:`)
	console.error(`"${param}"`)
}

const showError = {
	'method': (param) => {
		errorMessage(`Не был передан метод в экшене`, param)
	},
	'cr': (param) => {
		errorMessage(`Не было передано название контейнера в экшене`, param)
	},
	'type': (param) => {
		errorMessage(`Не был передан type в экшене`, param)
	},
	'path': (param) => {
		errorMessage(`Не был передан path в экшене`, param)
	},
	'params': (param) => {
		errorMessage(`Не был передан параметр params в экшене`, param)
	}
}

export const send = (type = ``, cr = ``, path = ``, params = {}) => {
	let buildAction = {}

	!type ? showError.type(type) : buildAction.type = type
	!cr ? showError.cr(cr) : buildAction.cr = cr

	if (!path) {
		showError.path(path)
	}
	else {
		const {reducer, branch, method} = splitPath(path)
		buildAction.path = path
		buildAction.reducer = reducer
		buildAction.branch = branch
		buildAction.method = method
	}

	params === {} ? showError.params(params) :
		buildAction.params = params

	return store.dispatch(buildAction)
}

export const setFetching = (branch, status) => {
	const type = status === true ?
		`Начало загрузки ${branch}...` :
		`Завершение загрузки ${branch}...`
	send(type, `global`,
		`extend:${branch}`, {data: {fetching: status}}
	)
}

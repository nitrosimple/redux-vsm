import {splitPath} from './utils/index'
let store
let syncActions = {}

/**
 * setStore - устанавливает storе (из внешнего приложения)
 * @param {object} s - redux store
 */
export const setStore = (s) => {
	store = s
}

/**
 * setSyncActions - устанавливает синхронные actions (из внешнего приложения)
 * @param {object} actions - объект из функций (синхронные actions)
 */
export const setSyncActions = (actions) => {
	syncActions = actions
}

/**
 * callSync - вызывает нужный синхронный action по type
 * @param {string} type - Название экшена (в классическом redux используются контанты)
 * @param {string} cr - Название контейнера из которого происходит
 * запуск экшена (для удобства разработки)
 * @param {object} params - Параметры (к примеру params.id: 123)
 * @return {function} - Функция по нужному type
 */
export const callSync = (type, cr, params) => {
	const fn = syncActions[type]
	return fn ?
		fn(type, cr, params) :
		console.error(`VSM Sync error`)
}

/**
 * errorMessage - выводит сообщение об ошибке
 * @param {string} message - Сообщение ошибки
 * @param {string || object} param - В каком именно свойстве передаваемого action
 * @return {console.error} - Сообщение об ошибке (console.error)
 */
const errorMessage = (message, param) => {
	console.error(`VSM: ${message}:`)
	console.error(`"${param}"`)
}

/* showError - вывод ошибки в зависимости от типа ошибки */
const showError = {
	'func': (param) => {
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

/**
 * send - Отправка универсального экшена в нужный state и нужную ветку
 * @param {string} type - Название экшена (в классическом redux используются контанты)
 * @param {string} cr - Название контейнера (для удобства разработки)
 * @param {string} path - Путь, к примеру: extend:tickets.items, где
 * extend - это универсальная функция для редюсера, tickets - нужный state, а
 * items - это ветка в данном state
 * @param {object} params - Объект, который передается в редюсер (универсальную функцию)
 * @return {function} - Происходит dispatch в нужный редюсер / state
 */
export const send = (type = ``, cr = ``, path = ``, params = {}) => {
	let buildAction = {}
	!cr ? showError.cr(cr) : buildAction.cr = cr
	!type ? showError.type(type) : buildAction.type = `${cr}: ${type}`

	if (!path) {
		showError.path(path)
	}
	else {
		const {reducer, branch, func} = splitPath(path)
		buildAction.path = path
		buildAction.reducer = reducer
		buildAction.branch = branch
		buildAction.func = func
	}
	params === {} ? showError.params(params) :
		buildAction.params = params

	return store.dispatch(buildAction)
}

/**
 * setFetching - Синхронный экшен, который устанавливает параметр fetching в true или false
 * @param {string} branch - Ветка, куда нужно установить параметр (к примеру, tickets.actions)
 * @param {bool} status - Статус: true или false
 * @return {function} - Отправка action
 */
export const setFetching = (branch, status) => {
	const type = status === true ?
		`Начало загрузки ${branch}...` :
		`Завершение загрузки ${branch}...`
	send(type, `global`, `extend:${branch}`, {fetching: status})
}

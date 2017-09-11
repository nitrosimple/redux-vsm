import queryString from 'query-string'
import {isJson, isAO} from './utils/index'
import {send, setFetching} from './buildSyncAction'
let asyncActions = {}
let pendingMs = 15000
let currentUrl

/**
 * setPendingTimeout - устанавливает время ожидания обращения к серверу в ms (1000 = 1 сек)
 * @param {object} ms - объект из функций (асинхронные actions)
 */
export const setPendingTimeout = (ms) => {
	pendingMs = ms
}

/**
 * setAsyncActions - устанавливает асинхронныые actions (из внешнего приложения)
 * @param {object} actions - объект из функций (асинхронные actions)
 */
export const setAsyncActions = (actions) => {
	asyncActions = actions
}

/**
 * callAsync - вызывает нужный асинхронный action по type
 * @param {string} type - Название экшена (в классическом redux используются контанты)
 * @param {string} cr - Название контейнера (для удобства разработки)
 * @param {object} params - Параметры, которые будут передаваться в get или post запрос
 * @return {function} - Функция по нужному type
 */
export const callAsync = (type, cr, params) => {
	const fn = asyncActions[type]
	return fn ?
		fn(type, cr, params) :
		console.error(`VSM Async error`)
}

/* Основные настройки для header-а */
const commonParams = {
	cache: `no-cache`,
	credentials: `same-origin`,
	method: `post`,
	headers: {
		'Accept': `application/json`,
		'Content-Type': `application/json; charset=UTF-8`
	}
}

/**
 * sendAjaxError - Ошибка ajax запроса (обновление state)
 * @param {string} message - Сообщение об ошибке
 * @param {string} status - Статус ответа сервера
 * @param {string} url - URL, к которому идет запрос
 */
const sendError = (message, status, url, text) => {
	let setText = text.hasOwnProperty(`message`) ? text.message : JSON.stringify(text)
	send(`Ошибка при получении данных с сервера`, `global`,
		`extend:app.error`, {message, status, url, text: setText}
	)
}

/**
 * setBody - Проверка является ли текущий ответ(body) JSON или просто текст
 * @param {any} data - Body от сервера
 * @return {any} - Ошибка или ответ от сервера
 */
const setBody = (data) => {
	if (!data) {
		return ``
	}
	if (isJson(data)) {
		return JSON.parse(data)
	}
	else {
		return data
	}
}

/**
 * checkStatus - Проверка (выводится ли ответ от сервера при запросе)
 * Если ответа от сервера нет - то произойдет запись в state app.error
 * @param {object} response - Ответ от сервера
 * @return {any} - Ошибка или ответ от сервера
 */
function checkStatus(response, fetchingBranch) {
	if (response.status === 200 || response.status === 201 || response.status === 204) {
		currentUrl = response.url
		return response
	}
	else {
		// Если статус в ожидании - открыть окно с предупреждением
		if (response.status === 202) {
			let pendingEl = document.getElementById('pending')
			if (pendingEl !== null) pendingEl.className = 'show-pending'
		}
		// Если ошибки (40*-50* коды)
		else {
			sendError(response.statusText, response.status, response.url, response.body)
		}
		if (fetchingBranch) setFetching(fetchingBranch, false)
		throw new Error(response.body)
	}
}

/**
 * fetchData - Запрос на получение данных от сервера
 * @param {string} url - URL
 * @param {object} params - Настройки для header-а
 * @return {promise} - Promise (в данном случае для async/await функций)
 */
const fetchData = (url, params, fetchingBranch) => {
	// Блокировка окна когда идет загрузка
	let blockEl = document.getElementById('block-all')
	if (blockEl !== null) blockEl.className = 'block-all'
	if (fetchingBranch) setFetching(fetchingBranch, true)

	return new Promise((resolve, reject) => {
		let resp = {}
		fetch(url, params)
			.then(res => {
				resp = {
					statusText: res.statusText,
					status: res.status,
					url: res.url,
					ok: res.ok
				}
				return res.text()
			})
			.then(body => {
				resp.body = setBody(body)
				return checkStatus(resp, fetchingBranch)
			})
			.then(res => {
				// При загрузке данных - разблокировка
				if (blockEl !== null) blockEl.className='unblock-all'
				return resolve({body: res.body, status: res.status})
			})
			.catch(err => {
				// При загрузке данных - разблокировка
				if (blockEl !== null) blockEl.className='unblock-all'
				return reject(err)
			})
	})
}

/**
 * combineQueryString - Преобразование объекта в строку для GET или DELETE запроса
 * @param {string} url - URL
 * @param {object} params - объект для GET или DELETE запроса
 * @return {string} - Преобразованная строка
 */
const combineQueryString = (url, params) => {
	return params ? `${url}?${queryString.stringify(params)}` : url
}

/* Получение объекта с данными: url, params, fetchingBranch */
const getReqParams = (reqObj) => {
	let url, params, fetchingBranch
	url = (reqObj.hasOwnProperty('url')) ? reqObj.url : null
	if (url === null) console.log(`VSM: Не был передан обязательный параметр url`)

	params = (reqObj.hasOwnProperty('params')) ? reqObj.params : null
	fetchingBranch = (reqObj.hasOwnProperty('fetchingBranch')) ? reqObj.fetchingBranch : null

	return {url, params, fetchingBranch}
}

/* Функции: ajax.get, ajax.post, ajax.put и ajax.delete */
export const ajax = {
	get: (reqObj) => {
		const {url, params, fetchingBranch} = getReqParams(reqObj)
		const headerGet = Object.assign({}, commonParams,
			{method: `get`}
		)
		const buildUrl = combineQueryString(url, params)
		return fetchData(buildUrl, headerGet, fetchingBranch)
	},
	post: (reqObj) => {
		const {url, params, fetchingBranch} = getReqParams(reqObj)
		const headerPost = Object.assign({}, commonParams, {
			method: `post`,
			body: JSON.stringify(params)
		})
		return fetchData(url, headerPost, fetchingBranch)
	},
	put: (reqObj) => {
		const {url, params, fetchingBranch} = getReqParams(reqObj)
		const headerPut = Object.assign({}, commonParams, {
			method: `put`,
			body: JSON.stringify(params)
		})
		return fetchData(url, headerPut, fetchingBranch)
	},
	delete: (reqObj) => {
		const {url, params, fetchingBranch} = getReqParams(reqObj)
		const headerDelete = Object.assign({}, commonParams,
			{method: `delete`}
		)
		const buildUrl = combineQueryString(url, params)
		return fetchData(buildUrl, headerDelete, fetchingBranch)
	}
}

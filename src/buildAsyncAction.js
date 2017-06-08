import queryString from 'query-string'
import {isJson, isAO} from './utils/index'
import {send} from './buildSyncAction'
let asyncActions = {}
let currentUrl

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
	send(`Ошибка при получении данных с сервера`, `global`,
		`extend:app.error`, {
			data: {message, status, url, text: JSON.stringify(text)}
		}
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
function checkStatus(response) {
	if (!response.ok) {
		sendError(response.statusText, response.status, response.url, response.body)
		throw new Error(response.body)
	}
	else {
		currentUrl = response.url
		return response
	}
}

/**
 * fetchData - Запрос на получение данных от сервера
 * @param {string} url - URL
 * @param {object} params - Настройки для header-а
 * @return {promise} - Promise (в данном случае для async/await функций)
 */
const fetchData = (url, params) => {
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
				return checkStatus(resp)
			})
			.then(res => resolve({body: res.body, status: res.status}))
			// .then(data => {
			// 	if (isJson(data)) {
			// 		return resolve(JSON.parse(data))
			// 	}
			// 	else {
			// 		sendError(`Invalidate JSON`, 200, currentUrl)
			// 		throw new Error(`Invalidate JSON`)
			// 	}
			// })
			.catch(err => reject(err))
	})
}

/**
 * combineQueryString - Преобразование объекта в строку для GET или DELETE запроса
 * @param {string} url - URL
 * @param {object} params - объект для GET или DELETE запроса
 * @return {string} - Преобразованная строка
 */
const combineQueryString = (url, params) => {
	return params !== undefined ?
		`${url}?${queryString.stringify(params)}` : url
}

/* Функции: ajax.get, ajax.post, ajax.put и ajax.delete */
export const ajax = {
	get: (url, params) => {
		const headerGet = Object.assign({}, commonParams,
			{method: `get`}
		)
		const buildUrl = combineQueryString(url, params)
		return fetchData(buildUrl, headerGet)
	},
	post: (url, params) => {
		const headerPost = Object.assign({}, commonParams, {
			method: `post`,
			body: JSON.stringify(params)
		})
		return fetchData(url, headerPost)
	},
	put: (url, params) => {
		const headerPut = Object.assign({}, commonParams, {
			method: `put`,
			body: JSON.stringify(params)
		})
		return fetchData(url, headerPut)
	},
	delete: (url, params) => {
		const headerDelete = Object.assign({}, commonParams,
			{method: `delete`}
		)
		const buildUrl = combineQueryString(url, params)
		return fetchData(buildUrl, headerDelete)
	}
}

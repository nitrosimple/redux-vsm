import queryString from 'query-string'
import {send} from './buildSyncAction'

let asyncActions = {}
export const setAsyncActions = (actions) => {
	asyncActions = actions
}

// old: asyncAction
export const callAsync = (type, cr, params) => {
	const fn = asyncActions[type]
	return fn ?
		fn(type, cr, params) :
		console.error(`VSM Async error`)
}

const commonParams = {
	cache: `no-cache`,
	credentials: `same-origin`,
	method: `post`,
	headers: {
		'Accept': `application/json`,
		'Content-Type': `application/json; charset=UTF-8`
	}
}

function checkStatus(response) {
	if (!response.ok) {
		// response.statusText
		// response.url
		send(`Ошибка Ajax запроса`, `global`,
			`extend:table.settings.current`, {data: {page: 404}}
		)
		let error = new Error(response.statusText)
		error.response = response
		throw error
	}
	else {
		return response
	}
}

const fetchData = (url, params) => {
	return new Promise((resolve, reject) => {
		fetch(url, params)
			.then(checkStatus)
			.then(res => resolve(res.json()))
			.catch(err => reject(err))
	})
}

const mergeParams = (url, params) => {
	return params !== undefined ?
		`${url}?${queryString.stringify(params)}` : url
}

export const ajax = {
	get: (url, params) => {
		const headerGet = Object.assign({}, commonParams,
			{method: `get`}
		)
		const buildUrl = mergeParams(url, params)
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
		const buildUrl = mergeParams(url, params)
		return fetchData(buildUrl, headerDelete)
	}
}

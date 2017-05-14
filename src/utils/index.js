/**
 * isAO - Объект или массив
 * @param {any} entity - передаваемая сущность
 * @return {string} - array/object/other
 */
const isAO = (entity) => {
	const type = Object.prototype.toString.call(entity)
	return type === '[object Array]' ? 'array' :
		type === '[object Object]' ? 'object' : 'other'
}

/**
 * splitPath - Разделение пути, к примеру, extend:tickets.actions.settings
 * на функцию, редюсер и ветку. В данном случае функция - это extend,
 * редюсер/state - tickets, branch - actions.settings
 * @param {string} fullPath - инструкция/путь
 * @return {object} - Объект с разделениями
 */
export const splitPath = (fullPath) => {
	let params = {
		func: false,
		reducer: false,
		branch: false
	}
	if (fullPath.match(/\:/)) {
		let func = fullPath.split(`:`)[0]
		let path = fullPath.split(`:`)[1]
		params.func = func.length > 0 ?
			func :	false

		if (path.match(/\./)) {
			if (path.indexOf(`.`) > 0) {
				let arr = path.split(`.`)
				params.reducer = arr[0].length > 0 ?
					path.substr(0, path.indexOf(`.`)) : false
				params.branch = arr[1].length > 0 ?
					path.substr(path.indexOf(`.`) + 1) : false
			}
		}
		else {
			// Минимальное название редюсера = 2 символа
			if (path.length >= 2) {
				params.reducer = path
			}
		}
	}
	return params
}

/**
 * splitPath - Глубокое клонирование объекта
 * @param {object} obj - объект, который нужно клонировать
 * @return {object} - Клонированный объект
 */
export const cloneDeep = (obj) => {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * isJson - Проверка, что передаваемые данные - JSON объект
 * @param {string} str - строка данных
 * @return {boolean}
 */
export const isJson = (str) => {
	try {
		if(JSON.parse(str) instanceof Array ||
			JSON.parse(str) instanceof Object) {
			return true
		}
		else {
			return false
		}
	} catch (e) {
		return false
	}
}

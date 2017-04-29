// Разделение редюсера и ветки
export const splitPath = (fullPath) => {
	let params = {
		method: false,
		reducer: false,
		branch: false
	}

	if (fullPath.match(/\:/)) {
		let method = fullPath.split(`:`)[0]
		let path = fullPath.split(`:`)[1]

		params.method = method.length > 0 ?
			method :	false

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

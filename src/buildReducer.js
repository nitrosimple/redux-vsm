import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

let reducerFuncs = {}
export const setReducerFuncs = (funcs) => {
	reducerFuncs = funcs
}

export const getParams = (state, action) => {
	const {branch, params} = action
	const branchData = branch ? get(state, branch) : state
	return {
		branch,
		branchData,
		params
	}
}

// Отправка на выполнение конкретного метода редюсера
const modifyState = (state, action = {}) => {
	const fn = reducerFuncs[action.method]
	return fn ? fn(cloneDeep(state), action) : state
}

// Универсальный редюсер
export const createReducer = (initialState, reducer) => {
	return (state = initialState, action) => {
		if (action.reducer === reducer) {
			return modifyState(state, action)
		}
		return state
	}
}

// Обертка над всеми states
export const storeWrapper = (appStates) => {
	let wrapState = {}
	for (let key in appStates) {
		wrapState[key] = createReducer(appStates[key], key)
	}
	return wrapState
}

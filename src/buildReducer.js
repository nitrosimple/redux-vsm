import get from 'lodash.get'
import {cloneDeep} from './utils/index'
let reducerFuncs = {}

/**
 * setReducerFuncs - устанавливает универсальные функции для каждого из state/редюсеров
 * @param {object} funcs - объект из универсальных функций
 */
export const setReducerFuncs = (funcs) => {
	reducerFuncs = funcs
}

/**
 * getParams - получение параметров от объекта action, который приходит в
 * универсальную функцию
 * @param {any} state - state
 * @param {object} action - action
 * @return {object} - branch- путь/ветка, branchData - данные ветки,
 * params - параметры, которые нужно передать в универсальную функцию редюсера
 */
export const getParams = (state, action) => {
	const {branch, params} = action
	const branchData = branch ? get(state, branch) : state
	return {
		branch,
		branchData,
		params
	}
}

/**
 * modifyState - запускает нужную универсальную функцию редюсера
 * универсальную функцию
 * @param {any} state - state
 * @param {object} action - action
 * @return {any} - изменный state
 */
const modifyState = (state, action = {}) => {
	const fn = reducerFuncs[action.func]
	return fn ? fn(cloneDeep(state), action) : state
}

/**
 * createReducer - универсальная функция, которая создает универсальный
 * редюсер для каждого из state
 * @param {any} initialState - state
 * @param {string} reducer - название редюсера (передается при инициализации store)
 * @return {any} - изменный state
 */
export const createReducer = (initialState, reducer) => {
	return (state = initialState, action) => {
		if (action.reducer === reducer) {
			return modifyState(state, action)
		}
		return state
	}
}

/**
 * storeWrapper - оборачивает каждый из state в функцию createReducer
 * @param {object} appStates - изначальные states по умолчанию
 * @return {object} - готовый объект, который пойдет в функцию combineReducers
 */
export const storeWrapper = (appStates) => {
	let wrapState = {}
	for (let key in appStates) {
		wrapState[key] = createReducer(appStates[key], key)
	}
	return wrapState
}

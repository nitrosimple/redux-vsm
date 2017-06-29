/* redux-vsm - index.js */
import {storeWrapper, getParams, setReducerFuncs} from './buildReducer.js'
import {setSyncActions, callSync, send, setFetching, setStore} from './buildSyncAction.js'
import {setPendingTimeout, setAsyncActions, callAsync, ajax} from './buildAsyncAction.js'

/**
 * initialize - Устанавливает функции для универсальных редюсеров,
 * синхронные и асинхронные actions и store, время ожидания сервера,
 * которые используются во внешнем приложении
 *
 * @param data - объект
 * 	@data.pendingTime
 * 	@data.reducerFuncs
 * 	@data.syncActions
 * 	@data.asyncActions
 * 	@data.store
*/
const initialize = (data) => {
	setPendingTimeout(data.pendingTime)
	setReducerFuncs(data.reducerFuncs)
	setSyncActions(data.syncActions)
	setAsyncActions(data.asyncActions),
	setStore(data.store)
}

export {
	storeWrapper,
	getParams,
	callSync,
	callAsync,
	ajax,
	send,
	setFetching,
	initialize
}

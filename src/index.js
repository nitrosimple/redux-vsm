/* redux-vsm - index.js */
import {storeWrapper, getParams, setReducerFuncs} from './buildReducer.js'
import {setSyncActions, callSync, send, setFetching, setStore} from './buildSyncAction.js'
import {setAsyncActions, callAsync, ajax} from './buildAsyncAction.js'

/**
 * initialize - Устанавливает функции для универсальных редюсеров,
 * синхронные и асинхронные actions и store, которые используются
 * во внешнем приложении
 *
 * @param data - объект
 * 	@data.reducerFuncs
 * 	@data.syncActions
 * 	@data.asyncActions
 * 	@data.store
*/
const initialize = (data) => {
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

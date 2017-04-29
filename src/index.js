import {storeWrapper, getParams, setReducerFuncs} from './buildReducer.js'
import {setSyncActions, callSync, send, setFetching, setStore} from './buildSyncAction.js'
import {setAsyncActions, callAsync, ajax} from './buildAsyncAction.js'

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

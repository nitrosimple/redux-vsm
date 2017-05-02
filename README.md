# redux-vsm

Основной идеей данной библиотеки является создание универсальных функций, которые можно применять
по отношению к любому state приложения.

**Пример экшена:**
```js
send('Обновление пользователей', cr,
  `extend:users.engineers`, {
    data: {
      items: [{name: `Tom`, age: 25}],
      count: 1
    }
  }
)
```

## Настройка
```js
import {initialize} from 'redux-vsm'
import {syncActions} from './actions/sync'
import {asyncActions} from './actions/async'
import {reducerFuncs} from './reducers/reducerFuncs'

initialize({
	syncActions, // your sync actions
	asyncActions, // your async actions
	reducerFuncs, // universal reducer functions
	store // your redux store
})
```
Откуда берутся syncActions и asyncActions мы рассмотрим ниже.

<br />

## Начало работы с redux-vsm

Функция `send` использует функцию **store.dispatch**, которая есть в redux.
Отличие в том, что `send` немного расширяемая.

**Параметры:**
- `type` - тип экшена, который вызывается
- `cr` - контейнер, из которого вызывается данный action (для удобства разработки)
- `extend:users.engineers`
  - `extend` - название функции, которая "расширяет" или обновляет объект
  - `users` - название state в приложение над которым производится действие
  - `engineers` - ветка, в которой производится действие

Так как функция `extend` является универсальной - то можно её применить в любом state приложения:
```js
send('Обновление счетчика', cr,
  `extend:app.data`, {
    data: {
      count: 123
    }
  }
)
```
Функцию `send` можно вызывать из контейнеров при небольших приложениях, но все же это плохая
практика. Для этого есть специальные функции: `callSync` - для синхронных экшенов и `callAsync` для
асинхронных экшенов.

В контейнере можно произвести вызов экшена '*Обновление счетчика*':
```js
callSync(`Обновление счетчика`, cr, {count: 123})
```
`callSync` найдет данный type action-а и произведет выполнение нужного кода, который показан ниже.

<br />

**Пример синхронных actions:**
```js
export const syncActions = {
  'Обновление счетчика': (type, cr, params) => {
    send('Обновление счетчика', cr,
      `extend:app.data`, {
        data: {
          count: params.count
        }
      }
    )
  },
  `etc...`
}
```
<br />

**Пример асинхронных actions:**
```js
export const asyncActions = {
  'Getting tickets': async (type, cr) => {
    setFetching(`tickets.action`, true)
    const json = await ajax.get(`/api/v1/tickets`)

    send(type, cr,
      `extend:tickets`, {
        data: {
          data: {
            items: json,
            count: json.length
          },
          action: {fetching: false}
        }
      }
    )
  },
  'Getting users': async (type, cr) => {
    setFetching(`users.action`, true)
    const json = await ajax.get(`/api/v1/users`)

    send(type, cr,
      `extend:users`, {
        data: {
          data: {
            users: json,
          },
          action: {fetching: false}
        }
      }
    )
  }
}
```
<br />

**Пример универсальной функции extend:**
```js
export const reducerFuncs = {
  extend: (state, action) => {
    const {branch, branchData, params} = getParams(state, action)

    state = branch ?
      set(state, branch, deepExtend(branchData, params.data)) :
      deepExtend(branchData, params.data)

    return state
  },
  `etc...`
}
```

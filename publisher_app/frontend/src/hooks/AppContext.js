import { createContext } from 'react'

const AppContext = createContext()

export const AppContextProvider = props => {
  return (
    <AppContext.Provider value={{
        backendClient:props.backendClient,
      }}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContext
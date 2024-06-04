import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import { ChakraProvider } from '@chakra-ui/react'
import store from './store';
import { Provider } from 'react-redux';
import theme from "./theme"
ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme} resetCSS>
    <Provider store={store}>
      <App />
    </Provider>
  </ChakraProvider>
)


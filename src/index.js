import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ReactContextStoreProvider } from './react-context-store/src';
import reducers from './store/reducers';

ReactDOM.render(
  <React.StrictMode>
    <ReactContextStoreProvider
      reducers={reducers}
      name="root"
      otherData={{
        config: {
          postsPerPage: 2
        }
      }}
    >
      <App />
    </ReactContextStoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

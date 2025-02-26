import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App';
import { init } from '@three0dev/js-sdk';
import './App.css'
import { env } from './env';

init(env.three0Config)
	.then(() => {
		const container = document.querySelector('#root')
		const root = createRoot(container)
		// eslint-disable-next-line react/jsx-filename-extension
		root.render(<App />)
	})
	.catch(console.error)



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
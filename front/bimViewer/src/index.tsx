import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Router from "react-router-dom";
import { ViewerProvider } from './react-components/ReactContext';
import HomePage from './react-components/HomePage';
import * as OBC from "openbim-components";
import { IFCViewer } from './react-components/IFCViewer';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Router.BrowserRouter>
      <ViewerProvider>
        <Router.Routes>
          <Router.Route path='/' element={<HomePage />}></Router.Route>
          <Router.Route path='/project/:id' element={<IFCViewer />}></Router.Route>
        </Router.Routes>
      </ViewerProvider>
    </Router.BrowserRouter>
  </>
)

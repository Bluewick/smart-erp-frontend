import { useState } from 'react'
import Header from './components/Header'
import ListOfCompanies from './components/ListOfCompanies'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Header />
     <ListOfCompanies />
    </>
  )
}

export default App

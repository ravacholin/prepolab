import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <h1>PrepoLab</h1>
      <p>Laboratorio de preposiciones con enfoque cognitivo</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
        <Link to="/onboarding" style={{ padding: '1rem 2rem', backgroundColor: '#646cff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Comenzar
        </Link>
        
        <Link to="/lesson/b1/por-para" style={{ padding: '1rem 2rem', backgroundColor: '#646cff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Lección: Por vs Para
        </Link>
        
        <Link to="/review" style={{ padding: '1rem 2rem', backgroundColor: '#646cff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Repasar
        </Link>
      </div>
    </div>
  )
}

export default Home
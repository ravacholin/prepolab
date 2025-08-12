import { useParams } from 'react-router-dom'

function Lesson() {
  const { block, prep } = useParams()
  
  return (
    <div>
      <h1>Lección: {prep}</h1>
      <p>Bloque: {block}</p>
      
      <div>
        <h2>Actividades</h2>
        <p>Aquí aparecerán las actividades interactivas:</p>
        <ul>
          <li>Laboratorio de escenas</li>
          <li>Pares mínimos</li>
          <li>Input estructurado</li>
          <li>Producción</li>
        </ul>
      </div>
    </div>
  )
}

export default Lesson
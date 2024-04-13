import './App.css'
import {useState} from "react";

function App() {

  const [loading, setLoading] = useState(false)
  const [predict, setPredict] = useState({})

  const handleSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = {
      type: formData.get('type'),
      air_temperature: parseFloat(formData.get('air_temperature')),
      process_temperature: parseFloat(formData.get('process_temperature')),
      rotational_speed: parseFloat(formData.get('rotational_speed')),
      torque: parseFloat(formData.get('torque')),
      tool_wear: parseFloat(formData.get('tool_wear')),
      target: 1.0,
    }

    setLoading(true)

    const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        })

    setLoading(false)

    if (response.ok) {
        const result = await response.json()
        setPredict(result)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Qualidade da máquina:
          <select name="type">
            <option value="L">Baixa</option>
            <option value="M">Média</option>
            <option value="H">Alta</option>
          </select>
        </label>
        <label>
          Temperatura do ar (°C):
          <input type="number" name="air_temperature" min={23.15} max={32.35} step={0.5} />
        </label>
        <label>
          Temperatura do processo (°C):
          <input type="number" name="process_temperature" min={33.5} max={41.65} step={0.5} />
        </label>
        <label>
          Velocidade de rotação (rpm):
          <input type="number" name="rotational_speed" min={1168} max={2886} step={1} />
        </label>
        <label>
          Torque (Nm):
          <input type="number" name="torque" min={3.8} max={76.6} step={0.1} />
        </label>
        <label>
          Desgaste da ferramenta (min):
          <input type="number" name="tool_wear" min={0} max={253} step={1} />
        </label>
        <button type="submit">Submit</button>
      </form>

      {loading && <p>Loading...</p>}
      {!loading && predict && <p>{predict}</p>}
    </>
  )
}

export default App

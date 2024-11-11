import './App.css'
import {useEffect, useMemo, useState} from "react";

import {SelectButton} from "primereact/selectbutton";
import {InputNumber} from "primereact/inputnumber";
import {MappingMachineProblemCode} from "./constants/MappingMachineProblemCode.ts";
import {Card} from "primereact/card";
import { Chart } from 'primereact/chart';

function App() {

  const [loading, setLoading] = useState(false)

  const [machineDescription, setMachineDescription] = useState(
    {
      type: null,
      air_temperature: null,
      process_temperature: null,
      rotational_speed: null,
      torque: null,
      tool_wear: null
    }
  )

  const [predict, setPredict] = useState({
    "Sem falha": 0,
    "Falha de energia": 0,
    "Falha de desgaste da ferramenta": 0,
    "Falha por excesso de trabalho": 0,
    "Falhas diversas": 0,
    "Falha de dissipação de calor": 0,
  })

  const completedForm = useMemo(() => {
    return Object.values(machineDescription).every(value => value !== null)
  }, [machineDescription])

  useEffect(() => {

    const getPredict = async (data) => {
        return await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...data, target: 1.0})
        })
    }

    if (completedForm) {
        setLoading(true)
        getPredict(machineDescription).then((response) => {
            setLoading(false)

            if (response.ok) {
                response.json().then((result) => {
                    const flattenedResult = JSON.parse(result).flat();

                    const predict = flattenedResult.reduce((acc, value, index) => {
                        acc[MappingMachineProblemCode[index]] = value
                        return acc
                    }, {})
                    setPredict(predict)
                })
            }
        })
    }
  }, [machineDescription]);


  return (
    <Card title={"Predição de falhas em máquinas de fresagem"} style={{display: "flex", flexDirection: "row", gap: "1rem"}}>
        <form title={"Parâmetros da máquina"}>
            <label>
                Qualidade da máquina:
                <SelectButton
                    value={machineDescription.type}
                    onChange={(e) => setMachineDescription({...machineDescription, type: e.value})}
                    optionLabel="label"
                    options={[
                        {label: 'Baixa', value: 'L'},
                        {label: 'Média', value: 'M'},
                        {label: 'Alta', value: 'H'}
                    ]}/>
            </label>
            <label>
                Temperatura do ar (°C):
                <InputNumber
                    value={machineDescription.air_temperature}
                    onValueChange={(e) => {
                        e.preventDefault()
                        setMachineDescription({...machineDescription, air_temperature: e.value})
                    }}
                    mode={"decimal"}
                    min={23.15}
                    max={32.35}
                    step={0.5}
                    showButtons
                />
            </label>
            <label>
                Temperatura do processo (°C):
                <InputNumber
                    value={machineDescription.process_temperature}
                    onValueChange={(e) => setMachineDescription({...machineDescription, process_temperature: e.value})}
                    mode={"decimal"}
                    min={33.5}
                    max={41.65}
                    step={0.5}
                    showButtons
                />
            </label>
            <label>
                Velocidade de rotação (rpm):
                <InputNumber
                    value={machineDescription.rotational_speed}
                    onValueChange={(e) => setMachineDescription({...machineDescription, rotational_speed: e.value})}
                    mode={"decimal"}
                    min={1168}
                    max={2886}
                    step={1}
                    showButtons
                />
            </label>
            <label>
                Torque (Nm):
                <InputNumber
                    value={machineDescription.torque}
                    onValueChange={(e) => setMachineDescription({...machineDescription, torque: e.value})}
                    mode={"decimal"}
                    min={3.8}
                    max={76.6}
                    step={0.1}
                    showButtons
                />
            </label>
            <label>
                Desgaste da ferramenta (min):
                <InputNumber
                    value={machineDescription.tool_wear}
                    onValueChange={(e) => setMachineDescription({...machineDescription, tool_wear: e.value})}
                    mode={"decimal"}
                    min={0}
                    max={253}
                    step={1}
                    showButtons
                />
            </label>
        </form>
        <div>
            <Chart  type="bar" data={{
                labels: Object.keys(predict),
                datasets: [
                    {
                        label: 'Probabilidade de falha',
                        data: Object.values(predict),
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56'
                        ]
                    }
                ]
            }}/>
        </div>

    </Card>
  )
}

export default App

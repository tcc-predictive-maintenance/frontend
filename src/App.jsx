import './App.css'
import {useEffect, useMemo, useState} from "react";

import {SelectButton} from "primereact/selectbutton";
import {InputNumber} from "primereact/inputnumber";
import {MappingMachineProblemCode} from "./constants/MappingMachineProblemCode.ts";
import {Card} from "primereact/card";
import {Chart} from 'primereact/chart';
import {Divider} from 'primereact/divider';
import {Row} from "./style.jsx";

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
      return Object.values(machineDescription).every((value) => value !== null)
  }, [machineDescription])

  useEffect(() => {

    const getPredict = async (data) => {
        return await fetch(`http://${import.meta.env.VITE_SERVER_URL || '127.0.0.1:8000'}/predict`, {
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
  }, [completedForm, machineDescription]);


  return (
      <Card title={"Predição de falhas em máquinas de fresagem"} style={{
          display: "flex",
          gap: "1rem",
          alignSelf: "center",
          padding: "1rem",
          maxWidth: "50rem",
          margin: "2rem auto"
      }}>
        <form title={"Parâmetros da máquina"}>
            <Row>
                <label style={{flex: 1, marginRight: "1rem"}}>Qualidade da máquina:</label>
                <SelectButton
                    value={machineDescription.type}
                    onChange={(e) => setMachineDescription({...machineDescription, type: e.value})}
                    optionLabel="label"
                    options={[
                        {label: 'Baixa', value: 'L'},
                        {label: 'Média', value: 'M'},
                        {label: 'Alta', value: 'H'}
                    ]}/>
            </Row>
            <Row>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{flex: 1, marginRight: "1rem"}}>Temperatura do ar (°C):</label>
                    <sub style={{display: "flex", alignItems: "center"}}>23.15°C - 32.35°C</sub>
                </div>
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
                    style={{flex: 1, width: "100%"}}
                />
            </Row>
            <Row>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{flex: 1, marginRight: "1rem", width: "max-content"}}>Temperatura do processo
                        (°C):</label>
                    <sub style={{display: "flex", alignItems: "center"}}>33.5°C - 41.65°C</sub>
                </div>
                <InputNumber
                    value={machineDescription.process_temperature}
                    onValueChange={(e) => setMachineDescription({...machineDescription, process_temperature: e.value})}
                    mode={"decimal"}
                    min={33.5}
                    max={41.65}
                    step={0.5}
                    showButtons
                    style={{flex: 1, width: "100%"}}
                />
            </Row>
            <Row>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{flex: 1, marginRight: "1rem"}}>Velocidade de rotação (rpm):</label>
                    <sub style={{display: "flex", alignItems: "center"}}>1168rpm - 2886rpm</sub>
                </div>
                <InputNumber
                    value={machineDescription.rotational_speed}
                    onValueChange={(e) => setMachineDescription({...machineDescription, rotational_speed: e.value})}
                    mode={"decimal"}
                    min={1168}
                    max={2886}
                    step={1}
                    showButtons
                    style={{flex: 1, width: "100%"}}
                />
            </Row>
            <Row>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{flex: 1, marginRight: "1rem"}}>Torque (Nm):</label>
                    <sub style={{display: "flex", alignItems: "center"}}>3.8Nm - 76.6Nm</sub>
                </div>
                <InputNumber
                    value={machineDescription.torque}
                    onValueChange={(e) => setMachineDescription({...machineDescription, torque: e.value})}
                    mode={"decimal"}
                    min={3.8}
                    max={76.6}
                    step={0.1}
                    showButtons
                    style={{flex: 1, width: "100%"}}
                />
            </Row>
            <Row>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <label style={{flex: 1, marginRight: "1rem"}}>Desgaste da ferramenta (mm):</label>
                    <sub style={{display: "flex", alignItems: "center"}}>0mm - 253mm</sub>
                </div>
                <InputNumber
                    value={machineDescription.tool_wear}
                    onValueChange={(e) => setMachineDescription({...machineDescription, tool_wear: e.value})}
                    mode={"decimal"}
                    min={0}
                    max={253}
                    step={1}
                    showButtons
                    style={{flex: 1, width: "100%"}}
                />
            </Row>
        </form>

          <Divider orientation="vertical" flexItem/>

        <div>
            <h3>Resultados</h3>
        </div>

          {!completedForm ? <span>Preencha todos os campos para obter a predição</span> : ""}

          {completedForm &&
              (loading ? "Carregando..." :
                      <>
                          <div style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "0.5rem"
                          }}>
                              <span><b>Maior probabilidade de falha:</b> {Object.keys(predict).reduce((a, b) => predict[a] > predict[b] ? a : b)}</span>
                              <span><b>Probabilidade do evento:</b> {(Object.values(predict).reduce((a, b) => a > b ? a : b) * 100).toFixed()}%</span>
                          </div>

                          <Divider type="dashed"/>
                          <div>
                              <Chart type="bar" data={{
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
                              }}
                                     options={{
                                         indexAxis: 'x',
                                         responsive: true,
                                         maintainAspectRatio: true,
                                         scales: {
                                             x: {
                                                 beginAtZero: true
                                             },
                                         },
                                         plugins: {
                                             legend: {
                                                 display: false
                                             },
                                             tooltip: {
                                                 callbacks: {
                                                     label: function (context) {
                                                         var label = context.dataset.label || '';

                                                         if (label) {
                                                             label += ': ';
                                                         }
                                                         if (context.parsed.y !== null) {
                                                             label += context.parsed.y + '%';
                                                         }
                                                         return label;
                                                     }
                                                 }
                                             }
                                         },
                                     }}
                              />
                          </div>
                      </>
              )}
    </Card>
  )
}

export default App

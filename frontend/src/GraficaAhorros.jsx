import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ORDEN_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function GraficaAhorros({ datosGrafica = []}) {
  if (!Array.isArray(datosGrafica) || datosGrafica.length === 0) {
    return <p>Sin datos para graficar todavía.</p>;
  }

  // Ordenar cronológicamente según el nombre del mes
  const datosOrdenados = [...datosGrafica].sort((a, b) => {
    const idxA = ORDEN_MESES.indexOf(a.mes);
    const idxB = ORDEN_MESES.indexOf(b.mes);
    return idxA - idxB;
  });

  const data = {
    labels: datosOrdenados.map((item) => item.mes),
    datasets: [
      {
        label: 'Monto Total ($)',
        data: datosOrdenados.map((item) => item.MontoTotal),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite controlar el alto libremente con CSS
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Movimiento de ahorros del año',
      },
    },
  };

  return <div className="contenedor-canvas"><Line data={data} options={options} /></div>;
}

export default GraficaAhorros;

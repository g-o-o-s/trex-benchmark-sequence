'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { default as colors } from './colors.mjs';

export const ppsData = {
  tx_pps: [],
  rx_pps: [],
  delta: [],
};

export function drawGraph(data, title) {
  _ppsData.datasets[0].data = data.tx_pps;
  _ppsData.datasets[1].data = data.rx_pps;
  _ppsData.datasets[2].data = data.delta;

  ppsGraphConfig.data = _ppsData;

  ppsGraphConfig.options.plugins.title.text = title;

  // Do the graph
  const ppsCanvas = Canvas.createCanvas(2400, 800);
  const ppsCanvasContext = ppsCanvas.getContext('2d');
  const ppsGraph = new Chartjs.Chart(ppsCanvasContext, ppsGraphConfig);

  // Convert graph to base64 and set it up for being stuffed into a file
  const ppsGraphB64Data = ppsGraph.toBase64Image();
  const ppsGraphB64Image = ppsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');
  return ppsGraphB64Image;
}

const _ppsData = {
  datasets: [
    {
      label: 'tx_pps',
      order: 3,
      borderColor: colors.blue.line,
      backgroundColor: colors.blue.fill,
      fill: 'stack',
      yAxisID: 'yRight',
      data: [],
    },
    {
      label: 'rx_pps',
      order: 2,
      borderColor: colors.green.line,
      backgroundColor: colors.green.fill,
      fill: 'stack',
      yAxisID: 'yRight',
      data: [],
    },
    {
      label: 'delta',
      order: 1,
      borderColor: colors.yellow.line,
      backgroundColor: colors.yellow.fill,
      fill: 'stack',
      yAxisID: 'yRight',
      data: [],
    },
  ],
};

const ppsGraphConfig = {
  type: 'line',
  data: {},
  plugins: [],
  options: {
    plugins: {
      title: {
        display: true,
        text: '',
        font: {
          family: 'monospace',
          size: 30,
        },
      },
      legend: {
        position: 'top',
        align: 'left',
        labels: {
          boxWidth: 18,
          boxHeight: 18,
          font: {
            family: 'monospace',
            size: 28,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'monospace',
            size: 20,
          },
        },
        type: 'timeseries',
        time: {
          displayFormats: {
            millisecond: 'hh:mm:ss',
          },
          unit: 'millisecond',
          stepSize: 4000,
        },
      },
      yRight: {
        id: 'yRight',
        position: 'right',
        ticks: {
          font: {
            family: 'monospace',
            size: 24,
          },
        },
        type: 'linear',
        title: {
          text: 'Packets / Second',
          display: true,
          font: {
            family: 'monospace',
            size: 30,
          },
        },
      },
    },
  },
  layout: {
    padding: {
      top: 20,
      right: 20,
      left: 20,
      bottom: 20,
    },
  },
};

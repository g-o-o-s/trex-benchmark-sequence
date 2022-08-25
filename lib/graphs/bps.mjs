'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { default as colors } from './colors.mjs';

export const bpsData = {
  tx_bps: [],
  rx_bps: [],
  rx_drop_bps: [],
};

export function drawGraph(data, title) {
  _bpsData.datasets[0].data = data.tx_bps;
  _bpsData.datasets[1].data = data.rx_bps;
  _bpsData.datasets[2].data = data.rx_drop_bps;

  bpsGraphConfig.data = _bpsData;

  bpsGraphConfig.options.plugins.title.text = title;

  // Do the graph
  const bpsCanvas = Canvas.createCanvas(2400, 800);
  const bpsCanvasContext = bpsCanvas.getContext('2d');
  const bpsGraph = new Chartjs.Chart(bpsCanvasContext, bpsGraphConfig);

  // Convert graph to base64 and set it up for being stuffed into a file
  const bpsGraphB64Data = bpsGraph.toBase64Image();
  const bpsGraphB64Image = bpsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');
  return bpsGraphB64Image;
}

const _bpsData = {
  datasets: [
    {
      label: 'tx_bps',
      order: 3,
      borderColor: colors.blue.line,
      backgroundColor: colors.blue.fill,
      fill: 'stack',
      yAxisID: 'yRight',
      data: [],
    },
    {
      label: 'rx_bps',
      order: 2,
      borderColor: colors.green.line,
      backgroundColor: colors.green.fill,
      fill: 'stack',
      yAxisID: 'yRight',
      data: [],
    },
    {
      label: 'rx_drop_bps',
      order: 1,
      borderColor: colors.red.line,
      backgroundColor: colors.red.fill,
      fill: 'stack',
      yAxisID: 'yRight',
      data: [],
    },
  ],
};

const bpsGraphConfig = {
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
          text: 'Mbps',
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

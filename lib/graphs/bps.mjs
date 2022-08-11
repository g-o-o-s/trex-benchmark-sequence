'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';

export const bpsData = {
  tx_bps: [],
  rx_bps: [],
  rx_drop_bps: [],
};

export function drawGraph(data, title, config, profile) {
  _bpsData.datasets[0].data = data.tx_bps;
  _bpsData.datasets[1].data = data.rx_bps;
  _bpsData.datasets[2].data = data.rx_drop_bps;

  bpsGraphConfig.data = _bpsData;

  bpsGraphConfig.options.plugins.title.text = title;

  // do the graph
  const bpsCanvas = Canvas.createCanvas(2400,800);
  const bpsCanvasContext = bpsCanvas.getContext('2d');
  const bpsGraph = new Chartjs.Chart(
    bpsCanvasContext,
    bpsGraphConfig
  );

  // convert graph to base64 and set it up for being stuffed into a file
  const bpsGraphB64Data = bpsGraph.toBase64Image();
  const bpsGraphB64Image = bpsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');
  return bpsGraphB64Image;
}

const colors = {
  tx_bps: {
    line: "rgb(33, 131, 128)",
    fill: "rgba(33, 131, 128, 0.1)",
  },

  rx_bps: {
    line: "rgb(251, 177, 60)",
    fill: "rgba(251, 177, 60, 0.1)",
  },

  rx_drop_bps: {
    line: "rgb(216, 17, 89)",
    fill: "rgba(216, 17, 89, 0.1)",
  },
}

const _bpsData = {
  datasets: [
    {
      label: 'tx_bps',
      borderColor: colors.tx_bps.line,
      backgroundColor: colors.tx_bps.fill,
      fill: 'none',
      yAxisID: 'yRight',
      data: [],
    },
    {
      label: 'rx_bps',
      borderColor: colors.rx_bps.line,
      backgroundColor: colors.rx_bps.fill,
      fill: 'none',
      yAxisID: 'yRight',
      data: [],
    },
    {
      label: 'rx_drop_bps',
      borderColor: colors.rx_drop_bps.line,
      backgroundColor: colors.rx_drop_bps.fill,
      fill: 'none',
      yAxisID: 'yRight',
      data: [],
    }
  ]
};

const bpsGraphConfig = {
  type: 'line',
  data: {},
  options: {
    plugins: {
      title: {
        display: true,
        text: '',
        font: {
          family: "monospace",
          size: 30,
        }
      },
      legend: {
        position: 'top',
        align: 'left',
        labels: {
          boxWidth: 18,
          boxHeight: 18,
          font: {
            family: "monospace",
            size: 28,
          }
        }
      }
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
            family: "monospace",
            size: 20,
          },
        },
        type: 'timeseries',
        time: {
          displayFormats: {
            millisecond: 'hh:mm:ss'
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
            family: "monospace",
            size: 24,
          }
        },
        type: 'linear',
        title: {
          text: 'Mbps',
          display: true,
          font: {
            family: "monospace",
            size: 30,
          }
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      }
    }
  },
  layout: {
    padding: {
      top: 20,
      right: 20,
      left: 20,
      bottom: 20
    }
  },
};

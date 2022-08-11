'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';

export function drawGraph(data, title, config, profile) {
  flowsData.datasets[0].data = data.tx_cps;
  flowsData.datasets[1].data = data.active_flows;
  
  flowsGraphConfig.data = flowsData;

  flowsGraphConfig.options.plugins.title.text = title;

  // do the graph
  const flowsCanvas = Canvas.createCanvas(2400,800);
  const flowsCanvasContext = flowsCanvas.getContext('2d');
  const flowsGraph = new Chartjs.Chart(
    flowsCanvasContext,
    flowsGraphConfig
  );

  // convert graph to base64 and set it up for being stuffed into a file
  const flowsGraphB64Data = flowsGraph.toBase64Image();
  const flowsGraphB64Image = flowsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');
  return flowsGraphB64Image;
}

const colors = {
  tx_cps: {
    line: "rgb(216, 17, 89)",
    fill: "rgba(216, 17, 89, 0.1)",
  },

  active_flows: {
    line: "rgb(33, 131, 128)",
    fill: "rgba(33, 131, 128, 0.1)",
  },
}

const flowsData = {
  datasets: [
    {
      label: 'tx_cps',
      borderColor: colors.tx_cps.line,
      backgroundColor: colors.tx_cps.fill,
      fill: 'none',
      yAxisID: 'yLeft',
      data: [],
    },
    {
      label: 'active_flows',
      borderColor: colors.active_flows.line,
      backgroundColor: colors.active_flows.fill,
      fill: 'none',
      yAxisID: 'yRight',
      data: [],
    }
  ]
};

const flowsGraphConfig = {
  type: 'line',
  data: flowsData,
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
      yLeft: {
        id: 'yLeft',
        position: 'left',
        ticks: {
          font: {
            family: "monospace",
            size: 24,
          }
        },
        type: 'linear',
        title: {
          text: 'Connections / Second',
          display: true,
          font: {
            family: "monospace",
            size: 30,
          }
        }
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
          text: 'Active Flows',
          display: true,
          font: {
            family: "monospace",
            size: 30,
          }
        }
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

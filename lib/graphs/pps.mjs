'use strict';

import { default as Canvas } from 'canvas';
import { default as Chartjs } from 'chart.js';
import 'chartjs-adapter-date-fns';

export function drawGraph(data, title, config, profile) {
	ppsData.datasets[0].data = data.tx_pps;
	ppsData.datasets[1].data = data.rx_pps;
	
	ppsGraphConfig.data = ppsData;

  ppsGraphConfig.options.plugins.title.text = title;

	// do the graph
	const ppsCanvas = Canvas.createCanvas(2400,800);
	const ppsCanvasContext = ppsCanvas.getContext('2d');
	const ppsGraph = new Chartjs.Chart(
		ppsCanvasContext,
		ppsGraphConfig
	);

	// convert graph to base64 and set it up for being stuffed into a file
	const ppsGraphB64Data = ppsGraph.toBase64Image();
	const ppsGraphB64Image = ppsGraphB64Data.replace(/^data:image\/\w+;base64,/, '');
	return ppsGraphB64Image;
}

const colors = {
  tx_pps: {
    line: "rgb(216, 17, 89)",
		fill: "rgba(216, 17, 89, 0.1)",
  },

	rx_pps: {
    line: "rgb(33, 131, 128)",
    fill: "rgba(33, 131, 128, 0.1)",
  },
}

const ppsData = {
	datasets: [
		{
			label: 'tx_pps',
			borderColor: colors.tx_pps.line,
      backgroundColor: colors.tx_pps.fill,
			fill: 'none',
			yAxisID: 'yRight',
			data: [],
		},
		{
			label: 'rx_pps',
      borderColor: colors.rx_pps.line,
      backgroundColor: colors.rx_pps.fill,
			fill: 'none',
			yAxisID: 'yRight',
			data: [],
		},
	]
};

const ppsGraphConfig = {
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
					text: 'Packets / Second',
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


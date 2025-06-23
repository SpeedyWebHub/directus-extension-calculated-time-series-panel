import { definePanel } from '@directus/extensions-sdk';
import CalculatedTimeSeriesPanelComponent from './calculated-time-series-panel.vue';

export default definePanel({
	id: 'calculated-time-series',
	name: 'Calculated Time Series',
	icon: 'box',
	description: 'This is a flexible panel that can display a time series chart based on calculated values.',
	component: CalculatedTimeSeriesPanelComponent,
	options: [
		{
			field: 'fields',
			name: 'fields',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},
		{
			field: 'valueExpressions',
			name: 'Value expressions',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},
		{
			field: 'valueLabels',
			name: 'Value labels',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},
		{
			field: 'filters',
			name: 'filters',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},
		{
			field: 'chartType',
			name: 'Chart Type',
			type: 'string',
			meta: {
				interface: 'select-dropdown',
				options: {
					line: 'Line Chart',
					bar: 'Bar Chart',
				},
				width: 'half',
			},
			schema: {
				default_value: 'line',
			},
		},
		{
			field: 'timeFields',
			name: 'Time Fields',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},
		{
			field: 'precision',
			type: 'string',
			name: '$t:group_precision',
			meta: {
				interface: 'select-dropdown',
				width: 'half',
				options: {
					choices: [
						{
							text: 'Second',
							value: 'second',
						},
						{
							text: 'Minute',
							value: 'minute',
						},
						{
							text: 'Hour',
							value: 'hour',
						},
						{
							text: 'Day',
							value: 'day',
						},
						{
							text: 'Week',
							value: 'week',
						},
						{
							text: 'Month',
							value: 'month',
						},
						{
							text: 'Year',
							value: 'year',
						},
					],
				},
			},
			schema: {
				default_value: 'hour',
			},
		},
		// {
		// 	field: 'groupAggregation',
		// 	type: 'string',
		// 	name: '$t:group_aggregation',
		// 	meta: {
		// 		width: 'half',
		// 		interface: 'select-dropdown',
		// 		options: {
		// 			choices: [
		// 				{
		// 					text: 'Count',
		// 					value: 'count',
		// 				},
		// 				{
		// 					text: 'Count (Distinct)',
		// 					value: 'countDistinct',
		// 				},
		// 				{
		// 					text: 'Average',
		// 					value: 'avg',
		// 				},
		// 				{
		// 					text: 'Average (Distinct)',
		// 					value: 'avgDistinct',
		// 				},
		// 				{
		// 					text: 'Sum',
		// 					value: 'sum',
		// 				},
		// 				{
		// 					text: 'Sum (Distinct)',
		// 					value: 'sumDistinct',
		// 				},
		// 				{
		// 					text: 'Minimum',
		// 					value: 'min',
		// 				},
		// 				{
		// 					text: 'Maximum',
		// 					value: 'max',
		// 				},
		// 			],
		// 		},
		// 	},
		// },
		{
			field: 'colors',
			name: 'Colors',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
			},
		},
		{
			field: 'range',
			type: 'dropdown',
			name: '$t:date_range',
			schema: {
				default_value: '1 week',
			},
			meta: {
				interface: 'select-dropdown',
				width: 'half',
				options: {
					choices: [
						{
							text: 'Automatic (Based on data)',
							value: 'auto',
						},
						{
							text: 'Past 5 Minutes',
							value: '5 minutes',
						},
						{
							text: 'Past 15 Minutes',
							value: '15 minutes',
						},
						{
							text: 'Past 30 Minutes',
							value: '30 minutes',
						},
						{
							text: 'Past 1 Hour',
							value: '1 hour',
						},
						{
							text: 'Past 4 Hours',
							value: '4 hours',
						},
						{
							text: 'Past 1 Day',
							value: '1 day',
						},
						{
							text: 'Past 2 Days',
							value: '2 days',
						},
						{
							text: 'Past 1 Week',
							value: '1 week',
						},
						{
							text: 'Past 1 Month',
							value: '1 month',
						},
						{
							text: 'Past 3 Months',
							value: '3 months',
						},
					],
					allowOther: true,
				},
			},
		},
		{
			field: 'decimals',
			type: 'integer',
			name: '$t:value_decimals',
			meta: {
				interface: 'input',
				width: 'half',
				options: {
					placeholder: '$t:decimals_placeholder',
				},
			},
			schema: {
				default_value: 0,
			},
		},
		{
			field: 'min',
			type: 'integer',
			name: '$t:min_value',
			meta: {
				interface: 'input',
				width: 'half',
				options: {
					placeholder: '$t:automatic',
				},
			},
		},
		{
			field: 'max',
			type: 'integer',
			name: '$t:max_value',
			meta: {
				interface: 'input',
				width: 'half',
				options: {
					placeholder: '$t:automatic',
				},
			},
		},
	],
	minWidth: 12,
	minHeight: 8,
});

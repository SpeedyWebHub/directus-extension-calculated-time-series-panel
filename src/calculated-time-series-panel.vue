<script setup lang="ts">
import { onMounted, onUpdated, onBeforeUnmount, onUnmounted, ref, computed, watch, CSSProperties } from 'vue';
import { create, all } from 'mathjs';
import { get, groupBy } from 'lodash';
import ApexCharts from 'apexcharts';
import { useApi } from '@directus/extensions-sdk';
import { adjustDate } from './utils/adjust-date';

const math = create(all);
math.import({
  sum: arr => arr.map(x=>Number(x)).filter(x=>!isNaN(x)).reduce((a, b) => a + b, 0),
  avg: arr => arr.map(x=>Number(x)).filter(x=>!isNaN(x)).reduce((a, b) => a + b, 0) / arr.length,
        count: arr => arr.length,
        attr: (arr, key) => arr.map(obj => obj[key]),
        max: arr => Math.max(...arr.map(x=>Number(x)).filter(x=>!isNaN(x))),
        min: arr => Math.min(...arr.map(x=>Number(x)).filter(x=>!isNaN(x))),
        median: arr => {
                const sorted = arr.map(x=>Number(x)).filter(x=>!isNaN(x)).slice().sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },
        round: (value, precision = 0) => {
                const factor = Math.pow(10, precision);
                return Math.round(value * factor) / factor;
        },
        ceil: (value, precision = 0) => {
                const factor = Math.pow(10, precision);
                return Math.ceil(value * factor) / factor;
        },
        floor: (value, precision = 0) => {
                const factor = Math.pow(10, precision);
                return Math.floor(value * factor) / factor;
        },
        abs: value => Math.abs(value),
}, { override: true });

const api = useApi();
const isLoading = ref<boolean>(true);

function getOperands(props) {
	return props.fields ? props.fields.split(',').map(x => (()=>{const p=x.trim().split('.'); return {collectionName: p[0] ?? 'unknown', fieldName: p[1] ?? 'unknown'}})()) : [];
}

function sanitizeOperands(operands) {
	for (let i = 0; i < operands.length; i++) {
		operands[i].collectionName = operands[i].collectionName.replace(/[^0-9a-zA-Z_-]/g, '');
		operands[i].fieldName = operands[i].fieldName.replace(/[^0-9a-zA-Z_-]/g, '');
	}
}

const props = withDefaults(
	defineProps<{
		height: number;
		showHeader?: boolean;
		// data?: {
		// 	group: Record<string, number | string>;
		// 	count: Record<string, number>;
		// 	countDistinct: Record<string, number>;
		// 	avg: Record<string, number>;
		// 	avgDistinct: Record<string, number>;
		// 	sum: Record<string, number>;
		// 	sumDistinct: Record<string, number>;
		// 	min: Record<string, number>;
		// 	max: Record<string, number>;
		// }[];

		//id: string;
		now: Date;
		// collection: string;
		fields: string;
		valueExpressions: string;
		valueLabels: string;
		filters: string;
		chartType: string;
		timeFields: string;
		precision?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
		//groupAggregation: string;
		range: string;
		decimals?: number;
		min?: number;
		max?: number;

		// dateField: string;
		// valueField: string;
		// function: PanelFunction;
		// precision?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
		// range?: string;
		colors: string;
		// fillType?: string;
		// curveType?: string;
		// decimals?: number;
		// min?: number;
		// max?: number;
		// filter?: Filter;
		// showXAxis?: boolean;
		// showYAxis?: boolean;
		// missingData?: 'null' | 'ignore' | string;
	}>(),
	{
		showHeader: false,
		//data: () => [],
		precision: 'hour',
		//color: 'var(--theme--primary)',
		range: '1 week',
		//fillType: 'gradient',
		//curveType: 'smooth',
		decimals: 0,
		min: undefined,
		max: undefined,
		//filter: () => ({}),
		// showXAxis: true,
		// showYAxis: true,
		// missingData: 'null',
	},
);

//const { d, t, n } = useI18n();

const calculatedTimeSeriesEl = ref();
const chart = ref<ApexCharts>();

watch(
	[
		() => props.fields,
		() => props.valueExpressions,
		() => props.valueLabels,
		() => props.filters,
		() => props.chartType,
		() => props.timeFields,
		() => props.precision,
		() => props.range,
		() => props.decimals,
		() => props.min,
		() => props.max,
		() => props.colors,

		() => props.showHeader
	],
	async () => {
		chart.value?.destroy();
		await setUpChart();
	},
	{ deep: true },
);

onMounted(setUpChart);

onUnmounted(() => {
	chart.value?.destroy();
});

function formatDate(date: Date, precision: string): string {
	switch (precision) {
		case 'second': return date.toISOString().slice(0, 19).replace('T', ' ');
		case 'minute': return date.toISOString().slice(0, 16).replace('T', ' ');
		case 'hour': return date.toISOString().slice(0, 13).replace('T', ' ') + ':00';
		case 'day': return date.toISOString().slice(0, 10);
		case 'week': return `Week of ${date.toISOString().slice(0, 10)}`;
		case 'month': return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		case 'year': return `${date.getFullYear()}`;
		default: return date.toISOString();
	}
}

function generateCategories(precision: string, range: string): string[] {
	const now = new Date();
	const start = adjustDate(now, `-${range}`);
	if (!start) return [];

	const categories: string[] = [];
	let current = new Date(start);

	while (current <= now) {
		categories.push(formatDate(current, precision));

		// Use adjustDate to move forward one precision unit
		const next = adjustDate(current, `+1 ${precision}`);
		if (!next || next <= current) break; // avoid infinite loops
		current = next;
	}

	return categories;
}

/**
 * Returns an array of {timestampCategory, valueArray} objects,
 * where valueArray contains the values for each valueExpression that was evaluated 
 */
async function obtainMultiseries(operands) {
	const uniqueCollectionNames = [...new Set(operands.map(x => x.collectionName))];
	const collectionsLookup = {};
	
	for (const collectionName of uniqueCollectionNames) {
		console.log("filter for collectionName:", collectionName);
		console.log(JSON.parse(props.filters)[collectionName]);
		const data = [];
		const uniqueFieldNames = [...new Set(operands.filter(x => x.collectionName === collectionName).map(x => x.fieldName))];

		const timeFieldName = props.timeFields.split(',').map(x => x.trim()).find(field => field.startsWith(collectionName + '.'))?.split('.')[1] || 'created_on';
		if (timeFieldName) {
			if (!uniqueFieldNames.includes(timeFieldName)) {
				uniqueFieldNames.push(timeFieldName);
			}
		}

		const response = await api.get(`/items/${collectionName}`, {
			params: {
							limit: '-1',
							fields: uniqueFieldNames,
							filter: JSON.parse(props.filters)[collectionName] || {},
			},
		});
		response.data.data.forEach((item: Record<string, any>) => {
			const itemData = {};
			uniqueFieldNames.forEach(fieldName => {
				itemData[fieldName] = get(item, fieldName, null);
			});
			data.push(itemData);
		});
		collectionsLookup[collectionName] = data;
	}

	console.log("ABRACADABRA");
	console.log(collectionsLookup);
	console.log("ASASA");	
	
	// const _precision = 'hour';    // From your select
	// const _range = '2 days';      // From your select
	// const _categories = generateCategories(_precision, _range);
	// console.log("_Categories:", _categories);
	// console.log("BABABA");

	const categories = generateCategories(props.precision, props.range);
	console.log("Categories:", categories);
	const multiseries = [];



	// for (const category of categories) {
	// 	const filteredCollectionsLookup
	// }

	// for (const category of categories) {
	// 	const timestamp = new Date(category).getTime();
	// 	const valueArray = operands.map(operand => {
	// 		const collectionData = collectionsLookup[operand.collectionName] || [];
	// 		const fieldValues = collectionData.map(item => get(item, operand.fieldName, null));
	// 		const filteredValues = fieldValues.filter(value => value !== null && value !== undefined);
	// 		if (filteredValues.length === 0) return null;

	// 		// Evaluate the expression using mathjs
	// 		try {
	// 			return math.evaluate(operand.valueExpressions, { values: filteredValues });
	// 		} catch (error) {
	// 			console.error(`Error evaluating expression for ${operand.collectionName}.${operand.fieldName}:`, error);
	// 			return null;
	// 		}
	// 	});
	// 	multiseries.push({ category, valueArray });
	// }

	return multiseries;
}

async function setUpChart() { 
	isLoading.value = true;
	const operands = getOperands(props)
	sanitizeOperands(operands);
	console.log("Operands:", operands);
	const multiseries = await obtainMultiseries(operands);
	//isLoading.value = false;
	// chart.value = new ApexCharts(calculatedTimeSeriesEl.value, {
		//TODO
		//https://github.com/directus/directus/blob/main/app/src/panels/bar-chart/panel-bar-chart.vue
		//https://github.com/directus/directus/blob/main/app/src/panels/time-series/panel-time-series.vue
		//multiple bars and colors
	// });
}

</script>

<template>
	<!-- <div class="text" :class="{ 'has-header': showHeader }">
		{{ text }}
	</div> -->
	<div class="calculated-time-series">
		<p v-if="isLoading">Fetching data...</p>
		<div v-else ref="calculatedTimeSeriesEl" />
	</div>
</template>

<style scoped>
.calculated-time-series {
	width: 100%;
	height: 100%;
}
</style>
<!-- <style>
.apexcharts-tooltip.apexcharts-theme-light {
	border-color: var(--theme--form--field--input--border-color) !important;
}

.apexcharts-tooltip.apexcharts-theme-light .apexcharts-tooltip-title {
	border-color: var(--theme--form--field--input--border-color) !important;
	margin-bottom: 0;
	padding: 0 4px;
	font-weight: 600 !important;
	font-size: 10px !important;
	background-color: var(--theme--background-subdued) !important;
}

.apexcharts-tooltip-y-group {
	padding: 0 0 0 4px;
	font-weight: 600 !important;
	font-size: 10px !important;
}

.apexcharts-tooltip-series-group {
	background-color: var(--theme--background-normal) !important;
	padding: 0;
}

.apexcharts-tooltip-series-group:last-child {
	padding-bottom: 0;
}
</style> -->
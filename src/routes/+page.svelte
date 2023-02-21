<script lang="ts">
	import DataTable, { Head, Body, Row, Cell, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { processResults, text2Kebab, capitalize } from '../preprocessing';
	import { onMount } from 'svelte';

	// Attributes
	const DATABASE_URL = 'https://csc-566-benchmarks-default-rtdb.firebaseio.com/';
	let benchmarkData: BenchmarkDatabase | null = null;
	let tableInfo: TableInfo;
	let benchmarkSessions: string[] = ['Benchmark 2', 'Benchmark 3'];
	let activeBenchmarkSession: string = benchmarkSessions[0];
	let sort: string = 'username';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	$: tableInfo =
		benchmarkData != null && text2Kebab(activeBenchmarkSession) in benchmarkData
			? processResults(benchmarkData[text2Kebab(activeBenchmarkSession)])
			: { labels: [], rows: [] };

	// Hooks
	onMount(getBenchmarkData);
	console.log(activeBenchmarkSession, tableInfo);

	// Logic
	async function getBenchmarkData() {
		let benchmarks = await Promise.all(
			benchmarkSessions.map(text2Kebab).map((session) =>
				fetch(DATABASE_URL + session + '.json', { method: 'GET' })
					.then((res) => res.json())
					.then((json) => [session, json])
			)
		);
		let data = Object.fromEntries(
			benchmarks.filter(([_, json]) => json != null)
		) as BenchmarkDatabase;
		benchmarkData = data;
	}

	function handleSort() {
		let sortedRows = tableInfo.rows.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return aVal.localeCompare(bVal);
			}
			return Number(aVal) - Number(bVal);
		});
		tableInfo.rows = sortedRows;
	}
</script>

<main>
	<h1>CSC 566 Benchmark Results</h1>
	<TabBar tabs={benchmarkSessions} bind:active={activeBenchmarkSession} let:tab>
		<Tab {tab}>
			<Label>{tab}</Label>
		</Tab>
	</TabBar>
	{#if benchmarkData != null}
		<DataTable
			table$aria-label="CSC 566 Benchmark Results"
			style="max-width: 100%;"
			sortable
			bind:sort
			bind:sortDirection
			on:SMUIDataTable:sorted={handleSort}
		>
			<Head>
				<Row>
					{#each tableInfo.labels as label}
						<Cell columnId={label}>
							<Label
								>{label
									.split(/[ _-]+/)
									.map(capitalize)
									.join(' ')}</Label
							>
							<IconButton class="material-icons">arrow_upward</IconButton>
						</Cell>
					{/each}
				</Row>
			</Head>
			<Body>
				{#each tableInfo.rows as row}
					<Row>
						{#each tableInfo.labels as label}
							<Cell>{row[label] || ' '}</Cell>
						{/each}
					</Row>
				{/each}
			</Body>
		</DataTable>
	{:else}
		<p style="color: red">Could not load data</p>
	{/if}
</main>

<style>
	main {
		padding: 30px;
		display: flex;
		justify-content: center;
		flex-direction: column;
	}

	h1 {
		margin: auto;
		margin-bottom: 40px;
		margin-top: 30px;
	}
</style>

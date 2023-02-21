// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
		type Entry = {
			username: string;
			timestamp: number;
			datasets: { [dataset: string]: { [metric: string]: number | string } };
		};
		type BenchmarkDatabase = { [benchmarkSession: string]: { [uuid: string]: Entry } };
	
		type TableInfo = { labels: string[]; rows: { [label: string]: any }[] };
}

export {};

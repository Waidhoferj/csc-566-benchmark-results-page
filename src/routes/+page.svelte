<script lang="ts">

	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    type Metrics = {accuracy: number, runtime: number}
    type Entry = {username: string, timestamp: number, datasets: {[dataset:string] : Metrics}}
    type EntryLog = {[uuid:string]: Entry}

    type TableInfo = {labels:string[], rows: {[label:string]: any}[]}

    const DATABASE_URL = "https://csc-566-benchmarks-default-rtdb.firebaseio.com/"
    const BENCHMARK_PATH = "benchmark-2.json"

    async function getResults():Promise<TableInfo> {
        let res = await fetch(DATABASE_URL + BENCHMARK_PATH, {method: "GET"})
        let entryLog = await res.json() as EntryLog
        return processResults(entryLog)
    }

    function processResults(results: EntryLog):TableInfo  {
        // bin each by username, replacing with the largest timestamp
        let entriesByUser =  Object.values(results).reduce((acc, entry) => {
            const oldTimestamp = acc[entry.username]?.timestamp || 0
            
            if (oldTimestamp < entry.timestamp) {
                acc[entry.username] = entry
            }
            return acc
        }, {} as {[user:string]: Entry})

        // Collect headers and flatten info into rows
        let {headers, rows} = Object.values(entriesByUser).reduce((acc, entry) => {
            let row: {[label:string]: number | string} = {username: entry.username}
            
            for (let dataset in entry.datasets) {
                for (let [metric, value] of Object.entries(entry.datasets[dataset])) {
                    let label = `${dataset} ${metric}`
                    acc.headers.add(label)
                    row[label] = value
                }
            }
            acc.rows.push(row)
            return acc
        }, {headers: new Set<string>(), rows: [] as {[label:string]: any}[]})
        
        const labels = Array.from(headers).sort()
        labels.unshift("username")
        return {labels, rows}
        
    }


    let resultsPromise = getResults()

</script>

<main>

    <h1>CSC 566 Benchmark Results</h1>
    {#await resultsPromise}
{:then tableInfo}
<DataTable table$aria-label="CSC 566 Benchmark Results" style="max-width: 100%;">
	<Head>
		<Row>
                {#each tableInfo.labels as label}
                <Cell>{label}</Cell>
                {/each}
		</Row>
	</Head>
	<Body>
        {#each tableInfo.rows as row}
            <Row>
                {#each tableInfo.labels as label}
                <Cell>{row[label] || " "}</Cell>
                {/each}
            </Row>
	    {/each}
	</Body>
</DataTable>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

</main>





<style>
main {
    padding: 30px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

h1 {
    margin:auto;
    margin-bottom: 40px;
    margin-top: 30px;
}


</style>